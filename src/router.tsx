import React from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { getGithubLoginUrl } from "@trz/util/githubAuth";
import { GithubAuth } from "@trz/pages/auth/github";
import { Dashboard } from "@trz/pages/Dashboard";
import {AuthWrapper} from "@trz/wrappers/AuthWrapper";
import TRZAppLayout from "@trz/components/TRZAppLayout";
import BoardElement from "@trz/components/BoardElement";
import { CreateBoardModal } from "@trz/components/CreateBoard";
import { CollaborativeTextArea } from "./components/CollaborativeTextArea";
import { LoginPage } from '@trz/pages/auth/LoginPage'
import { ModalsProvider } from "@mantine/modals";

const Router = () => {

  return (
    <BrowserRouter>
      <ModalsProvider modals={{board: CreateBoardModal}}>
        <Routes>
          <Route element={<TRZAppLayout/>}>
            <Route path='/' element={<Outlet/>}/>
            <Route path='/login' element={<LoginPage />} />
            <Route path='/auth' element={<Outlet />}>
              <Route path='github' element={<GithubAuth />} />
            </Route>
            <Route element={<AuthWrapper />}>
              <Route path='/text' element={<CollaborativeTextArea maxLineLength={40} maxRows={20} textBlockId="6f77a4b2-990e-46be-8810-3813aba7d1f6" />} />
              <Route path='/dashboard' element={<Dashboard />} />
              <Route path='/boards/:boardId' element={<BoardElement/>}></Route>
            </Route>
          </Route>
        </Routes>
      </ModalsProvider>
    </BrowserRouter>
  );
};

export default Router;
