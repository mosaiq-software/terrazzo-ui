//Utility
import React from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { createTheme, MantineProvider } from "@mantine/core";
import "@mantine/core/styles.css";
import { TRZProvider } from "@trz/util/TRZ-context";
// import { getGithubLoginUrl } from "@trz/util/githubAuth";
// import { GithubAuth } from "@trz/pages/auth/github";

//Components
import Board from "./components/Board/Board";
import Navbar from "./components/Navbar/Navbar";

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
						<Route path='/auth' element={<Outlet />}>
							{/* <Route path='github' element={<GithubAuth />} /> */}
						</Route>
						<Route path='/boards/:board_id' element={<Board />}></Route>
					</Routes>
				</BrowserRouter>
				<p>
					{/* Hello world! <a href={getGithubLoginUrl()}>Login with GitHub</a> */}
				</p>
			</TRZProvider>
		</MantineProvider>
	);
};

export default App;
