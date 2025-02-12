import React, { useEffect } from "react";
import {Outlet} from "react-router-dom";
import { useTRZ } from "@trz/util/TRZ-context";
import { tryLoginWithGithub } from "@trz/util/githubAuth";
import { useNavigate } from "react-router-dom";
import { useSessionStorage } from "@mantine/hooks";
import { Loader } from "@mantine/core";


export const AuthWrapper = () => {
    const trz = useTRZ();
    const navigate = useNavigate();
    const [loginRouteDestination, setLoginRouteDestination] = useSessionStorage({
        key: "loginRouteDestination",
        defaultValue: "/dashboard"
    });
    const currentRoute = window.location.pathname;

    useEffect(() => {
        let strictIgnore = false;
        const tryLogin = async () => {
            await new Promise((resolve)=>setTimeout(resolve, 0));
            if(strictIgnore){
                return;
            }
            const {authToken, data} = await tryLoginWithGithub();
            if (authToken && data) {
                trz.setGithubAuthToken(authToken);
                trz.setGithubData(data);
            } else {
                setLoginRouteDestination(currentRoute);
                navigate("/login");
            }
        }
        if (!trz.githubAuthToken || !trz.githubData || currentRoute !== "/login") {
            tryLogin();
            return;
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