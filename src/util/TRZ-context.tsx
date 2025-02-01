import React, { createContext, useContext, useState } from 'react';

type TRZContextType = {
    githubAuthToken: string | null;
    setGithubAuthToken: (code: string) => void;
    githubData: any | null;
    setGithubData: (data: any) => void;
}

const TRZContext = createContext<TRZContextType | undefined>(undefined);


const TRZProvider: React.FC<any> = ({ children }) => {
    const [githubAuthToken, setGithubAuthToken] = useState<string | null>(null);
    const [githubData, setGithubData] = useState<any | null>(null);

    return (
        <TRZContext.Provider value={{
            githubAuthToken,
            setGithubAuthToken,
            githubData,
            setGithubData,
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