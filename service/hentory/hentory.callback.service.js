const User = require("../../models/user.model");
const HentoryLog = require("../../models/hentoryLog.model");
const UserTransaction = require("../../models/user.transection.model");

exports.getBalance = async (body, headers, rawBody) => {
  const { id, username, productId, currency } = body;
  let responseData = null;

  if (!username || !id) {
    responseData = {
      id: id || "",
      statusCode: 10001,
      productId: productId || "",
      timestampMillis: Date.now()
    };
    await HentoryLog.create({
      endpoint: "/balance",
      headers,
      body,
      rawBody,
      response: responseData
    });
    return responseData;
  }

  const user = await User.findOne({ username });

  if (!user) {
    console.warn(`⚠️ Hentory balance query: User '${username}' not found`);
    responseData = {
      id: id,
      statusCode: 10001,
      productId: productId,
      timestampMillis: Date.now()
    };
    await HentoryLog.create({
      endpoint: "/balance",
      headers,
      body,
      rawBody,
      response: responseData,
      error: "Member not found"
    });
    return responseData;
  }

  responseData = {
    id: id,
    statusCode: 0,
    timestampMillis: Date.now(),
    productId: productId,
    currency: currency || "THB",
    balance: user.credit || 0,
    username: user.username
  };

  await HentoryLog.create({
    endpoint: "/balance",
    headers,
    body,
    rawBody,
    response: responseData
  });

  return responseData;
};

exports.placeBets = async (body, headers, rawBody, path) => {
  const { id, username, productId, currency, txns } = body;
  let responseData = null;

  if (!username || !id || !txns || !Array.isArray(txns)) {
    responseData = {
      id: id || "",
      statusCode: 10001,
      productId: productId || "",
      timestampMillis: Date.now()
    };
    await HentoryLog.create({
      endpoint: path,
      headers,
      body,
      rawBody,
      response: responseData
    });
    return responseData;
  }

  const user = await User.findOne({ username });

  if (!user) {
    console.warn(`⚠️ Hentory bet query: User '${username}' not found`);
    responseData = {
      id: id,
      statusCode: 10001,
      productId: productId,
      timestampMillis: Date.now()
    };
    await HentoryLog.create({
      endpoint: path,
      headers,
      body,
      rawBody,
      response: responseData,
      error: "Member not found"
    });
    return responseData;
  }

  // Calculate total bet amount, skipping those with skipBalanceUpdate: true
  let totalBetAmount = 0;
  txns.forEach(txn => {
    if (txn.skipBalanceUpdate !== true) {
      totalBetAmount += txn.betAmount || 0;
    }
  });

  const balanceBefore = user.credit || 0;

  if (balanceBefore < totalBetAmount) {
    console.warn(`⚠️ Hentory bet callback: Insufficient balance for user '${username}' (Needed: ${totalBetAmount}, Available: ${balanceBefore})`);
    responseData = {
      id: id,
      statusCode: 10001,
      productId: productId,
      timestampMillis: Date.now()
    };
    await HentoryLog.create({
      endpoint: path,
      headers,
      body,
      rawBody,
      response: responseData,
      error: "Insufficient balance"
    });
    return responseData;
  }

  // Deduct user credit atomically
  if (totalBetAmount > 0) {
    await User.updateOne({ _id: user._id }, { $inc: { credit: -totalBetAmount } });
  }

  // Fetch updated user to get accurate balanceAfter
  const updatedUser = await User.findById(user._id);
  const balanceAfter = updatedUser.credit || 0;

  // Log the transaction
  if (totalBetAmount > 0) {
    for (const txn of txns) {
      if (txn.skipBalanceUpdate !== true) {
        await logGameTransaction({
          user_id: user._id,
          productId,
          txn,
          type: "bet",
          amount: txn.betAmount || 0,
          balanceBefore,
          balanceAfter,
          description: `Hentory Bet: ${txn.gameCode} (Round:${txn.roundId})`
        });
      }
    }
  }

  responseData = {
    id: id,
    statusCode: 0,
    timestampMillis: Date.now(),
    productId: productId,
    currency: currency || "THB",
    balanceBefore: balanceBefore,
    balanceAfter: balanceAfter,
    username: user.username
  };

  await HentoryLog.create({
    endpoint: path,
    headers,
    body,
    rawBody,
    response: responseData
  });

  return responseData;
};

