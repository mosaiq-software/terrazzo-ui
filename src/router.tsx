import React from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { getGithubLoginUrl } from "@trz/util/githubAuth";
import { GithubAuth } from "@trz/pages/auth/github";
import { Dashboard } from "@trz/pages/dashboard";
import {AuthWrapper} from "@trz/wrappers/AuthWrapper";
import Navbar from "@trz/components/Navbar";
import Home from "@trz/components/Home";
import BoardElement from "@trz/components/BoardElement";
import {CreateBoardModal} from "@trz/components/CreateBoard";
import {ModalsProvider} from "@mantine/modals";

const Router = () => {
	return (
		<BrowserRouter>
			<ModalsProvider modals={{board: CreateBoardModal}}>
				<Navbar/>
				<Routes>
					<Route path='/' element={<Outlet />} />
					<Route path='/login' element={<p><a href={getGithubLoginUrl()}>Login with GitHub</a></p>} />
					<Route path='/auth' element={<Outlet />}>
						<Route path='github' element={<GithubAuth />} />
					</Route>
					<Route element={<AuthWrapper />}>
						<Route path='/dashboard' element={<Dashboard />} />
						<Route path='/boards/:boardId' element={<BoardElement/>}></Route>
                        <Route path='/home' element={<Home/>} />
                    </Route>
				</Routes>
			</ModalsProvider>
		</BrowserRouter>
	);
};

export default Router;
