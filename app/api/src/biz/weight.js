const { FindFromMongo } = require('../common/mongo');
const { FormatDate } = require('../common/utils');
const { OneDayInMilliSec } = require('../common/consts');

const collectionWeightLog = "weightlog";

module.exports = {
    GetWeeklyWeightStats,
}


async function GetWeeklyWeightStats(userId, endDateStr, endTime) {
    let startDate = new Date(endDateStr);
    startDate.setDate(startDate.getDate() - 6);
    const startTime = endTime - OneDayInMilliSec * 7;
    const weightLogs = await FindFromMongo(collectionWeightLog, {userId: userId, timestamp: {$gte: startTime, $lt: endTime}});
    return formatStats(startDate, startTime, weightLogs);
}

async function formatStats(startDate, startTime, weightLogs) {
    let stats = [];
    let j = 0;
    for (let i = 0; i < 7; i++) {
        let theDay = new Date(startDate.toLocaleDateString());
        theDay.setDate(theDay.getDate() + i);
        const begin = startTime + i * OneDayInMilliSec;
        const end = startTime + (i+1) * OneDayInMilliSec;
        let stat = {
            date: FormatDate(theDay.toLocaleDateString()),
            unit: "kg"
        };
        if (j < weightLogs.length && weightLogs[j].timestamp >= begin && weightLogs[j].timestamp < end) {
            stat.value = weightLogs[j].value;
            stat.unit = weightLogs[j].unit;
            j++;
        }
        stats.push(stat);
    }
    return stats;
}
