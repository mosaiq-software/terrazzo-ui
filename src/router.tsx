import React from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { GithubAuth } from "@trz/pages/auth/github";
import { Dashboard } from "@trz/pages/Dashboard";
import {AuthWrapper} from "@trz/wrappers/AuthWrapper";
import TRZAppLayout from "@trz/components/TRZAppLayout";
import Home from "@trz/components/Home";
import BoardElement from "@trz/components/BoardElement";
import {CreateBoardModal} from "@trz/components/CreateBoard";
import {ModalsProvider} from "@mantine/modals";
import {LoginPage} from '@trz/pages/auth/LoginPage'
import Workspace from "@trz/components/Workspace";

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
            <Route path='/dashboard' element={<Dashboard />} />
            <Route path='/boards/:boardId' element={<BoardElement/>}></Route>
            <Route path='/home' element={<Home/>} />
            <Route path='/workspace' element={<Workspace/>} />
          </Route>
        </Routes>
      </ModalsProvider>
    </BrowserRouter>
  );
};

export default Router;
