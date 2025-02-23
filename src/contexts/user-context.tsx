import React, {createContext, useEffect, useState} from 'react';
import {User} from "@mosaiq/terrazzo-common/types";
import {DEFAULT_AUTHED_ROUTE, DEFAULT_NO_AUTH_ROUTE, useTRZ} from "@trz/util/TRZ-context";
import {useSocket} from "@trz/util/socket-context";

type UserContextType = {
    userData: User | null;
    updateUser: (newUser: User) => void;
    checkForUser: () => Promise<{userRoute:string}>;
}
const UserContext = createContext<UserContextType | undefined>(undefined);

export const FINISH_ACCOUNT_CREATION_ROUTE = "/create-account";

const UserProvider: React.FC<any> = ({ children }) => {
    const [userData, setUser] = useState<User | null>(null);
    const trz = useTRZ();
    const sockCtx = useSocket();

    const updateUser = (newUser: User) => {
        setUser(newUser);
    }

    const checkForUser = async (): Promise<{userRoute:string}> => {
        //we are authed
        //We check to see if there is an account associated with the user
        //If not, we redirect to the account creation page

        const user = await sockCtx.getUserViaGithub(trz.githubData.id);
        if(user == undefined){
            console.log("Account not found");
            return {userRoute: DEFAULT_NO_AUTH_ROUTE};
        }

        setUser(user);

        if(user.firstName == "" || user.lastName == ""){
            console.log("Account not finished");
            return {userRoute: FINISH_ACCOUNT_CREATION_ROUTE};
        }
        console.log("Account found");
        return {userRoute:DEFAULT_AUTHED_ROUTE};
    }

    return (
        <UserContext.Provider value={{
            userData,
            updateUser,
            checkForUser,
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
