import React, { useEffect } from "react";
import {Outlet} from "react-router-dom";
import {DEFAULT_AUTHED_ROUTE, DEFAULT_NO_AUTH_ROUTE, useTRZ} from "@trz/util/TRZ-context";
import { useNavigate } from "react-router-dom";
import { Center, Loader } from "@mantine/core";
import {useUser} from "@trz/contexts/user-context";
import {useSocket} from "@trz/util/socket-context";

interface AuthWrapperProps {
    children: any;
}
export const AuthWrapper = (props: AuthWrapperProps) => {
    const trz = useTRZ();
    const usr = useUser();
    const navigate = useNavigate();
    const currentRoute = window.location.pathname;
    const sockCtx = useSocket();

    useEffect(() => {
        let strictIgnore = false;
        const tryLogin = async () => {
            await new Promise((resolve)=>setTimeout(resolve, 0));
            if(strictIgnore){
                return;
            }
            const {route, success} = await trz.githubLogin(undefined);
            if(!success){
                navigate(route);
            }

        }
        if (!trz.githubAuthToken || !trz.githubData || currentRoute !== DEFAULT_NO_AUTH_ROUTE) {
            tryLogin();
        }
        return ()=>{
            strictIgnore = true;
        }
    }, []);

    useEffect(() => {
        const checkUser = async () => {
            console.log("Checking for user");
            if(!sockCtx.connected){
                return;
            }
            const {userRoute} = await usr.checkForUser();
            navigate(userRoute);
        }
        checkUser();
    }, [sockCtx.connected]);

    if (!trz.githubAuthToken || !trz.githubData) {
        return (
            <Center w="100%" h="100%">
                <Loader type="bars"/>
            </Center>
        );
    }

    return props.children;
}