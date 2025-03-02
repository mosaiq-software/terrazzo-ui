import React, {createContext, useState} from 'react';
import {User, UserHeader} from "@mosaiq/terrazzo-common/types";
import { revokeUserAccessToGithubAuth, tryLoginWithGithub } from '../util/githubAuth';
import { readSessionStorageValue, useSessionStorage } from '@mantine/hooks';
import { LocalStorageKey } from '@mosaiq/terrazzo-common/constants';
import { useNavigate } from 'react-router-dom';
import { NoteType, notify } from '@trz/util/notifications';
import { setUpUserData } from '@trz/util/userUtils';

type UserContextType = {
    githubAuthToken: string | null;
    githubLogin: (code: string | undefined) => Promise<void>;
    logoutAll: () => void;
    userData: UserHeader | null;
    setUser: (newUser: User) => void;
    setUpAccount: (username: string, firstName: string, lastName: string) => Promise<void>;
}
const UserContext = createContext<UserContextType | undefined>(undefined);

export const FINISH_ACCOUNT_CREATION_ROUTE = "/create-account";
export const DEFAULT_AUTHED_ROUTE = "/dashboard";
export const DEFAULT_NO_AUTH_ROUTE = "/login"

const UserProvider: React.FC<any> = ({ children }) => {
    const [githubAuthToken, setGithubAuthToken] = useState<string | null>(null);
    const [loginRouteDestination, setLoginRouteDestination] = useSessionStorage<string | null>({ key: "loginRouteDestination" });
    const [userData, setUser] = useState<UserHeader | null>(null);
    const navigate = useNavigate();

    const githubLogin = async (code: string | undefined): Promise<void> => {
        // check if user is already logged in - passthrough
        console.log(githubAuthToken, userData);
        if(githubAuthToken && userData?.id){
            console.log("skip")
            return;
        }
        
        // try and log them in using the code or saved token
        const {authToken, user} = await tryLoginWithGithub(code);
        if(!authToken || !user) {
            setLoginRouteDestination(window.location.pathname);
            console.log("saved to ", window.location.pathname);
            navigate(DEFAULT_NO_AUTH_ROUTE);
            notify(NoteType.GITHUB_AUTH_ERROR);
            return;
        }

        setGithubAuthToken(authToken);
        console.log("user", user);
        setUser(user);

        if(!user.firstName?.length || !user.lastName?.length){
            //Account not set up yet
            setLoginRouteDestination(window.location.pathname);
            console.log("saved to 2", window.location.pathname);
            navigate(FINISH_ACCOUNT_CREATION_ROUTE);
            return;
        }

        // Account is set up and logged in
        const route = readSessionStorageValue<string | null>({key: "loginRouteDestination"});
        setLoginRouteDestination(null);
        console.log("dir to route 1",route);
        navigate(route || DEFAULT_AUTHED_ROUTE);
    }


    const logoutAll = async () => {
        if(githubAuthToken) {
            await revokeUserAccessToGithubAuth(githubAuthToken);
        }
        localStorage.removeItem(LocalStorageKey.GITHUB_ACCESS_TOKEN);
        setGithubAuthToken(null);
        navigate(DEFAULT_NO_AUTH_ROUTE);
    }

    const setUpAccount = async (username:string, firstName:string, lastName:string) => {
        if(!userData){
            throw new Error("No user found");
        }
        await setUpUserData(userData.id, username, firstName, lastName);
        setUser({ ...userData, username, firstName, lastName })
        const route = readSessionStorageValue<string | null>({key: "loginRouteDestination"});
        setLoginRouteDestination(null);
        console.log("dir to route 2",route);
        navigate(route || DEFAULT_AUTHED_ROUTE);
    }

    return (
        <UserContext.Provider value={{
            githubAuthToken,
            githubLogin,
            logoutAll,
            userData,
            setUser,
            setUpAccount
        }}>
            {children}
        </UserContext.Provider>
    );
}

const useUser = () => {
    const context = React.useContext(UserContext);
    if (context === undefined) {
        throw new Error('useUser must be used within a UserProvider');
    }
    return context;
}

export { UserProvider, useUser };
