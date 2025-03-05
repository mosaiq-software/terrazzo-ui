//Utility
import React from "react";
import "@mantine/core/styles.css";
import '@mantine/notifications/styles.css';
import {Button, createTheme, MantineProvider} from "@mantine/core";
import { TRZProvider } from "@trz/util/TRZ-context";
import { SocketProvider } from "@trz/util/socket-context";
import { Notifications } from '@mantine/notifications';
import Router from "./router";
import {UserProvider} from "@trz/contexts/user-context";

const theme = createTheme({});

const App = () => {
	return (
		<MantineProvider theme={theme} defaultColorScheme="dark">
			<Notifications/>
                <TRZProvider>
                    <SocketProvider>
                        <UserProvider>
                            <Router/>
                        </UserProvider>
                    </SocketProvider>
                </TRZProvider>
		</MantineProvider>
	);
};

export default App;
