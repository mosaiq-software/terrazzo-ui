//Utility
import React from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { createTheme, MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import '@mantine/notifications/styles.css';
import { TRZProvider } from "@trz/util/TRZ-context";
import { getGithubLoginUrl } from "@trz/util/githubAuth";
import { GithubAuth } from "@trz/pages/auth/github";
import { Dashboard } from "@trz/pages/dashboard";
import { SocketProvider } from "@trz/util/socket-context";
import { Notifications } from '@mantine/notifications';
import {ModalsProvider} from "@mantine/modals";

//Components
import {AuthWrapper} from "@trz/wrappers/AuthWrapper";
import Navbar from "@trz/components/Navbar";
import Board from "@trz/components/Board";
import {CreateBoardModal} from "./components/CreateBoard";

//Styling



const theme = createTheme({});

const App = () => {
	return (
		<MantineProvider theme={theme}>
			<Notifications/>
            <ModalsProvider modals={{board: CreateBoardModal}}>
                <TRZProvider>
                    <SocketProvider>
                        <BrowserRouter>
                        <Navbar/>
                            <Routes>
                                <Route path='/' element={<Outlet />} />
                                <Route path='/login' element={<p><a href={getGithubLoginUrl()}>Login with GitHub</a></p>} />
                                <Route path='/auth' element={<Outlet />}>
                                    <Route path='github' element={<GithubAuth />} />
                                </Route>
                                <Route element={<AuthWrapper />}>
                                    <Route path='/dashboard' element={<Dashboard />} />
                                    <Route path='/boards/:boardId' element={<Board/>}></Route>
                                </Route>
                            </Routes>
                        </BrowserRouter>
                    </SocketProvider>
                </TRZProvider>
            </ModalsProvider>
        </MantineProvider>
	);
};

export default App;
