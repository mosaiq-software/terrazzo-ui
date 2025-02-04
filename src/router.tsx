import React from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { getGithubLoginUrl } from "@trz/util/githubAuth";
import { GithubAuth } from "@trz/pages/auth/github";
import { Dashboard } from "@trz/pages/dashboard";
import {AuthWrapper} from "@trz/wrappers/AuthWrapper";
import Navbar from "@trz/components/Navbar";
import Board from "@trz/components/Board";
import Home from "@trz/components/Home";

const Router = () => {
	return (
		<BrowserRouter>
		<Navbar/>
			<Routes>
				<Route path='/' element={<Outlet />} />
				<Route path='/login' element={<p><a href={getGithubLoginUrl()}>Login with GitHub</a></p>} />
				<Route path='/auth' element={<Outlet />}>
					<Route path='github' element={<GithubAuth />} />
				</Route>
				<Route element={<AuthWrapper />}>
					<Route path='/dashboard' element={<Dashboard />} />
					<Route path='/boards/:boardId' element={<Board/>}></Route>
					<Route path='/home' element={<Home/>} />
				</Route>
			</Routes>
		</BrowserRouter>
	);
};

export default Router;
