const { FindFromMongo, InsertToMongo, UpdateMongo, DeleteFromMongo, FindByIDFromMongo, FindFromMongoWithSort } = require('../common/mongo');
const { FormatDate } = require('../common/utils');
const { OneDayInMilliSec } = require('../common/consts');

module.exports = {
    GetExerciseLogs,
    AddExerciseLog,
    UpdateExerciseLog,
    DeleteExerciseLog,
    SetDailyCalorieGoal,
    GetDailyCalorieGoal,
    AddCalorieLog,
    DeleteCalorieLog,
    GetCalorieLogs,
    GetWeeklyCalorieStats
}

const collectionCalorieGoal = "calorie_goal";
const collectionCalorieLog = "calorie_log";
const collectionExerciseLog = "exercise_logs";


// Fetch exercise logs for a user
async function GetExerciseLogs(userId) {
    return await FindFromMongo("exercise_logs", { userId: userId });
}

// Add a new exercise log
async function AddExerciseLog(exerciseLog) {
    return await InsertToMongo("exercise_logs", exerciseLog);
}

//Update an existing exercise log
async function UpdateExerciseLog(logId, updates) {
    return await UpdateMongo("exercise_logs", logId, updates);
}

async function SetDailyCalorieGoal(userId, data) {
    const existingGoal = await FindFromMongo(collectionCalorieGoal, {userId: userId, localeDate: data.localeDate});
    if (existingGoal && existingGoal.length > 0) {
        const recordID = existingGoal[0]._id;
        await UpdateMongo(collectionCalorieGoal, recordID, {goal: data.goal});
    } else {
        const goalRecord = {
            userId: userId,
            goal: data.goal,
            localeDate: data.localeDate,
            timestamp: data.timestamp
            // createdAt: new Date()
        }
        await InsertToMongo(collectionCalorieGoal, goalRecord);
    }
}

async function GetDailyCalorieGoal(userId) {
    const goal = await GetLatestCalorieGoal(userId);
    return goal;
}

async function DeleteExerciseLog(userId, logId) {
    const existingGoal = await FindByIDFromMongo(collectionExerciseLog, logId);
    if (!existingGoal || existingGoal.userId !== userId) {
        return -1;
    }
    await DeleteFromMongo(collectionExerciseLog, logId);
    return 0;
}


async function AddCalorieLog(userId, data) {
    const exercise = await FindByIDFromMongo(collectionExerciseLog, data.exerciseId);
    if (!exercise || exercise.userId !== userId) {
        return -1;
    }
    const calorieLog = {
        userId: userId,
        exerciseId: data.exerciseId,
        exerciseName: exercise.title,
        calories: exercise.calories,
        timestamp: data.timestamp,
        localeDate: data.localeDate,
        // createdAt: new Date(),
    }
    
    const logId = await InsertToMongo(collectionCalorieLog, calorieLog);

    return logId 
}

async function GetCalorieLogs(userId, dateStr) {
    const logs = await FindFromMongo(collectionCalorieLog, {userId: userId, localeDate: dateStr});
    return logs;
}

async function DeleteCalorieLog(userId, logId) {
    const calorieLog = await FindByIDFromMongo(collectionCalorieLog, logId);
    if (!calorieLog || calorieLog.userId !== userId) {
        return -1;
    }
    await DeleteFromMongo(collectionCalorieLog, logId);
    return 0;
}

async function GetLatestCalorieGoal(userId) {
    const latestGoal = await FindFromMongoWithSort(collectionCalorieGoal, {userId: userId}, {_id: -1});
    return latestGoal ? latestGoal[0] : {};
}


async function GetWeeklyCalorieStats(userId, endDateStr, endTime) {
    const startTime = endTime - OneDayInMilliSec * 7;
    const calorieLogs = await FindFromMongo(collectionCalorieLog, {userId: userId, timestamp: {$gte: startTime, $lt: endTime}});
    let calorieGoals = await FindFromMongo(collectionCalorieGoal, {userId: userId, timestamp: {$gte: startTime, $lt: endTime}});
    if (!calorieGoals || calorieGoals.length === 0) {
        let latestGoal = await GetLatestCalorieGoal(userId);
        if (!latestGoal) {
            latestGoal = {
                goal: 0,
                timestamp: 0
            }
        }
        calorieGoals = [latestGoal];
    }
    const stats = formatCalorieStats(calorieLogs, calorieGoals);

    let res = [];
    let j = 0;
    for (let i = 6; i >= 0; i--) {
        let theDay = new Date(endDateStr);
        theDay.setDate(theDay.getDate() - i);
        const key = theDay.toLocaleDateString();
        if (key in stats) {
            res.push(stats[key]);
        }  else {
            while (j < calorieGoals.length-1 && calorieGoals[j+1].timestamp > theDay.getTime()) {
                j++;
            }
            res.push({
                date: FormatDate(theDay.toLocaleDateString()),
                calories: 0,
                calorieGoal: calorieGoals[j].goal,
            })
        }
    }
    return res
}


function formatCalorieStats(calorieLogs, calorieGoals) {
    let res = {};
    let i = calorieLogs.length - 1;
    let j = calorieGoals.length - 1;
    for ( ; i  >= 0; i--) {
        const key = calorieLogs[i].localeDate;
        if (key in res) {
            res[key].calories += calorieLogs[i].calories;
        } else {
            while (j > 0 && calorieGoals[j].timestamp > calorieLogs[i].timestamp) {
                j--;
            }
            let stat = {
                date: FormatDate(calorieLogs[i].localeDate),
                calories: calorieLogs[i].calories,
                calorieGoal: calorieGoals[j].goal,
            }
            res[key] = stat;
        }
    }
    return res
}
