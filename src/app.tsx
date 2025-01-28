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
import { io } from "socket.io-client";

//Styling



const theme = createTheme({});


const App = () => {
	React.useEffect(() => {
		const socketAPIURL = "http://localhost:3002";
		const socket = io(socketAPIURL, { transports: ['websocket'] });
	
		const handleMouseMove = (event: MouseEvent) => {
			const userData = { id: socket.id, x: event.clientX, y: event.clientY };
	
			socket.emit('mousePosition', userData);
		};
	
		window.addEventListener('mousemove', handleMouseMove);
	
		socket.on('mousePosition', (userData) => {
			console.log('mousePosition event triggered with userData: ', userData);
		});
	
		socket.on('userDisconnected', (userId) => {
			console.log('userDisconnected event triggered with userId: ', userId);
		});
	
		return () => {
			window.removeEventListener('mousemove', handleMouseMove);
			socket.disconnect();
		};
	}, []);

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
