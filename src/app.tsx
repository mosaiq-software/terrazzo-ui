//Utility
import React from "react";
import "@mantine/core/styles.css";
import '@mantine/notifications/styles.css';
import { createTheme, MantineProvider } from "@mantine/core";
import { TRZProvider } from "@trz/util/TRZ-context";
import { SocketProvider } from "@trz/util/socket-context";
import { Notifications } from '@mantine/notifications';
import Router from "./router";
import "@trz/styles/Main.css"
import "@trz/styles/Focus.css"

const theme = createTheme({
  activeClassName: "",
  focusClassName: "trz-Focus"
});

const App = () => {
  return (
    <MantineProvider theme={theme} defaultColorScheme={'auto'}>
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
