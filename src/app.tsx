// Utility
import React from "react";
import "@mantine/core/styles.css";
import '@mantine/notifications/styles.css';
import { createTheme, MantineProvider } from "@mantine/core";
import { TRZProvider } from "@trz/util/TRZ-context";
import { SocketProvider } from "@trz/util/socket-context";
import { Notifications } from '@mantine/notifications';
import {ModalsProvider} from "@mantine/modals";
import Router from "./router";
import {CreateBoardModal} from "@trz/components/CreateBoard";

// Styling
const theme = createTheme({
    focusRing: "auto",
    fontSmoothing: true,
    colors: {
        'greyscale': ['#101010', '#1F1F1F', '#404040', '#505050', '#656565', '#808080', '#ACACAC', '#DEDEDE', '#F0F0F0', '#FFFFFF'],
    }
});

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
