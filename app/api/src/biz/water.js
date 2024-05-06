const { FindFromMongo } = require('../common/mongo');
const { FormatDate } = require('../common/utils');


module.exports = {
    GetWaterLogStatistics,
    FormatWaterLogs
}

const defaultUnit = "oz";

async function GetWaterLogStatistics(userId, rangeType, endDateStr) {
    const waterGoal = await FindFromMongo("water_goal", {userId: userId});
    let goalUnit;
    if (!waterGoal || waterGoal.length == 0) {
        goalUnit = defaultUnit;
    } else {
        goalUnit = waterGoal[0].unit;
    }
    var res = [];
    if (rangeType === "days") {
        res = await getLast7DayLog(userId, goalUnit, endDateStr);
    } else if (rangeType === "weeks") {
        res = await getLast4WeekLog(userId, goalUnit, endDateStr);
    } else if (rangeType === "months") {
        res = await getLast12MonthLog(userId, goalUnit, endDateStr);
    }
    return res;
}

const weekDays = ["Sun", "Mon", "Thu", "Wed", "Tru", "Fri", "Sat"];
const months = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sep", "Oct", "Nov", "Dec"];

async function getLast7DayLog(userId, unit, endDateStr) {
    let endDate = new Date(endDateStr);
    endDate.setDate(endDate.getDate()+1);
    let startDate = new Date(endDateStr);
    startDate.setDate(startDate.getDate() -6);
    const waterLogs = await FindFromMongo("water", {userId: userId, createDate: {$gte: startDate, $lt: endDate}});

    function keyFunc(date) {
        return date.toLocaleDateString(); 
    }
    let stats = calStat(waterLogs, keyFunc, unit);

    let res = [];
    for (let i = 0; i < 7; i++) {
        let theDay = new Date(startDate.toLocaleDateString());
        theDay.setDate(theDay.getDate() + i);
        const key = theDay.toLocaleDateString();
        const value = stats[key] ?? 0;
        res.push({
            label: FormatDate(theDay),
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

async function getLast4WeekLog(userId, unit, endDateStr) {
    let endDate = new Date(endDateStr);
    endDate.setDate(endDate.getDate()+1);
    let startDate = new Date(endDateStr);
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

async function getLast12MonthLog(userId, unit, endDateStr) {
    // const today = new Date().toLocaleDateString();
    let endDate = new Date(endDateStr);
    // the first day of next month
    endDate.setMonth(endDate.getMonth() + 1);
    endDate.setDate(1);
    // the day one year ahead endDate
    let startDate = new Date(endDateStr);
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
        let value = waterLogs[i].value;
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