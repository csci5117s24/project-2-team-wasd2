const { FindFromMongo } = require('../common/mongo');
const { FormatDate } = require('../common/utils');
const { OneDayInMilliSec } = require('../common/consts');


module.exports = {
    GetWaterLogStatistics,
    FormatWaterLogs
}

const defaultUnit = "oz";

async function GetWaterLogStatistics(userId, rangeType, endDateStr, endTime) {
    const waterGoal = await FindFromMongo("water_goal", {userId: userId});
    let goalUnit;
    if (!waterGoal || waterGoal.length == 0) {
        goalUnit = defaultUnit;
    } else {
        goalUnit = waterGoal[0].unit;
    }
    var res = [];
    if (rangeType === "days") {
        res = await getLast7DayLog(userId, goalUnit, endDateStr, endTime);
    } else if (rangeType === "weeks") {
        res = await getLast4WeekLog(userId, goalUnit, endDateStr, endTime);
    } else if (rangeType === "months") {
        res = await getLast12MonthLog(userId, goalUnit, endDateStr, endTime);
    }
    return res;
}

const weekDays = ["Sun", "Mon", "Thu", "Wed", "Tru", "Fri", "Sat"];
const months = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sep", "Oct", "Nov", "Dec"];

async function getLast7DayLog(userId, unit, endDateStr, endTime) {
    const startTime = endTime - OneDayInMilliSec * 7;
    const waterLogs = await FindFromMongo("water", {userId: userId, timestamp: {$gte: startTime, $lt: endTime}});

    function keyFunc(waterLog) {
        return waterLog.localeDate;
    }
    let stats = calStat(waterLogs, keyFunc, unit);

    let res = [];
    for (let i = 6; i >= 0; i--) {
        let theDay = new Date(endDateStr);
        theDay.setDate(theDay.getDate() - i);
        const key = theDay.toLocaleDateString();
        const value = stats[key] ?? 0;
        res.push({
            label: FormatDate(theDay.toLocaleDateString()),
            value: value
        })
    }

    return {
        unit: unit,
        dataset: res
    }
}

function dateDiffInDays(date1, date2) {
    const _MS_PER_DAY = 1000 * 60 * 60 * 24;
    const diffTime = Math.abs(date2 - date1);
    const diffDays = Math.floor(diffTime/_MS_PER_DAY); 
  
    return diffDays;
}

function genWeeksLable(startDate) {
    let res = [];
    for (let i = 1; i <= 4; i++) {
        const s = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()+(i-1)*7);
        const e = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate()+(i-1)*7+6);
        res.push(s.toLocaleDateString() + "-" + e.toLocaleDateString());
    }
    return res
}

async function getLast4WeekLog(userId, unit, endDateStr, endTime) {
    const startTime = endTime - OneDayInMilliSec * 27;
    const waterLogs = await FindFromMongo("water", {userId: userId, timestamp: {$gte: startTime, $lt: endTime}});

    function keyFunc(waterLog) {
        const diffDays = (endTime - waterLog.timestamp) / OneDayInMilliSec;
        return Math.floor(diffDays / 7);
    }
    let stats = calStat(waterLogs, keyFunc, unit);
    let startDate = new Date(endDateStr);
    startDate.setDate(startDate.getDate() -27);
    const weeks = genWeeksLable(startDate);

    let res = [];
    for (let i = 0; i < 4; i++) {
        res.push({
            label: weeks[i],
            value: stats[3-i] ?? 0
        })
    }

    return {
        unit: unit,
        dataset: res
    }
}

async function getLast12MonthLog(userId, unit, endDateStr, endTime) {

    const startTime = endTime - OneDayInMilliSec * 365; // small inaccuracy here

    const waterLogs = await FindFromMongo("water", {userId: userId, timestamp: {$gte: startTime, $lt: endTime}});

    function keyFunc(waterLog) {
        const splits = waterLog.localeDate.split("/");
        return parseInt(splits[0]) - 1;
    }
    let stats = calStat(waterLogs, keyFunc, unit);

    const endDate = new Date(endDateStr);
    const firstMonth = endDate.getMonth();
    let res = [];
    for (let i = 0; i < 12; i++) {
        const idx = (firstMonth+i) % 12;
        const value = stats[idx] ?? 0;
        res.push({
            label: months[idx],
            value: value
        })
    }

    return {
        unit: unit,
        dataset: res
    }
}

function calStat(waterLogs, keyFunc, targetUnit) {
    let res = {};
    for (let i = 0; i < waterLogs.length; i++) {
        let value = waterLogs[i].value;
        if (waterLogs[i].unit !== targetUnit) {
            value = transToUnit(value, targetUnit);
        } 
        const key = keyFunc(waterLogs[i]);
        if (key in res) {
            res[key] += value
        } else {
            res[key] = value
        }
    }
    return res
}



async function FormatWaterLogs(userId, waterLogs) {
    let waterGoal = await FindFromMongo("water_goal", {userId: userId});
    if (!waterGoal || waterGoal.length == 0) {
        waterGoal = [{value: 0, unit: 'ml'}];
    }
    const goalUnit = waterGoal[0].unit;
    return waterLogs.map((log) => {
        if (log.unit === goalUnit) {
            return log
        } else {
            let transedLog = log;
            transedLog.value = transToUnit(log.value, goalUnit);
            transedLog.unit = goalUnit;
            return transedLog;
        }
    })
}

const ozToMlCoefficient = 29.5735;
const mlToOzCoefficient = 0.033814;
function transToUnit(value, unit) {
    if (unit == "ml") {
        return Math.round(value * ozToMlCoefficient);
    } else if (unit == "oz") {
        return Math.round(value * mlToOzCoefficient);
    } else {
        return value;
    }
}