import React, {useState} from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { getGithubLoginUrl } from "@trz/util/githubAuth";
import { GithubAuth } from "@trz/pages/auth/github";
import { Dashboard } from "@trz/pages/dashboard";
import {AuthWrapper} from "@trz/wrappers/AuthWrapper";
import Navbar from "@trz/components/Navbar";
import Board from "@trz/components/Board";

const Router = () => {
	const [isVisible, setVisible] = useState(false);
	const openSettings = () => {
	  setVisible(prev => !prev);
	};
	return (
		<BrowserRouter>
		<Navbar openSettings={openSettings}/>
			<Routes>
				<Route path='/' element={<Outlet />} />
				<Route path='/login' element={<p><a href={getGithubLoginUrl()}>Login with GitHub</a></p>} />
				<Route path='/auth' element={<Outlet />}>
					<Route path='github' element={<GithubAuth />} />
				</Route>
				<Route element={<AuthWrapper />}>
					<Route path='/dashboard' element={<Dashboard />} />
					<Route path='/boards/:boardId' element={<Board isVisible={isVisible} onClose={()=>setVisible(false)}/>}></Route>
				</Route>
			</Routes>
		</BrowserRouter>
	);
};

export default Router;
