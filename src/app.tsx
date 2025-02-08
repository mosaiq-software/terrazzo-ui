//Utility
import React from "react";
import "@mantine/core/styles.css";
import '@mantine/notifications/styles.css';
import '@mantine/code-highlight/styles.css';
import { createTheme, MantineProvider } from "@mantine/core";
import { TRZProvider } from "@trz/util/TRZ-context";
import { SocketProvider } from "@trz/util/socket-context";
import { Notifications } from '@mantine/notifications';
import Router from "./router";

const theme = createTheme({});

const App = () => {
	return (
		<MantineProvider theme={theme}>
			<Notifications/>
                <TRZProvider>
                    <SocketProvider>
                        <Router/>
                    </SocketProvider>
                </TRZProvider>
		</MantineProvider>
	);
};

export default App;
