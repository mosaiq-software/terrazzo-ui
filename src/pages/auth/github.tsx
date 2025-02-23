import React, { useEffect } from "react";
import queryString from "query-string";
import { DEFAULT_NO_AUTH_ROUTE, useTRZ } from "@trz/util/TRZ-context";
import { useNavigate } from 'react-router-dom';
import { NoteType, notify } from "@trz/util/notifications";
import {Center, Container, Paper, Stack, Title, Text, Loader} from "@mantine/core";
import {useUser} from "@trz/contexts/user-context";
import {useSocket} from "@trz/util/socket-context";

/*
This page will only show as the callback fro github login. It should take the code from the string, save it, and then go to another page with the new data.
*/


export const GithubAuth = () => {

    const trz = useTRZ();
    const sockCtx = useSocket();
    const usr = useUser();
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
                navigate(route);
            }
        };
        fetchData(code);
        return ()=>{
            strictIgnore = true;
        }
    }, [code]);

    useEffect(() => {
        const checkUser = async () => {
            if(!sockCtx.connected){
                return;
            }
            console.log("Checking for user");
            console.log(trz.githubData);
            const {userRoute} = await usr.checkForUser();
            navigate(userRoute);
        }
        checkUser();
    }, [sockCtx.connected]);

    return(
        <Container h="100%" fluid maw="100%" p="lg" bg="#1d2022">
            <Center>
                <Paper
                    bg={"#0c0c10"}
                >
                    <Stack
                        px={50}
                        py={30}
                        mih={400}
                        ta="center"
                        c={"#ebebeb"}
                        align="center"
                    >
                        <Title>
                            Working on it...
                        </Title>
                        <Text>
                            Hold tight, we're logging you in with Github.
                        </Text>
                        <Loader type="bars" size="xl" />
                    </Stack>
                </Paper>
            </Center>
        </Container>
    );
}