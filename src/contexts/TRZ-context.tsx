import React, { createContext, useContext, useState } from 'react';
import { CardId } from '@mosaiq/terrazzo-common/types';

type TRZContextType = {
    openedCardModal: CardId | null;
    setOpenedCardModal: React.Dispatch<React.SetStateAction<CardId | null>>;
}

const TRZContext = createContext<TRZContextType | undefined>(undefined);

const TRZProvider: React.FC<any> = ({ children }) => {
    const [openedCardModal, setOpenedCardModal] = useState<CardId | null>(null);

    return (
        <TRZContext.Provider value={{
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