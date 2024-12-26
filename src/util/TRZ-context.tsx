import React, { createContext, useContext, useState } from 'react';

type TRZContextType = {

}

const TRZContext = createContext<TRZContextType | undefined>(undefined);


const TRZProvider: React.FC<any> = ({ children }) => {
    
    return (
        <TRZContext.Provider value={{
            
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