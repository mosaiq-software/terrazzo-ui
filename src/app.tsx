//Utility
import React from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";

import { TRZProvider } from "@trz/util/TRZ-context";
import { getGithubLoginUrl } from "@trz/util/githubAuth";
import { GithubAuth } from "@trz/pages/auth/github";
import { Dashboard } from "@trz/pages/dashboard";

import { createTheme, MantineProvider, Button, Flex } from "@mantine/core";
import "@mantine/core/styles.css";

import TRZNavBar from "./components/NavBar"

//Styling
const theme = createTheme({
    focusRing: "auto",
    fontSmoothing: true,
    colors: {
        'greyscale': ['#101010', '#1F1F1F', '#404040', '#505050', '#656565', '#808080', '#ACACAC', '#DEDEDE', '#F0F0F0', '#FFFFFF'],
    }
});

const App = () => {
	return (
		<MantineProvider defaultColorScheme="auto" theme={theme}>
			<TRZProvider>
				<BrowserRouter>
                    <TRZNavBar/>
                    <Routes>
                        <Route path='/' element={<Outlet />} />
                        <Route path='/login' element={<p><a href={getGithubLoginUrl()}>Login with GitHub</a></p>} />
                        <Route path='/auth' element={<Outlet />}>
                            <Route path='github' element={<GithubAuth />} />
                        </Route>
                        <Route path='/dashboard' element={<Dashboard />} />
                    </Routes>
				</BrowserRouter>
			</TRZProvider>
		</MantineProvider>
	);
};

export default App;
