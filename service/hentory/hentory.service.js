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

const DISABLED_PRODUCTS = new Set([
  "ENDORPHINA", "TFGAME", "JILI", "KINGPOKER", "MSPORT", "UMBET", "AOG", "EXPANSE",
  "FB_SPORT", "KENO", "BIGPOT", "DBSPORT", "MINILUCK", "HOTDOG", "EVOLUTION", "WINFINITY",
  "UFABET", "ONCASINO", "GA28", "MUAYPAKYOK", "VIVO", "MIMI", "PRAGMATICPLAY_SLOT",
  "CLOTPLAY", "OFALIVE", "BIGTIME", "EAZYGAMING", "1UP_SPIN", "ONEPOWER", "JIMI", "SUNNI"
]);

exports.getProducts = async () => {
  try {
    const client = getClient();
    const response = await client.get("/products");
    const resData = response.data;

    if (resData && Array.isArray(resData.data)) {
      resData.data = resData.data.filter((p) => {
        const pid = typeof p === "string" ? p : (p.productId || p.id || p.code || p.name);
        return !DISABLED_PRODUCTS.has(pid);
      });
    } else if (Array.isArray(resData)) {
      return resData.filter((p) => {
        const pid = typeof p === "string" ? p : (p.productId || p.id || p.code || p.name);
        return !DISABLED_PRODUCTS.has(pid);
      });
    }

    return resData;
  } catch (error) {
    console.error("❌ Hentory getProducts error:", error.message);
    throw error;
  }
};

exports.getGames = async (productId) => {
  try {
    if (DISABLED_PRODUCTS.has(productId)) {
      throw new Error(`ค่ายเกม ${productId} ยังไม่เปิดให้บริการในระบบ`);
    }

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

exports.getBetLimitsV2 = async (productId) => {
  try {
    const client = getClient();
    const response = await client.get("/betLimitsV2", {
      params: { productId },
    });
    return response.data;
  } catch (error) {
    console.error("❌ Hentory getBetLimitsV2 error:", error.message);
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

exports.getAgentCredit = async () => {
  try {
    const client = getClient();
    const response = await client.get("/getAgentCredit");
    return response.data;
  } catch (error) {
    console.error("❌ Hentory getAgentCredit error:", error.message);
    if (error.response) {
      console.error("❌ Status:", error.response.status);
      console.error("❌ Data:", JSON.stringify(error.response.data));
    }
    throw error;
  }
};
