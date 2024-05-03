const { FindFromMongo } = require('../common/mongo');


module.exports = {
    GetWaterLogStatistics,
    FormatWaterLogs
}

const defaultUnit = "oz";

async function GetWaterLogStatistics(userId, rangeType) {
    const waterGoal = await FindFromMongo("water_goal", {userId: userId});
    let goalUnit;
    if (!waterGoal || waterGoal.length == 0) {
        goalUnit = defaultUnit;
    } else {
        goalUnit = waterGoal[0].unit;
    }
    var res = [];
    if (rangeType === "days") {
        res = await getLast7DayLog(userId, goalUnit);
    } else if (rangeType === "weeks") {
        res = await getLast4WeekLog(userId, goalUnit);
    } else if (rangeType === "months") {
        res = await getLast12MonthLog(userId, goalUnit);
    }
    return res;
}

const weekDays = ["Sun", "Mon", "Thu", "Wen", "Tru", "Fri", "Sat"];
const months = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sep", "Oct", "Nov", "Dec"];

async function getLast7DayLog(userId, unit) {
    const today = new Date().toLocaleDateString();
    let endDate = new Date(today);
    endDate.setDate(endDate.getDate()+1);
    let startDate = new Date(today);
    startDate.setDate(startDate.getDate() -7);
    const waterLogs = await FindFromMongo("water", {userId: userId, createDate: {$gte: startDate, $lt: endDate}});

    function keyFunc(date) {
        return date.getDay(); 
    }
    let stats = calStat(waterLogs, keyFunc, unit);

    const firstDate = endDate.getDay();
    let res = [];
    for (let i = 0; i < 7; i++) {
        const idx = (firstDate+i) % 7;
        const value = stats[idx] ?? 0;
        res.push({
            label: weekDays[idx],
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
        const s = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDay()+(i-1)*7);
        const e = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDay()+(i-1)*7+6);
        res.push(s.toLocaleDateString() + "-" + e.toLocaleDateString());
    }
    return res
}

async function getLast4WeekLog(userId, unit) {
    const today = new Date().toLocaleDateString();
    let endDate = new Date(today);
    endDate.setDate(endDate.getDate()+1);
    let startDate = new Date(today);
    startDate.setDate(startDate.getDate() -27);
    const waterLogs = await FindFromMongo("water", {userId: userId, createDate: {$gte: startDate, $lt: endDate}});

    function keyFunc(date) {
        const diffDays = dateDiffInDays(date, endDate);
        return Math.floor(diffDays / 7);
    }
    let stats = calStat(waterLogs, keyFunc, unit);
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

async function getLast12MonthLog(userId, unit) {
    const today = new Date().toLocaleDateString();
    let endDate = new Date(today);
    // the first day of next month
    endDate.setMonth(endDate.getMonth() + 1);
    endDate.setDate(1);
    // the day one year ahead endDate
    let startDate = new Date(today);
    startDate.setMonth(startDate.getMonth() + 1);
    startDate.setDate(1);
    startDate.setFullYear(startDate.getFullYear()-1);

    const waterLogs = await FindFromMongo("water", {userId: userId, createDate: {$gte: startDate, $lt: endDate}});

    function keyFunc(date) {
        return date.getMonth(); 
    }
    let stats = calStat(waterLogs, keyFunc, unit);

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
        const value = waterLogs[i].value;
        if (waterLogs[i].unit !== targetUnit) {
            value = transToUnit(value, targetUnit);
        } 
        const key = keyFunc(waterLogs[i].createDate);
        if (key in res) {
            res[key] += value
        } else {
            res[key] = value
        }
    }
    return res
}



async function FormatWaterLogs(userId, waterLogs) {
    const waterGoal = await FindFromMongo("water_goal", {userId: userId});
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