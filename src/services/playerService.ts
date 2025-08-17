import axios from "axios";

const API_URL = "http://localhost:8080/players";

export const getPlayers = async () => {
    const response = await axios.get(API_URL);
    return response.data;
};