exports.settleBets = async (body, headers, rawBody, path) => {
  const { id, username, productId, currency, txns } = body;
  let responseData = null;

  if (!username || !id || !txns || !Array.isArray(txns)) {
    responseData = {
      id: id || "",
      statusCode: 10001,
      productId: productId || "",
      timestampMillis: Date.now()
    };
    await HentoryLog.create({
      endpoint: path,
      headers,
      body,
      rawBody,
      response: responseData
    });
    return responseData;
  }

  const user = await User.findOne({ username });

  if (!user) {
    console.warn(`⚠️ Hentory result/settle query: User '${username}' not found`);
    responseData = {
      id: id,
      statusCode: 10001,
      productId: productId,
      timestampMillis: Date.now()
    };
    await HentoryLog.create({
      endpoint: path,
      headers,
      body,
      rawBody,
      response: responseData,
      error: "Member not found"
    });
    return responseData;
  }

  // Calculate total bet amount (from single-state transactions) and total payout amount
  let totalBetAmount = 0;
  let totalPayoutAmount = 0;
  txns.forEach(txn => {
    if (txn.skipBalanceUpdate !== true) {
      if (txn.isSingleState === true) {
        totalBetAmount += txn.betAmount || 0;
      }
      totalPayoutAmount += txn.payoutAmount || 0;
    }
  });

  const balanceBefore = user.credit || 0;

  // In single state rounds, we must verify the user has enough credit to cover the betAmount
  if (balanceBefore < totalBetAmount) {
    console.warn(`⚠️ Hentory result/settle callback: Insufficient balance for user '${username}' (Needed: ${totalBetAmount}, Available: ${balanceBefore})`);
    responseData = {
      id: id,
      statusCode: 10001,
      productId: productId,
      timestampMillis: Date.now()
    };
    await HentoryLog.create({
      endpoint: path,
      headers,
      body,
      rawBody,
      response: responseData,
      error: "Insufficient balance"
    });
    return responseData;
  }

  const netAmount = totalPayoutAmount - totalBetAmount;

  // Update user credit atomically
  if (netAmount !== 0) {
    await User.updateOne({ _id: user._id }, { $inc: { credit: netAmount } });
  }

  // Fetch updated user to get accurate balanceAfter
  const updatedUser = await User.findById(user._id);
  const balanceAfter = updatedUser.credit || 0;

  // Log user transactions
  for (const txn of txns) {
    if (txn.skipBalanceUpdate !== true) {
      if (txn.isSingleState === true) {
        await logGameTransaction({
          user_id: user._id,
          productId,
          txn,
          type: "bet",
          amount: txn.betAmount || 0,
          balanceBefore,
          balanceAfter,
          description: `Hentory Bet (Single State): ${txn.gameCode} (Round:${txn.roundId})`
        });
        if ((txn.payoutAmount || 0) > 0) {
          await logGameTransaction({
            user_id: user._id,
            productId,
            txn,
            type: "payout",
            amount: txn.payoutAmount || 0,
            balanceBefore,
            balanceAfter,
            description: `Hentory Payout: ${txn.gameCode} (Round:${txn.roundId})`
          });
        }
      } else {
        await logGameTransaction({
          user_id: user._id,
          productId,
          txn,
          type: "payout",
          amount: txn.payoutAmount || 0,
          balanceBefore,
          balanceAfter,
          description: `Hentory Settle Payout: ${txn.gameCode} (Round:${txn.roundId})`
        });
      }
    }
  }

  responseData = {
    id: id,
    statusCode: 0,
    timestampMillis: Date.now(),
    productId: productId,
    currency: currency || "THB",
    balanceBefore: balanceBefore,
    balanceAfter: balanceAfter,
    username: user.username
  };

  await HentoryLog.create({
    endpoint: path,
    headers,
    body,
    rawBody,
    response: responseData
  });

  return responseData;
};

