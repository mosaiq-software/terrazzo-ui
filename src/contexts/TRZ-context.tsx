import React, { createContext, useContext, useState } from 'react';
import { CardId } from '@mosaiq/terrazzo-common/types';

type TRZContextType = {
    openedCardModal: CardId | null;
    setOpenedCardModal: React.Dispatch<React.SetStateAction<CardId | null>>;
    navbarHeight: number;
}

const TRZContext = createContext<TRZContextType | undefined>(undefined);

const TRZProvider: React.FC<any> = ({ children }) => {
    const [openedCardModal, setOpenedCardModal] = useState<CardId | null>(null);
    const [navbarHeight, setNavbarHeight] = useState<number>(50);

    return (
        <TRZContext.Provider value={{
            openedCardModal,
            setOpenedCardModal,
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