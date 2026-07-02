const axios = require("axios");

function getClient() {
  const baseURL = process.env.HENTORY_API_URL;
  const username = process.env.HENTORY_USERNAME;
  const password = process.env.HENTORY_PASSWORD;
  const authHeader = "Basic " + Buffer.from(`${username}:${password}`).toString("base64");

  return axios.create({
    baseURL,
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/json",
    },
  });
}

exports.getProducts = async () => {
  try {
    const client = getClient();
    const response = await client.get("/products");
    return response.data;
  } catch (error) {
    console.error("❌ Hentory getProducts error:", error.message);
    throw error;
  }
};

exports.getGames = async (productId) => {
  try {
    const client = getClient();
    const response = await client.get("/games", {
      params: { productId },
    });
    return response.data;
  } catch (error) {
    console.error("❌ Hentory getGames error:", error.message);
    throw error;
  }
};
