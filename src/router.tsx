import React from "react";
import { Routes, Route, Outlet } from "react-router-dom";
import { GithubAuth } from "@trz/pages/auth/github";
import {SetUpAccount} from "@trz/pages/auth/SetUpAccount";
import ContentPageWrapper from "@trz/wrappers/ContentPageWrapper";
import LandingPage from "@trz/pages/LandingPage";
import HomePage from "@trz/pages/HomePage";
import OrganizationPage from "@trz/pages/OrganizationPage";
import ProjectPage from "@trz/pages/ProjectPage";
import BoardPage from "@trz/pages/BoardPage";
import BoardSettingsPage from "@trz/pages/BoardSettingsPage";
import LoginPage from "@trz/pages/auth/LoginPage";

const Router = () => {
	return (
		<Routes>
			<Route path='/' element={<LandingPage/>} />
			<Route path='/login' element={<LoginPage />} />
			<Route path='/auth' element={<Outlet />}>
				<Route path='github' element={<GithubAuth />} />
			</Route>
			<Route path='/create-account' element={<SetUpAccount/>}/>
			<Route element={<ContentPageWrapper />}>
				<Route path='/dashboard' element={<HomePage />} />
				<Route path='/board/:boardId/' element={<BoardPage/>} />
				<Route path='/board/:boardId/settings' element={<BoardSettingsPage/>} />
				<Route path='/project/:projectId/:tabId?' element={<ProjectPage/>} />
				<Route path='/org/:orgId/:tabId?' element={<OrganizationPage/>} />
			</Route>
		</Routes>
	);
};

export default Router;
