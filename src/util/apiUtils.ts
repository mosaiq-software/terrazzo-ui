export const getApiUrl = () => {
    const apiUrl = process.env.API_URL;
    const apiPort = process.env.API_PORT;

    if (!apiUrl || !apiPort) {
        throw new Error("Missing required environment variables for API URL");
    }

    return `${apiUrl}:${apiPort}`;
};

export const callTrzApi = async (endpoint: string, method: string, body?: any) => {
    if (endpoint[0] === "/") {
        endpoint = endpoint.slice(1);
    }
    try {
        const response = await fetch(`${getApiUrl()}/${endpoint}`, {
            method,
            body,
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