exports.cancelBets = async (body, headers, rawBody, path) => {
  const { id, username, productId, currency, txns } = body;
  let responseData = null;

  if (!username || !id || !txns || !Array.isArray(txns)) {
    responseData = {
      id: id || "",
      statusCode: 10001,
      productId: productId || "",
      timestampMillis: Date.now()
    };
    await HentoryLog.create({
      endpoint: path,
      headers,
      body,
      rawBody,
      response: responseData
    });
    return responseData;
  }

  const user = await User.findOne({ username });

  if (!user) {
    console.warn(`⚠️ Hentory cancel query: User '${username}' not found`);
    responseData = {
      id: id,
      statusCode: 10001,
      productId: productId,
      timestampMillis: Date.now()
    };
    await HentoryLog.create({
      endpoint: path,
      headers,
      body,
      rawBody,
      response: responseData,
      error: "Member not found"
    });
    return responseData;
  }

  // Calculate total refund amount
  let totalRefundAmount = 0;
  txns.forEach(txn => {
    totalRefundAmount += txn.betAmount || 0;
  });

  const balanceBefore = user.credit || 0;

  // Refund user credit atomically
  if (totalRefundAmount > 0) {
    await User.updateOne({ _id: user._id }, { $inc: { credit: totalRefundAmount } });
  }

  // Fetch updated user to get accurate balanceAfter
  const updatedUser = await User.findById(user._id);
  const balanceAfter = updatedUser.credit || 0;

  // Log user transaction as refund
  if (totalRefundAmount > 0) {
    for (const txn of txns) {
      await logGameTransaction({
        user_id: user._id,
        productId,
        txn,
        type: "refund",
        amount: txn.betAmount || 0,
        balanceBefore,
        balanceAfter,
        description: `Hentory Cancel/Refund: ${txn.gameCode} (Round:${txn.roundId})`
      });
    }
  }

  responseData = {
    id: id,
    statusCode: 0,
    timestampMillis: Date.now(),
    productId: productId,
    currency: currency || "THB",
    balanceBefore: balanceBefore,
    balanceAfter: balanceAfter,
    username: user.username
  };

  await HentoryLog.create({
    endpoint: path,
    headers,
    body,
    rawBody,
    response: responseData
  });

  return responseData;
};

exports.adjustBets = async (body, headers, rawBody, path) => {
  const { id, username, productId, currency, txns } = body;
  let responseData = null;

  if (!username || !id || !txns || !Array.isArray(txns)) {
    responseData = {
      id: id || "",
      statusCode: 10001,
      productId: productId || "",
      timestampMillis: Date.now()
    };
    await HentoryLog.create({
      endpoint: path,
      headers,
      body,
      rawBody,
      response: responseData
    });
    return responseData;
  }

  const user = await User.findOne({ username });

  if (!user) {
    console.warn(`⚠️ Hentory adjust query: User '${username}' not found`);
    responseData = {
      id: id,
      statusCode: 10001,
      productId: productId,
      timestampMillis: Date.now()
    };
    await HentoryLog.create({
      endpoint: path,
      headers,
      body,
      rawBody,
      response: responseData,
      error: "Member not found"
    });
    return responseData;
  }

  const balanceBefore = user.credit || 0;
  let totalNetChange = 0;
  let totalDeductionNeeded = 0;

  // Process transactions and find old bet amount to calculate adjustments
  for (const txn of txns) {
    let oldBetAmount = 0;

    // Find old transaction in HentoryLog by matching the transaction id
    const oldLog = await HentoryLog.findOne({
      "body.txns.id": txn.id
    });

    if (oldLog && oldLog.body && Array.isArray(oldLog.body.txns)) {
      const oldTxn = oldLog.body.txns.find(t => t.id === txn.id);
      if (oldTxn) {
        oldBetAmount = oldTxn.betAmount || 0;
      }
    }

    const txnNetChange = oldBetAmount - (txn.betAmount || 0);
    totalNetChange += txnNetChange;

    if (txnNetChange < 0) {
      totalDeductionNeeded += Math.abs(txnNetChange);
    }
  }

  // Verify if user has enough balance to cover the extra bet deduction
  if (balanceBefore < totalDeductionNeeded) {
    console.warn(`⚠️ Hentory adjust callback: Insufficient balance for user '${username}' (Needed deduction: ${totalDeductionNeeded}, Available: ${balanceBefore})`);
    responseData = {
      id: id,
      statusCode: 10001,
      productId: productId,
      timestampMillis: Date.now()
    };
    await HentoryLog.create({
      endpoint: path,
      headers,
      body,
      rawBody,
      response: responseData,
      error: "Insufficient balance"
    });
    return responseData;
  }

  // Apply the adjustment atomically
  if (totalNetChange !== 0) {
    await User.updateOne({ _id: user._id }, { $inc: { credit: totalNetChange } });
  }

  // Fetch updated user to get accurate balanceAfter
  const updatedUser = await User.findById(user._id);
  const balanceAfter = updatedUser.credit || 0;

  // Log the transaction in UserTransaction
  for (const txn of txns) {
    if (totalNetChange > 0) {
      await logGameTransaction({
        user_id: user._id,
        productId,
        txn,
        type: "refund",
        amount: totalNetChange,
        balanceBefore,
        balanceAfter,
        description: `Hentory Bet Adjust Refund: ${txn.gameCode} (Round:${txn.roundId})`
      });
    } else if (totalNetChange < 0) {
      await logGameTransaction({
        user_id: user._id,
        productId,
        txn,
        type: "bet",
        amount: Math.abs(totalNetChange),
        balanceBefore,
        balanceAfter,
        description: `Hentory Bet Adjust Charge: ${txn.gameCode} (Round:${txn.roundId})`
      });
    }
  }

  responseData = {
    id: id,
    statusCode: 0,
    timestampMillis: Date.now(),
    productId: productId,
    currency: currency || "THB",
    balanceBefore: balanceBefore,
    balanceAfter: balanceAfter,
    username: user.username
  };

  await HentoryLog.create({
    endpoint: path,
    headers,
    body,
    rawBody,
    response: responseData
  });

  return responseData;
};

