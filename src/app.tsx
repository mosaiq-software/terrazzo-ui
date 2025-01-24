//Utility
import React from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { createTheme, MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import { TRZProvider } from "@trz/util/TRZ-context";
import { getGithubLoginUrl } from "@trz/util/githubAuth";
import { GithubAuth } from "@trz/pages/auth/github";
import { Dashboard } from "@trz/pages/dashboard";

//Components
import Navbar from "./components/Navbar/Navbar";
import Board from "./components/Board/Board";

//Styling

const theme = createTheme({});

const App = () => {
	return (
		<MantineProvider theme={theme}>
			<TRZProvider>
				<BrowserRouter>
				<Navbar/>
					<Routes>
						<Route path='/' element={<Outlet />} />
						<Route path='/login' element={<p><a href={getGithubLoginUrl()}>Login with GitHub</a></p>} />
						<Route path='/auth' element={<Outlet />}>
							<Route path='github' element={<GithubAuth />} />
						</Route>
						<Route path='/dashboard' element={<Dashboard />} />
						<Route path='/boards/:boardId' element={<Board/>}></Route>
					</Routes>
				</BrowserRouter>
			</TRZProvider>
		</MantineProvider>
	);
};

export default App;
