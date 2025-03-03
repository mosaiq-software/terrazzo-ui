import React from "react";
import {AuthWrapper} from "@trz/wrappers/AuthWrapper";
import Navbar from "@trz/components/Navbar";
import { Outlet } from "react-router";
import TRZAppLayout from "@trz/wrappers/TRZAppLayout";
const ContentPageWrapper = () => {
    return (
        <AuthWrapper>
            <TRZAppLayout>
                <Outlet/>
            </TRZAppLayout>
        </AuthWrapper>
    )
}

export default ContentPageWrapper;