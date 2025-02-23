import React from "react";
import { useTRZ } from "@trz/util/TRZ-context";
import {useUser} from "@trz/contexts/user-context";


interface DashboardProps {

}
export const Dashboard = (props: DashboardProps) => {
    const trz = useTRZ();
    const usr = useUser();

    return (
        <div>
            <h1>Dashboard</h1>
            <p>Logged in as {trz.githubAuthToken}</p>
            <p>{JSON.stringify(usr.userData, null, 2)}</p>
            <pre>{JSON.stringify(trz.githubData, null, 2)}</pre>
        </div>
    );
}