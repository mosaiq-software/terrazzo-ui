import React from "react";
import { useTRZ } from "@trz/util/TRZ-context";
import { tryLoginWithGithub } from "@trz/util/githubAuth";
import { useNavigate } from "react-router-dom";


interface DashboardProps {

}
export const Dashboard = (props: DashboardProps) => {
    const trz = useTRZ();
    const navigate = useNavigate();

    React.useEffect(() => {
        const tryLogin = async () => {
            const {authToken, data} = await tryLoginWithGithub();
            if (authToken && data) {
                trz.setGithubAuthToken(authToken);
                trz.setGithubData(data);
            } else {
                navigate("/login");
            }
        }
        if (!trz.githubAuthToken || !trz.githubData){
            tryLogin();
            return;
        }
    }, []);

    return (
        <div>
            <p>Dashboard</p>
            <p>Logged in as {trz.githubAuthToken}</p>
            <pre>{JSON.stringify(trz.githubData, null, 2)}</pre>
        </div>
    );
}