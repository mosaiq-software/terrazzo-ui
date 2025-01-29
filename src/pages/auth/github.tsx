import React from "react";
import queryString from "query-string";
import { tryLoginWithGithub } from "@trz/util/githubAuth";
import { useTRZ } from "@trz/util/TRZ-context";
import { useNavigate } from "react-router-dom";
import { useSessionStorage, readSessionStorageValue } from "@mantine/hooks";
import { Loader } from "@mantine/core";

/*
This page will only show as the callback fro github login. It should take the code from the string, save it, and then go to another page with the new data.
*/
export const GithubAuth = () => {
    const trz = useTRZ();
    const navigate = useNavigate();
    const [loginRouteDestination, setLoginRouteDestination] = useSessionStorage({
        key: "loginRouteDestination",
    });
    const urlParams = queryString.parse(window.location.search);
    const code = urlParams.code;
    React.useEffect(() => {
        const fetchData = async (code: string) => {
            const {authToken, data} = await tryLoginWithGithub(code);
            if(authToken && data) {
                trz.setGithubAuthToken(authToken);
                trz.setGithubData(data);
                const route = readSessionStorageValue({key: "loginRouteDestination"});
                setLoginRouteDestination('');
                navigate(route || "/dashboard");
            }
        };
        if(code && typeof code === "string") {
            fetchData(code);
        }
    }, [code]);

    return (
        <Loader />
    );
};