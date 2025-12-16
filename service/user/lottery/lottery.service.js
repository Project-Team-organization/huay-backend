const LotterySets = require("../../../models/lotterySets.model");

exports.getLotteryUserSets = async function (query) {
  try {
    const { status, limit, slug } = query;
    const filter = {};

    if (status) {
      filter.status = status;
    }

    let queryBuilder = LotterySets.find(filter).populate("lottery_type_id");

    if (limit) {
      queryBuilder = queryBuilder.limit(parseInt(limit));
    }

    let lotterySets = await queryBuilder;

    if (slug) {
      lotterySets = lotterySets.filter(
        (lottery) => lottery.lottery_type_id?.slug === slug
      );
    }

    return lotterySets;
  } catch (error) {
    throw new Error("Error retrieving lottery sets: " + error.message);
  }
};


exports.getLotteryUserSetsById = async function (lotteryId) {
  try {
    const lottery = await LotterySets.findById(lotteryId);

    if (!lottery) {
      throw new Error("LotterySets not found.");
    }

    return lottery;
  } catch (error) {
    throw new Error("Error retrieving lotterySets: " + error.message);
  }
};