exports.rollbackBets = async (body, headers, rawBody, path) => {
  const { id, username, productId, currency, txns } = body;
  let responseData = null;

  if (!username || !id || !txns || !Array.isArray(txns)) {
    responseData = {
      id: id || "",
      statusCode: 10001,
      productId: productId || "",
      timestampMillis: Date.now()
    };
    await HentoryLog.create({
      endpoint: path,
      headers,
      body,
      rawBody,
      response: responseData
    });
    return responseData;
  }

  const user = await User.findOne({ username });

  if (!user) {
    console.warn(`⚠️ Hentory rollback query: User '${username}' not found`);
    responseData = {
      id: id,
      statusCode: 10001,
      productId: productId,
      timestampMillis: Date.now()
    };
    await HentoryLog.create({
      endpoint: path,
      headers,
      body,
      rawBody,
      response: responseData,
      error: "Member not found"
    });
    return responseData;
  }

  // Calculate total deduction amount
  let totalDeductionAmount = 0;
  txns.forEach(txn => {
    if (txn.skipBalanceUpdate !== true) {
      totalDeductionAmount += (txn.payoutAmount || 0) + (txn.betAmount || 0);
    }
  });

  const balanceBefore = user.credit || 0;

  // Check if user has enough balance to cover the rollback deduction
  if (balanceBefore < totalDeductionAmount) {
    console.warn(`⚠️ Hentory rollback callback: Insufficient balance for user '${username}' (Needed deduction: ${totalDeductionAmount}, Available: ${balanceBefore})`);
    responseData = {
      id: id,
      statusCode: 10001,
      productId: productId,
      timestampMillis: Date.now()
    };
    await HentoryLog.create({
      endpoint: path,
      headers,
      body,
      rawBody,
      response: responseData,
      error: "Insufficient balance"
    });
    return responseData;
  }

  // Apply the rollback deduction atomically
  if (totalDeductionAmount > 0) {
    await User.updateOne({ _id: user._id }, { $inc: { credit: -totalDeductionAmount } });
  }

  // Fetch updated user to get accurate balanceAfter
  const updatedUser = await User.findById(user._id);
  const balanceAfter = updatedUser.credit || 0;

  // Log the transaction in UserTransaction
  if (totalDeductionAmount > 0) {
    for (const txn of txns) {
      if (txn.skipBalanceUpdate !== true) {
        const rollbackAmount = (txn.payoutAmount || 0) + (txn.betAmount || 0);
        await logGameTransaction({
          user_id: user._id,
          productId,
          txn,
          type: "refund",
          amount: -rollbackAmount,
          balanceBefore,
          balanceAfter,
          description: `Hentory Rollback: ${txn.gameCode} (Round:${txn.roundId})`
        });
      }
    }
  }

  responseData = {
    id: id,
    statusCode: 0,
    timestampMillis: Date.now(),
    productId: productId,
    currency: currency || "THB",
    balanceBefore: balanceBefore,
    balanceAfter: balanceAfter,
    username: user.username
  };

  await HentoryLog.create({
    endpoint: path,
    headers,
    body,
    rawBody,
    response: responseData
  });

  return responseData;
};

