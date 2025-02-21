import React, { createContext, useContext, useState } from 'react';
import { revokeUserAccessToGithubAuth, tryLoginWithGithub } from './githubAuth';
import { readSessionStorageValue, useSessionStorage } from '@mantine/hooks';
import { LocalStorageKey } from '@mosaiq/terrazzo-common/constants';

type TRZContextType = {
    githubAuthToken: string | null;
    githubData: any | null;
    githubLogin: (code: string | undefined) => Promise<{route:string, success:boolean}>;
    logoutAll: () => void;
    isVisible: boolean;
    openSettings: (boolean) => void;
}

const TRZContext = createContext<TRZContextType | undefined>(undefined);

export const DEFAULT_AUTHED_ROUTE = "/dashboard";
export const DEFAULT_NO_AUTH_ROUTE = "/login"

const TRZProvider: React.FC<any> = ({ children }) => {
    const [githubAuthToken, setGithubAuthToken] = useState<string | null>(null);
    const [githubData, setGithubData] = useState<any | null>(null);
    const [isVisible, setVisible] = useState<boolean>(false);
    const [loginRouteDestination, setLoginRouteDestination] = useSessionStorage({ key: "loginRouteDestination" });

    const githubLogin = async (code: string | undefined): Promise<{route:string, success:boolean}> => {
        if(githubAuthToken && githubData){
            return {route: window.location.pathname, success: true};
        }
        const {authToken, data} = await tryLoginWithGithub(code);
        if(!authToken || !data) {
            setLoginRouteDestination(window.location.pathname);
            return {route: DEFAULT_NO_AUTH_ROUTE, success:false};
        }

        setGithubAuthToken(authToken);
        setGithubData(data);

        const route = readSessionStorageValue({key: "loginRouteDestination"});
        setLoginRouteDestination('');
        return {route:(route as string) || DEFAULT_AUTHED_ROUTE, success:true};
    }

    const logoutAll = async () => {
        if(githubAuthToken) {
            await revokeUserAccessToGithubAuth(githubAuthToken);
        }
        localStorage.removeItem(LocalStorageKey.GITHUB_ACCESS_TOKEN);
        setGithubAuthToken(null);
        setGithubData(null);

        window.location.pathname = DEFAULT_NO_AUTH_ROUTE;
    }

    const openSettings = async () => {
        setVisible(prev => !prev);
    }

    return (
        <TRZContext.Provider value={{
            githubAuthToken,
            githubData,
            githubLogin,
            logoutAll,
            isVisible, 
            openSettings
        }}>
            {children}
        </TRZContext.Provider>
    )
};

const useTRZ = () => {
    const context = useContext(TRZContext);
    if (context === undefined) {
        throw new Error('useTRZ must be used within a TRZProvider');
    }
    return context;
}

export { TRZProvider, useTRZ };