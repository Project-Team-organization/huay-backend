const axios = require("axios");

const BASE_URL = process.env.HENTORY_API_URL;
const USERNAME = process.env.HENTORY_USERNAME;
const PASSWORD = process.env.HENTORY_PASSWORD;

const authHeader = "Basic " + Buffer.from(`${USERNAME}:${PASSWORD}`).toString("base64");

const hentoryClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    Authorization: authHeader,
    "Content-Type": "application/json",
  },
});

exports.getProducts = async () => {
  try {
    const response = await hentoryClient.get("/products");
    return response.data;
  } catch (error) {
    console.error("❌ Hentory getProducts error:", error.message);
    throw error;
  }
};

exports.getGames = async (productId) => {
  try {
    const response = await hentoryClient.get("/games", {
      params: { productId },
    });
    return response.data;
  } catch (error) {
    console.error("❌ Hentory getGames error:", error.message);
    throw error;
  }
};