exports.winRewards = async (body, headers, rawBody, path) => {
  const { id, username, productId, currency, txns } = body;
  let responseData = null;

  if (!username || !id || !txns || !Array.isArray(txns)) {
    responseData = {
      id: id || "",
      statusCode: 10001,
      productId: productId || "",
      timestampMillis: Date.now()
    };
    await HentoryLog.create({
      endpoint: path,
      headers,
      body,
      rawBody,
      response: responseData
    });
    return responseData;
  }

  const user = await User.findOne({ username });

  if (!user) {
    console.warn(`⚠️ Hentory winRewards query: User '${username}' not found`);
    responseData = {
      id: id,
      statusCode: 10001,
      productId: productId,
      timestampMillis: Date.now()
    };
    await HentoryLog.create({
      endpoint: path,
      headers,
      body,
      rawBody,
      response: responseData,
      error: "Member not found"
    });
    return responseData;
  }

  let totalRewardAmount = 0;
  txns.forEach(txn => {
    totalRewardAmount += txn.payoutAmount || 0;
  });

  const balanceBefore = user.credit || 0;

  if (totalRewardAmount > 0) {
    await User.updateOne({ _id: user._id }, { $inc: { credit: totalRewardAmount } });
  }

  const updatedUser = await User.findById(user._id);
  const balanceAfter = updatedUser.credit || 0;

  if (totalRewardAmount > 0) {
    for (const txn of txns) {
      await logGameTransaction({
        user_id: user._id,
        productId,
        txn,
        type: "payout",
        amount: txn.payoutAmount || 0,
        balanceBefore,
        balanceAfter,
        description: `Hentory Win Reward: ${txn.gameCode} (Round:${txn.roundId})`
      });
    }
  }

  responseData = {
    id: id,
    statusCode: 0,
    timestampMillis: Date.now(),
    productId: productId,
    currency: currency || "THB",
    balanceBefore: balanceBefore,
    balanceAfter: balanceAfter,
    username: user.username
  };

  await HentoryLog.create({
    endpoint: path,
    headers,
    body,
    rawBody,
    response: responseData
  });

  return responseData;
};

exports.placeTips = async (body, headers, rawBody, path) => {
  const { id, username, productId, currency, txns } = body;
  let responseData = null;

  if (!username || !id || !txns || !Array.isArray(txns)) {
    responseData = {
      id: id || "",
      statusCode: 10001,
      productId: productId || "",
      timestampMillis: Date.now()
    };
    await HentoryLog.create({
      endpoint: path,
      headers,
      body,
      rawBody,
      response: responseData
    });
    return responseData;
  }

  const user = await User.findOne({ username });

  if (!user) {
    console.warn(`⚠️ Hentory placeTips query: User '${username}' not found`);
    responseData = {
      id: id,
      statusCode: 10001,
      productId: productId,
      timestampMillis: Date.now()
    };
    await HentoryLog.create({
      endpoint: path,
      headers,
      body,
      rawBody,
      response: responseData,
      error: "Member not found"
    });
    return responseData;
  }

  let totalTipAmount = 0;
  txns.forEach(txn => {
    totalTipAmount += txn.betAmount || 0;
  });

  const balanceBefore = user.credit || 0;

  if (balanceBefore < totalTipAmount) {
    console.warn(`⚠️ Hentory placeTips callback: Insufficient balance for user '${username}' (Needed tip: ${totalTipAmount}, Available: ${balanceBefore})`);
    responseData = {
      id: id,
      statusCode: 10001,
      productId: productId,
      timestampMillis: Date.now()
    };
    await HentoryLog.create({
      endpoint: path,
      headers,
      body,
      rawBody,
      response: responseData,
      error: "Insufficient balance"
    });
    return responseData;
  }

  if (totalTipAmount > 0) {
    await User.updateOne({ _id: user._id }, { $inc: { credit: -totalTipAmount } });
  }

  const updatedUser = await User.findById(user._id);
  const balanceAfter = updatedUser.credit || 0;

  if (totalTipAmount > 0) {
    await UserTransaction.create({
      user_id: user._id,
      type: "bet",
      amount: totalTipAmount,
      balance_before: balanceBefore,
      balance_after: balanceAfter,
      category: "game",
      provider_name: productId || "HENTORY",
      game_name: "Dealer Tip",
      bet_id: txns.map(t => t.id || t.roundId || "").filter(Boolean).join(', '),
      status: "LOSS",
      description: `Hentory Dealer Tip: ${txns.map(t => `Round:${t.roundId}`).join(', ')}`,
      created_at: new Date()
    });
  }

  responseData = {
    id: id,
    statusCode: 0,
    timestampMillis: Date.now(),
    productId: productId,
    currency: currency || "THB",
    balanceBefore: balanceBefore,
    balanceAfter: balanceAfter,
    username: user.username
  };

  await HentoryLog.create({
    endpoint: path,
    headers,
    body,
    rawBody,
    response: responseData
  });

  return responseData;
};

