import React, { useEffect } from "react";
import {Outlet} from "react-router-dom";
import { DEFAULT_NO_AUTH_ROUTE, useTRZ } from "@trz/util/TRZ-context";
import { useNavigate } from "react-router-dom";
import { Loader } from "@mantine/core";


export const AuthWrapper = () => {
    const trz = useTRZ();
    const navigate = useNavigate();
    const currentRoute = window.location.pathname;

    

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

    if (!trz.githubAuthToken || !trz.githubData) {
        return (
            <Loader />
        );
    }

    return (
        <Outlet />
    );
}