import React, { useEffect } from "react";
import { Center, Loader } from "@mantine/core";
import {useUser} from "@trz/contexts/user-context";

interface AuthWrapperProps {
    children: any;
}
export const AuthWrapper = (props: AuthWrapperProps) => {
    const usr = useUser();

    useEffect(() => {
        let strictIgnore = false;
        const tryLogin = async () => {
            await new Promise((resolve)=>setTimeout(resolve, 0));
            if(strictIgnore){
                return;
            }
            await usr.githubLogin(undefined);
        }
        if (!usr.userData) {
            tryLogin();
        }
        return ()=>{
            strictIgnore = true;
        }
    }, []);

    if (!usr.userData) {
        return (
            <Center w="100%" h="100%">
                <Loader type="bars"/>
            </Center>
        );
    }

    return props.children;
}