exports.cancelTips = async (body, headers, rawBody, path) => {
  const { id, username, productId, currency, txns } = body;
  let responseData = null;

  if (!username || !id || !txns || !Array.isArray(txns)) {
    responseData = {
      id: id || "",
      statusCode: 10001,
      productId: productId || "",
      timestampMillis: Date.now()
    };
    await HentoryLog.create({
      endpoint: path,
      headers,
      body,
      rawBody,
      response: responseData
    });
    return responseData;
  }

  const user = await User.findOne({ username });

  if (!user) {
    console.warn(`⚠️ Hentory cancelTips query: User '${username}' not found`);
    responseData = {
      id: id,
      statusCode: 10001,
      productId: productId,
      timestampMillis: Date.now()
    };
    await HentoryLog.create({
      endpoint: path,
      headers,
      body,
      rawBody,
      response: responseData,
      error: "Member not found"
    });
    return responseData;
  }

  let totalRefundAmount = 0;
  txns.forEach(txn => {
    totalRefundAmount += txn.betAmount || 0;
  });

  const balanceBefore = user.credit || 0;

  if (totalRefundAmount > 0) {
    await User.updateOne({ _id: user._id }, { $inc: { credit: totalRefundAmount } });
  }

  const updatedUser = await User.findById(user._id);
  const balanceAfter = updatedUser.credit || 0;

  if (totalRefundAmount > 0) {
    await UserTransaction.create({
      user_id: user._id,
      type: "refund",
      amount: totalRefundAmount,
      balance_before: balanceBefore,
      balance_after: balanceAfter,
      category: "game",
      provider_name: productId || "HENTORY",
      game_name: "Dealer Tip",
      bet_id: txns.map(t => t.id || t.roundId || "").filter(Boolean).join(', '),
      status: "CANCEL",
      description: `Hentory Cancel Tip Refund: ${txns.map(t => `Round:${t.roundId}`).join(', ')}`,
      created_at: new Date()
    });
  }

  responseData = {
    id: id,
    statusCode: 0,
    timestampMillis: Date.now(),
    productId: productId,
    currency: currency || "THB",
    balanceBefore: balanceBefore,
    balanceAfter: balanceAfter,
    username: user.username
  };

  await HentoryLog.create({
    endpoint: path,
    headers,
    body,
    rawBody,
    response: responseData
  });

  return responseData;
};

