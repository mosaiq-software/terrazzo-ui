import queryString from "query-string";
import axios from "axios";
import { callTrzApi, getApiUrl } from "./apiUtils";

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

export const getUserDataFromGithub = async (code: string) => {
    // send a request to apiurl/githubLogin with the code as a query parameter
    try {
        const response = await callTrzApi(`/user/githubLogin?code=${code}`, "GET");
        return (response?.data);
    } catch (error) {
        console.error("Error fetching user data from GitHub", error);
        return null;
    }
}