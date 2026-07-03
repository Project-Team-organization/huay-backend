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
    if (error.response) {
      console.error("❌ Status:", error.response.status);
      console.error("❌ Data:", JSON.stringify(error.response.data));
    }
    throw error;
  }
};

exports.loginGame = async (data) => {
  try {
    const client = getClient();
    const response = await client.post("/login", data);
    return response.data;
  } catch (error) {
    console.error("❌ Hentory loginGame error:", error.message);
    if (error.response) {
      console.error("❌ Status:", error.response.status);
      console.error("❌ Data:", JSON.stringify(error.response.data));
    }
    throw error;
  }
};

exports.getBetTransactions = async (params) => {
  try {
    const client = getClient();
    const response = await client.get("/betTransactionsV2", { params });
    return response.data;
  } catch (error) {
    console.error("❌ Hentory getBetTransactions error:", error.message);
    if (error.response) {
      console.error("❌ Status:", error.response.status);
      console.error("❌ Data:", JSON.stringify(error.response.data));
    }
    throw error;
  }
};