exports.voidSettled = async (body, headers, rawBody, path) => {
  const { id, username, productId, currency, txns } = body;
  let responseData = null;

  if (!username || !id || !txns || !Array.isArray(txns)) {
    responseData = {
      id: id || "",
      statusCode: 10001,
      productId: productId || "",
      timestampMillis: Date.now()
    };
    await HentoryLog.create({
      endpoint: path,
      headers,
      body,
      rawBody,
      response: responseData
    });
    return responseData;
  }

  const user = await User.findOne({ username });

  if (!user) {
    console.warn(`⚠️ Hentory voidSettled query: User '${username}' not found`);
    responseData = {
      id: id,
      statusCode: 10001,
      productId: productId,
      timestampMillis: Date.now()
    };
    await HentoryLog.create({
      endpoint: path,
      headers,
      body,
      rawBody,
      response: responseData,
      error: "Member not found"
    });
    return responseData;
  }

  let totalNetChange = 0;
  txns.forEach(txn => {
    if (txn.skipBalanceUpdate !== true) {
      totalNetChange += (txn.betAmount || 0) - (txn.payoutAmount || 0);
    }
  });

  const balanceBefore = user.credit || 0;

  if (balanceBefore + totalNetChange < 0) {
    console.warn(`⚠️ Hentory voidSettled callback: Insufficient balance for user '${username}' (Needed change: ${totalNetChange}, Available: ${balanceBefore})`);
    responseData = {
      id: id,
      statusCode: 10001,
      productId: productId,
      timestampMillis: Date.now()
    };
    await HentoryLog.create({
      endpoint: path,
      headers,
      body,
      rawBody,
      response: responseData,
      error: "Insufficient balance"
    });
    return responseData;
  }

  if (totalNetChange !== 0) {
    await User.updateOne({ _id: user._id }, { $inc: { credit: totalNetChange } });
  }

  const updatedUser = await User.findById(user._id);
  const balanceAfter = updatedUser.credit || 0;

  if (totalNetChange !== 0) {
    const description = `Hentory Void: ${txns.map(t => `${t.gameCode} (Round:${t.roundId})`).join(', ')}`;
    if (totalNetChange > 0) {
      await UserTransaction.create({
        user_id: user._id,
        type: "refund",
        amount: totalNetChange,
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        category: "game",
        provider_name: productId || "HENTORY",
        game_name: txns.map(t => t.gameCode || "").filter(Boolean).join(', '),
        bet_id: txns.map(t => t.id || t.roundId || "").filter(Boolean).join(', '),
        status: "CANCEL",
        description,
        created_at: new Date()
      });
    } else {
      await UserTransaction.create({
        user_id: user._id,
        type: "bet",
        amount: Math.abs(totalNetChange),
        balance_before: balanceBefore,
        balance_after: balanceAfter,
        category: "game",
        provider_name: productId || "HENTORY",
        game_name: txns.map(t => t.gameCode || "").filter(Boolean).join(', '),
        bet_id: txns.map(t => t.id || t.roundId || "").filter(Boolean).join(', '),
        status: "LOSS",
        description,
        created_at: new Date()
      });
    }
  }

  responseData = {
    id: id,
    statusCode: 0,
    timestampMillis: Date.now(),
    productId: productId,
    currency: currency || "THB",
    balanceBefore: balanceBefore,
    balanceAfter: balanceAfter,
    username: user.username
  };

  await HentoryLog.create({
    endpoint: path,
    headers,
    body,
    rawBody,
    response: responseData
  });

  return responseData;
};

