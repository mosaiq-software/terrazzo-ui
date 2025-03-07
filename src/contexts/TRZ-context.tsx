import React, { createContext, useContext, useState } from 'react';
import { CardId } from '@mosaiq/terrazzo-common/types';

type TRZContextType = {
    navbarHeight: number;
}

const TRZContext = createContext<TRZContextType | undefined>(undefined);

const TRZProvider: React.FC<any> = ({ children }) => {
    const [navbarHeight, setNavbarHeight] = useState<number>(50);

    return (
        <TRZContext.Provider value={{
            navbarHeight
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