import axios from "axios";

export const getApiUrl = () => {
    const apiUrl = process.env.API_URL;
    const apiPort = process.env.API_PORT;

    if (!apiUrl || !apiPort) {
        throw new Error("Missing required environment variables for API URL");
    }

    return `${apiUrl}:${apiPort}`;
};

export const callTrzApi = async (endpoint: string, method: string, data?: any) => {
    const apiUrl = getApiUrl();
    if (endpoint[0] === "/") {
        endpoint = endpoint.slice(1);
    }
    try {
        const response = await axios({
            method,
            url: `${apiUrl}/${endpoint}`,
            data,
        });
        if (!response) {
            console.error(`Error calling ${endpoint} with method ${method}`);
            return null;
        }
        return response;
    } catch (error) {
        console.error(`Error calling ${endpoint} with method ${method}`, error);
        throw error;
    }
}