exports.adjustBalance = async (body, headers, rawBody, path) => {
  const { id, username, productId, currency, txns } = body;
  let responseData = null;

  if (!username || !id || !txns || !Array.isArray(txns)) {
    responseData = {
      id: id || "",
      statusCode: 10001,
      productId: productId || "",
      timestampMillis: Date.now()
    };
    await HentoryLog.create({
      endpoint: path,
      headers,
      body,
      rawBody,
      response: responseData
    });
    return responseData;
  }

  const user = await User.findOne({ username });

  if (!user) {
    console.warn(`⚠️ Hentory adjustBalance query: User '${username}' not found`);
    responseData = {
      id: id,
      statusCode: 10001,
      productId: productId,
      timestampMillis: Date.now()
    };
    await HentoryLog.create({
      endpoint: path,
      headers,
      body,
      rawBody,
      response: responseData,
      error: "Member not found"
    });
    return responseData;
  }

  const balanceBefore = user.credit || 0;
  let totalNetChange = 0;
  let totalDeductionNeeded = 0;
  const transactionsToLog = [];

  for (const txn of txns) {
    const duplicateLog = await HentoryLog.findOne({
      "body.txns.refId": txn.refId,
      "response.statusCode": 0
    });

    if (duplicateLog) {
      console.log(`⚠️ Hentory adjustBalance: Duplicate refId '${txn.refId}' detected. Skipping.`);
      continue;
    }

    if (txn.status === "DEBIT") {
      totalNetChange -= txn.amount || 0;
      totalDeductionNeeded += txn.amount || 0;
      transactionsToLog.push({ type: "bet", amount: txn.amount, refId: txn.refId });
    } else if (txn.status === "CREDIT") {
      totalNetChange += txn.amount || 0;
      transactionsToLog.push({ type: "payout", amount: txn.amount, refId: txn.refId });
    }
  }

  if (balanceBefore < totalDeductionNeeded) {
    console.warn(`⚠️ Hentory adjustBalance callback: Insufficient balance for user '${username}' (Needed deduction: ${totalDeductionNeeded}, Available: ${balanceBefore})`);
    responseData = {
      id: id,
      statusCode: 10001,
      productId: productId,
      timestampMillis: Date.now()
    };
    await HentoryLog.create({
      endpoint: path,
      headers,
      body,
      rawBody,
      response: responseData,
      error: "Insufficient balance"
    });
    return responseData;
  }

  if (totalNetChange !== 0) {
    await User.updateOne({ _id: user._id }, { $inc: { credit: totalNetChange } });
  }

  const updatedUser = await User.findById(user._id);
  const balanceAfter = updatedUser.credit || 0;

  for (const logTxn of transactionsToLog) {
    await UserTransaction.create({
      user_id: user._id,
      type: logTxn.type,
      amount: logTxn.amount,
      balance_before: balanceBefore,
      balance_after: balanceAfter,
      category: "game",
      provider_name: productId || "HENTORY",
      game_name: "Adjust Balance",
      bet_id: logTxn.refId || "",
      status: logTxn.type === "bet" ? "LOSS" : "WIN",
      description: `Hentory Adjust Balance ${logTxn.type === "bet" ? "DEBIT" : "CREDIT"} (Ref: ${logTxn.refId})`,
      created_at: new Date()
    });
  }

  responseData = {
    id: id,
    statusCode: 0,
    timestampMillis: Date.now(),
    productId: productId,
    currency: currency || "THB",
    balanceBefore: balanceBefore,
    balanceAfter: balanceAfter,
    username: user.username
  };

  await HentoryLog.create({
    endpoint: path,
    headers,
    body,
    rawBody,
    response: responseData
  });

  return responseData;
};

async function logGameTransaction({
  user_id,
  productId,
  txn,
  type,
  amount,
  balanceBefore,
  balanceAfter,
  description
}) {
  const betId = txn.id || txn.roundId || "";
  if (!betId) return;

  let existing = await UserTransaction.findOne({ bet_id: betId, category: "game" });

  if (existing) {
    if (type === "payout") {
      existing.payout_amount = (existing.payout_amount || 0) + amount;
    } else if (type === "bet") {
      existing.amount = (existing.amount || 0) + amount;
    } else if (type === "refund") {
      existing.payout_amount = (existing.payout_amount || 0) + amount;
      existing.status = "CANCEL";
    }

    if (existing.status !== "CANCEL") {
      existing.status = existing.payout_amount > 0 ? "WIN" : "LOSE";
    }

    existing.balance_after = balanceAfter;
    if (description) existing.description = description;
    await existing.save();
    return existing;
  } else {
    const newTxn = await UserTransaction.create({
      user_id,
      type: type === "payout" ? "payout" : "bet",
      amount: type === "bet" ? amount : (txn.betAmount || 0),
      payout_amount: type === "payout" ? amount : (txn.payoutAmount || 0),
      balance_before: balanceBefore,
      balance_after: balanceAfter,
      category: "game",
      provider_name: productId || "HENTORY",
      game_name: txn.gameCode || "",
      bet_id: betId,
      status: type === "refund" ? "CANCEL" : (type === "payout" ? "WIN" : ((txn.payoutAmount || 0) > 0 ? "WIN" : "LOSE")),
      description: description || `Hentory ${type}`,
      created_at: new Date()
    });
    return newTxn;
  }
}
