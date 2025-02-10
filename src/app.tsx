// Utility
import React from "react";
import "@mantine/core/styles.css";
import '@mantine/notifications/styles.css';
import { createTheme, MantineProvider } from "@mantine/core";
import { TRZProvider } from "@trz/util/TRZ-context";
import { SocketProvider } from "@trz/util/socket-context";
import { Notifications } from '@mantine/notifications';
import Router from "./router";

import "./styles/Main.css"

// Styling
const darktheme = createTheme({
    activeClassName: '',
    colors: {
        'gray': [
            '#FFFFFF',
            '#F0F0F0', 
            '#DEDEDE', 
            '#ACACAC', 
            '#808080', 
            '#656565', 
            '#505050', 
            '#404040', 
            '#1F1F1F', 
            '#101010', 
        ],
    },
});

const App = () => {
	return (
		<MantineProvider defaultColorScheme="dark" theme={darktheme}>
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
