import React from "react";
import { useTRZ } from "@trz/util/TRZ-context";
import { tryLoginWithGithub } from "@trz/util/githubAuth";
import { useNavigate } from "react-router-dom";


interface DashboardProps {

}
export const Dashboard = (props: DashboardProps) => {
    const trz = useTRZ();

    return (
        <div>
            <p>Dashboard</p>
            <p>Logged in as {trz.githubAuthToken}</p>
            <pre>{JSON.stringify(trz.githubData, null, 2)}</pre>
        </div>
    );
}