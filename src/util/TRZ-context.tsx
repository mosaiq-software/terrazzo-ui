import React, { createContext, useContext, useState } from 'react';
import { revokeUserAccessToGithubAuth, tryLoginWithGithub } from './githubAuth';
import { readSessionStorageValue, useSessionStorage } from '@mantine/hooks';
import { LocalStorageKey } from '@mosaiq/terrazzo-common/constants';

type TRZContextType = {
    githubAuthToken: string | null;
    githubData: any | null;
    setGithubData: React.Dispatch<React.SetStateAction<any>>
    githubLogin: (code: string | undefined) => Promise<{route:string, success:boolean, id?:string}>;
    logoutAll: () => void;
    openedCardModal: string | null;
    setOpenedCardModal: React.Dispatch<React.SetStateAction<string | null>>;
}

const TRZContext = createContext<TRZContextType | undefined>(undefined);

export const DEFAULT_AUTHED_ROUTE = "/dashboard";
export const DEFAULT_NO_AUTH_ROUTE = "/login"

const TRZProvider: React.FC<any> = ({ children }) => {
    const [githubAuthToken, setGithubAuthToken] = useState<string | null>(null);
    const [githubData, setGithubData] = useState<any | null>(null);
    const [loginRouteDestination, setLoginRouteDestination] = useSessionStorage({ key: "loginRouteDestination" });

    const [openedCardModal, setOpenedCardModal] = useState<string | null>(null);

    const githubLogin = async (code: string | undefined): Promise<{route:string, success:boolean, id?:string}> => {
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
        return {route:(route as string) || DEFAULT_AUTHED_ROUTE, success:true, id:data.id};
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

    return (
        <TRZContext.Provider value={{
            githubAuthToken,
            githubData,
            setGithubData,
            githubLogin,
            logoutAll,
            openedCardModal,
            setOpenedCardModal,
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