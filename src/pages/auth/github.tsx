import React from "react";
import queryString from "query-string";
import { getUserDataFromGithub } from "@trz/util/githubAuth";

export const GithubAuth = () => {
    const urlParams = queryString.parse(window.location.search);
    const code = urlParams.code;
    if (!code || Array.isArray(code)) {
        return <p>Error: No code found in URL</p>;
    }
    const data = getUserDataFromGithub(code);
    console.log(data);
    return (
        <div>
            <p>Signed in with GitHub! Here's your data:</p>
            <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
    )
};