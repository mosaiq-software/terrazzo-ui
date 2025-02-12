import React, { useEffect } from "react";
import queryString from "query-string";
import { DEFAULT_NO_AUTH_ROUTE, useTRZ } from "@trz/util/TRZ-context";
import { Loader } from "@mantine/core";
import { useNavigate } from 'react-router-dom';
import { NoteType, notify } from "@trz/util/notifications";

/*
This page will only show as the callback fro github login. It should take the code from the string, save it, and then go to another page with the new data.
*/
export const GithubAuth = () => {
    const trz = useTRZ();
    const navigate = useNavigate();
    const urlParams = queryString.parse(window.location.search);
    const code = urlParams.code;

    useEffect(() => {
        let strictIgnore = false;
        const fetchData = async (code: any) => {
            await new Promise((resolve)=>setTimeout(resolve, 50));
            if(strictIgnore){
                return;
            }
            if(!code || typeof code !== "string"){
                navigate(DEFAULT_NO_AUTH_ROUTE);
                return;
            }
            const {route, success} = await trz.githubLogin(code);
            if(!success) {
                notify(NoteType.GITHUB_AUTH_ERROR);
            }
            navigate(route);
        };
        fetchData(code);
        return ()=>{
            strictIgnore = true;
        }
    }, [code]);

    return (
        <Loader />
    );
}