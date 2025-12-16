const UserBet = require("../../models/userBetSchema.models");
const LotterySets = require("../../models/lotterySets.model");
const LotteryType = require("../../models/lotteryType.model");
const { handleSuccess, handleError } = require("../../utils/responseHandler");

// รายงานสรุปภาพรวมหวยทุกประเภท
exports.getLotteryOverviewReport = async ({ startDate, endDate }) => {
    try {
        // ถ้าไม่ส่งวันที่มา จะคำนวณทั้งหมด (ไม่จำกัดช่วงเวลา)
        const start = startDate ? new Date(startDate + "T00:00:00.000Z") : null;
        const end = endDate ? new Date(endDate + "T23:59:59.999Z") : null;

        console.log("Fetching lottery overview report:", { start, end });

        // ดึงข้อมูลทุกประเภทหวย
        const lotteryTypes = await LotteryType.find();

        const overview = [];
        let grandTotal = {
            totalBetAmount: 0,
            totalPayoutAmount: 0,
            totalProfit: 0,
            totalPlayers: 0,
            totalRounds: 0
        };

        for (const lotteryType of lotteryTypes) {
            // หา lottery_set_id ที่เกี่ยวข้อง
            const query = { lottery_type_id: lotteryType._id };

            // ถ้ามีการระบุช่วงเวลา ให้กรองตามวันที่
            if (start && end) {
                query.result_time = { $gte: start, $lte: end };
            } else if (start) {
                query.result_time = { $gte: start };
            } else if (end) {
                query.result_time = { $lte: end };
            }

            const lotterySets = await LotterySets.find(query);

            const lotterySetIds = lotterySets.map(ls => ls._id);

            if (lotterySetIds.length === 0) {
                overview.push({
                    lotteryTypeName: lotteryType.lottery_type,
                    totalBetAmount: 0,
                    totalPayoutAmount: 0,
                    totalProfit: 0,
                    totalPlayers: 0,
                    totalRounds: 0
                });
                continue;
            }

            // คำนวณสถิติ
            const bets = await UserBet.find({
                lottery_set_id: { $in: lotterySetIds },
                status: { $ne: "cancelled" }
            });

            const totalBetAmount = bets.reduce((sum, bet) => sum + bet.total_bet_amount, 0);
            const totalPayoutAmount = bets.reduce((sum, bet) => sum + bet.payout_amount, 0);
            const totalProfit = totalBetAmount - totalPayoutAmount;
            const uniquePlayers = [...new Set(bets.map(bet => bet.user_id.toString()))].length;

            overview.push({
                lotteryTypeName: lotteryType.lottery_type,
                totalBetAmount,
                totalPayoutAmount,
                totalProfit,
                totalPlayers: uniquePlayers,
                totalRounds: lotterySets.length
            });

            // รวมเข้า grand total
            grandTotal.totalBetAmount += totalBetAmount;
            grandTotal.totalPayoutAmount += totalPayoutAmount;
            grandTotal.totalProfit += totalProfit;
            grandTotal.totalPlayers += uniquePlayers;
            grandTotal.totalRounds += lotterySets.length;
        }

        console.log("Overview report generated:", { totalTypes: overview.length });

        return handleSuccess(
            {
                overview,
                grandTotal,
                dateRange: {
                    startDate: start ? start.toISOString().split('T')[0] : "ทั้งหมด",
                    endDate: end ? end.toISOString().split('T')[0] : "ทั้งหมด"
                }
            },
            "ดึงข้อมูลรายงานสรุปภาพรวมสำเร็จ",
            200
        );
    } catch (error) {
        console.error("Error in getLotteryOverviewReport:", error);
        return handleError(error, "เกิดข้อผิดพลาดในการดึงข้อมูลรายงานสรุปภาพรวม");
    }
};
