import React, { createContext, useContext, useState } from 'react';
import { BoardHeader } from '@mosaiq/terrazzo-common/types';

type TRZContextType = {
    navbarHeight: number;
    boardHeader: BoardHeader | undefined;
    setBoardHeader: React.Dispatch<React.SetStateAction<BoardHeader | undefined>>;
}

const TRZContext = createContext<TRZContextType | undefined>(undefined);

const TRZProvider: React.FC<any> = ({ children }) => {
    const [navbarHeight, setNavbarHeight] = useState<number>(50);
    const [boardHeader, setBoardHeader] = useState<BoardHeader | undefined>(undefined);

    return (
        <TRZContext.Provider value={{
            navbarHeight,
            boardHeader,
            setBoardHeader
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