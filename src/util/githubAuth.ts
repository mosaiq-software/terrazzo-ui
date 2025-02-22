import queryString from "query-string";
import { callTrzApi } from "./apiUtils";
import { LocalStorageKey } from "@mosaiq/terrazzo-common/constants";
import { NoteType, notify } from "./notifications";
import { readSessionStorageValue } from "@mantine/hooks";

/*
    Returns the URL to redirect to for GitHub login.
*/
export const getGithubLoginUrl = () => {
    const client_id = process.env.GITHUB_AUTH_CLIENT_ID;
    const redirect_uri = process.env.GITHUB_AUTH_CALLBACK_URL;
    const scope = ['read:user', 'user:email', 'read:org'].join(' ');
    const allow_signup = true;

    if (!client_id || !redirect_uri) {
        throw new Error("Missing required environment variables for GitHub OAuth");
    }

    const params = queryString.stringify({ client_id, redirect_uri, scope, allow_signup });
    const baseUrl = "https://github.com/login/oauth/authorize?";
    return `${baseUrl}${params}`;
};

/*
    Get the user's access token from GitHub using the one-time code from the URL.
*/
export const getUserAccessTokenFromGithub = async (code: string) => {
    try {
        const {json, status} = await callTrzApi(`/user/github/auth?code=${code}`, "GET");
        if(status !== 200){
            throw new Error("Invalid status code "+status);
        }
        return (json?.access_token);
    } catch (error) {
        console.error("Error fetching user access token from GitHub", error);
        notify(NoteType.GITHUB_AUTH_ERROR);
        return null;
    }
}
/*
    Get the user's data from GitHub using the access token.
*/
export const getUserDataFromGithub = async (accessToken: string) => {
    try {
        const {json, status} = await callTrzApi(`/user/github/userdata?access_token=${accessToken}`, "GET");
        if(status !== 200){
            throw new Error("Invalid status code "+status);
        }
        return (json);
    } catch (error) {
        console.error("Error fetching user data from GitHub", error);
        notify(NoteType.GITHUB_DATA_ERROR);
        return null;
    }
}

/*
    Used on app load. Check if there is a saved access token in local storage and try to log in with it.
*/
export const tryLoginWithGithub = async (callbackCode?:string): Promise<{authToken:string|null, data:any}> => {
    let authToken;
    let fromLocal = false;
    if(callbackCode) {
        authToken = await getUserAccessTokenFromGithub(callbackCode);
    }
    if(!authToken) {
        authToken = localStorage.getItem(LocalStorageKey.GITHUB_ACCESS_TOKEN);
        fromLocal = true;
        if (!authToken) {
            return {authToken: null, data: null};
        }
    }
    const data = await getUserDataFromGithub(authToken);
    if (!data) {
        return {authToken: null, data: null};
    }
    const remember = readSessionStorageValue({key: "remember-me"});
    if(remember === "true" || fromLocal){
        localStorage.setItem(LocalStorageKey.GITHUB_ACCESS_TOKEN, authToken);
    } else {
        localStorage.removeItem(LocalStorageKey.GITHUB_ACCESS_TOKEN);
    }
    return {authToken, data};
}

/*
    Get the user's access token from GitHub using the one-time code from the URL.
*/
export const revokeUserAccessToGithubAuth = async (access_token: string) => {
    try {
        if(!access_token){
            return;
        }
        const {json, status} = await callTrzApi(`/user/github/revoke/${access_token}`, "DELETE");
        if(status !== 200){
            throw new Error("Invalid status code "+status);
        }
    } catch (error) {
        console.error("Error revoking user access from GitHub", error);
        notify(NoteType.GITHUB_AUTH_ERROR);
        return null;
    }
}