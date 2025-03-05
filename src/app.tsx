//Utility
import React from "react";
import "@mantine/core/styles.css";
import '@mantine/notifications/styles.css';
import {Button, createTheme, MantineProvider} from "@mantine/core";
import { TRZProvider } from "@trz/contexts/TRZ-context";
import { SocketProvider } from "@trz/contexts/socket-context";
import { Notifications } from '@mantine/notifications';
import Router from "./router";
import {UserProvider} from "@trz/contexts/user-context";
import { BrowserRouter } from "react-router-dom";
import { ModalsProvider } from "@mantine/modals";
import {CreateBoardModal} from "@trz/components/modals/CreateBoard";
import {CreateProjectModal} from "@trz/components/modals/CreateProject";
import {CreateOrganizationModal} from "@trz/components/modals/CreateOrganization";

const theme = createTheme({});

const modals = {
	organization: CreateOrganizationModal,
	project: CreateProjectModal,
	board: CreateBoardModal,
}

const App = () => {
	return (
		<MantineProvider theme={theme} defaultColorScheme="dark">
            <BrowserRouter>
                <Notifications/>
                <TRZProvider>
                    <UserProvider>
                        <SocketProvider>
                            <ModalsProvider modals={modals}>
                                <Router/>
                            </ModalsProvider>
                        </SocketProvider>
                    </UserProvider>
                </TRZProvider>
            </BrowserRouter>
		</MantineProvider>
	);
};

export default App;
