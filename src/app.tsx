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
import {CreateBoardModal} from "@trz/components/Modals/CreateBoard";
import {CreateProjectModal} from "@trz/components/Modals/CreateProject";
import {CreateOrganizationModal} from "@trz/components/Modals/CreateOrganization";

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
                <UserProvider>
                    <SocketProvider>
                        <TRZProvider>
                            <ModalsProvider modals={modals}>
                                <Router/>
                            </ModalsProvider>
                        </TRZProvider>
                    </SocketProvider>
                </UserProvider>
            </BrowserRouter>
		</MantineProvider>
	);
};

export default App;
