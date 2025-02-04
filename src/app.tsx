//Utility
import React from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { createTheme, MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import '@mantine/notifications/styles.css';
import { createTheme, MantineProvider } from "@mantine/core";
import { TRZProvider } from "@trz/util/TRZ-context";
import { getGithubLoginUrl } from "@trz/util/githubAuth";
import { GithubAuth } from "@trz/pages/auth/github";
import { Dashboard } from "@trz/pages/dashboard";
import { SocketProvider } from "@trz/util/socket-context";
import { Notifications } from '@mantine/notifications';
import {ModalsProvider} from "@mantine/modals";
import Router from "./router";



const theme = createTheme({});

const App = () => {
	return (
		<MantineProvider theme={theme}>
			<Notifications/>
            <ModalsProvider modals={{board: CreateBoardModal}}>
                <TRZProvider>
                    <SocketProvider>
                        <Router/>
                    </SocketProvider>
                </TRZProvider>
            </ModalsProvider>
		</MantineProvider>
	);
};

export default App;
