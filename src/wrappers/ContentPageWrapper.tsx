import React from "react";
import {AuthWrapper} from "@trz/wrappers/AuthWrapper";
import Navbar from "@trz/components/Navbar";
import { Outlet } from "react-router";

const ContentPageWrapper = () => {
    return (
        <>
            <Navbar />
            <AuthWrapper>
                <Outlet />
            </AuthWrapper>
        </>
    )
}

export default ContentPageWrapper;