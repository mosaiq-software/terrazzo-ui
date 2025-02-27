import React from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { GithubAuth } from "@trz/pages/auth/github";
import Navbar from "@trz/components/Navbar";
import {CreateBoardModal} from "@trz/components/modals/CreateBoard";
import {CreateProjectModal} from "@trz/components/modals/CreateProject";
import {CreateOrganizationModal} from "@trz/components/modals/CreateOrganization";
import {ModalsProvider} from "@mantine/modals";
import {SetUpAccount} from "@trz/pages/auth/SetUpAccount";
import ContentPageWrapper from "@trz/wrappers/ContentPageWrapper";
import LandingPage from "@trz/pages/LandingPage";
import HomePage from "@trz/pages/HomePage";
import OrganizationPage from "@trz/pages/OrganizationPage";
import ProjectPage from "@trz/pages/ProjectPage";
import BoardPage from "@trz/pages/BoardPage";
import LoginPage from "@trz/pages/auth/LoginPage";

const modals = {
	organization: CreateOrganizationModal,
	project: CreateProjectModal,
	board: CreateBoardModal,
}

const Router = () => {
	return (
		<BrowserRouter>
			<ModalsProvider modals={modals}>
				<Routes>
					<Route path='/' element={<LandingPage/>} />
					<Route path='/login' element={<LoginPage />} />
					<Route path='/auth' element={<Outlet />}>
						<Route path='github' element={<GithubAuth />} />
					</Route>
                    <Route path='/create-account' element={<SetUpAccount/>}/>
                    <Route element={<ContentPageWrapper />}>
						<Route path='/dashboard' element={<HomePage />} />
						<Route path='/board/:boardId/:tabId?' element={<BoardPage/>} />
						<Route path='/project/:projectId/:tabId?' element={<ProjectPage/>} />
						<Route path='/org/:orgId/:tabId?' element={<OrganizationPage/>} />
					</Route>
				</Routes>
			</ModalsProvider>
		</BrowserRouter>
	);
};

export default Router;
