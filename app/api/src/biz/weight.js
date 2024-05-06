const { FindFromMongo } = require('../common/mongo');
const { FormatDate } = require('../common/utils');

const collectionWeightLog = "weightlog";
const oneDayInMilliSec = 1000 * 24 * 60 * 60;

module.exports = {
    GetWeeklyWeightStats,
}


async function GetWeeklyWeightStats(userId, endDateStr) {
    let startTime = new Date(endDateStr);
    startTime.setDate(startTime.getDate() - 6);
    let endTime = new Date(endDateStr);
    endTime.setDate(endTime.getDate() + 1);
    const weightLogs = await FindFromMongo(collectionWeightLog, {userId: userId, timestamp: {$gte: startTime.getTime(), $lt: endTime.getTime()}});
    return formatStats(startTime, weightLogs);
}

async function formatStats(startTime, weightLogs) {
    let stats = [];
    let j = 0;
    for (let i = 0; i < 7; i++) {
        let theDay = new Date(startTime.toLocaleDateString());
        theDay.setDate(theDay.getDate() + i);
        const begin = startTime.getTime() + i * oneDayInMilliSec;
        const end = startTime.getTime() + (i+1) * oneDayInMilliSec;
        let stat = {
            date: FormatDate(theDay),
            unit: "kg"
        };
        if (j < weightLogs.length && weightLogs[j].timestamp >= begin && weightLogs[j].timestamp < end) {
            stat.value = weightLogs[j].value;
            stat.unit = weightLogs[j].unit;
            j++
        }
        stats.push(stat);
    }
    return stats;
}
