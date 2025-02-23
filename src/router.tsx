import React from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { GithubAuth } from "@trz/pages/auth/github";
import { Dashboard } from "@trz/pages/Dashboard";
import {AuthWrapper} from "@trz/wrappers/AuthWrapper";
import Navbar from "@trz/components/Navbar";
import BoardElement from "@trz/components/BoardElement";
import {CreateBoardModal} from "@trz/components/CreateBoard";
import {ModalsProvider} from "@mantine/modals";
import {LoginPage} from '@trz/pages/auth/LoginPage'
import {SetUpAccount} from "@trz/pages/auth/SetUpAccount";

const Router = () => {
	return (
		<BrowserRouter>
			<ModalsProvider modals={{board: CreateBoardModal}}>
				<Navbar/>
				<Routes>
					<Route path='/' element={<Outlet/>}/>
					<Route path='/login' element={<LoginPage />} />
					<Route path='/auth' element={<Outlet />}>
						<Route path='github' element={<GithubAuth />} />
					</Route>
					<Route path='/create-account' element={<SetUpAccount/>}/>
					<Route element={<AuthWrapper />}>
						<Route path='/dashboard' element={<Dashboard />} />
						<Route path='/boards/:boardId' element={<BoardElement/>}></Route>
					</Route>
				</Routes>
			</ModalsProvider>
		</BrowserRouter>
	);
};

export default Router;
