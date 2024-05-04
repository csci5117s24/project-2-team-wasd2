const { FindFromMongo, InsertToMongo, UpdateMongo, DeleteFromMongo, FindByIDFromMongo, FindFromMongoWithSort } = require('../common/mongo');
const { FormatDate } = require('../common/utils');

module.exports = {
    GetExerciseLogs,
    AddExerciseLog,
    UpdateExerciseLog,
    DeleteExerciseLog,
    SetDailyCalorieGoal,
    GetDailyCalorieGoal,
    AddCalorieLog,
    DeleteCalorieLog,
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
    console.log("work ", exerciseLog)
    return await InsertToMongo("exercise_logs", exerciseLog);
}

//Update an existing exercise log
async function UpdateExerciseLog(logId, updates) {
    return await UpdateMongo("exercise_logs", logId, updates);
}

async function SetDailyCalorieGoal(userId, goal) {
    const today = new Date();
    const startTime = new Date(today.getFullYear(), today.getMonth(), today.getDay());
    const endTime = new Date(today.getFullYear(), today.getMonth(), today.getDay()+1);
    const existingGoal = await FindFromMongo("exercise_goal", {userId: userId, createdAt: {$gte:startTime, $lt:endTime}});
    if (existingGoal && existingGoal.length > 0) {
        const recordID = existingGoal[0]._id;
        await UpdateMongo(collectionCalorieGoal, recordID, {goal: goal});
    } else {
        const goalRecord = {
            userId: userId,
            goal: goal,
            createdAt: new Date()
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


async function AddCalorieLog(userId, exerciseId) {
    const exercise = await FindByIDFromMongo(collectionExerciseLog, exerciseId);
    if (!exercise || exercise.userId !== userId) {
        return -1;
    }
    const calorieLog = {
        userId: userId,
        exerciseName: exercise.title,
        calories: exercise.calories,
        createdAt: new Date(),
    }
    
    const logId = await InsertToMongo(collectionCalorieLog, calorieLog);

    return logId 
}

async function GetCalorieLogs(userId, dateStr) {
    const theDay = new Date(dateStr);
    const startTime = new Date(theDay.getFullYear(), theDay.getMonth(), theDay.getDay());
    const endTime = new Date(theDay.getFullYear(), theDay.getMonth(), theDay.getDay()+1);

    const logs = await FindFromMongo(collectionCalorieLog, {userId: userId, createdAt: {$gte: startTime, $lt: endTime}});
    return logs;
}

async function DeleteCalorieLog(userId, calorieLogId) {
    const calorieLog = await FindByIDFromMongo(collectionCalorieLog, calorieLogId);
    if (!calorieLog || exercise.userId !== userId) {
        return -1;
    }
    await DeleteFromMongo(collectionCalorieGoal, calorieLogId);
}

async function GetLatestCalorieGoal(userId) {
    const latestGoal = await FindFromMongoWithSort(collectionCalorieGoal, {userId: userId}, {createdAt: -1});
    return latestGoal ? latestGoal[0] : {};
}


async function GetWeeklyCalorieStats(userId, endDateStr) {
    const endDate = new Date(endDateStr);
    const year = endDate.getFullYear();
    const month = endDate.getMonth();
    const day = endDate.getDay();
    const startTime = new Date(year, month, day - 6);
    const endTime = new Date(year, month, day +1 );
    const calorieLogs = await FindFromMongo(collectionCalorieLog, {userId: userId, createdAt: {$gte: startTime, $lt: endTime}});
    if (!calorieLogs) {
        return [];
    }
    let calorieGoals = await FindFromMongo(collectionCalorieGoal, {userId: userId, createdAt: {$gte: startTime, $lt: endTime}});
    if (!calorieGoals) {
        const latestGoal = await GetLatestCalorieGoal();
        calorieGoals = [latestGoal];
    }

    const stats = formatCalorieStats(calorieLogs, calorieGoals);

    let res = [];
    let j = 0;
    for (let i = 6; i >= 0; i++) {
        const theDay = new Date(year, month, day-i);
        const key = theDay.toLocaleDateString();
        if (key in stats) {
            res.push(stats[key]);
        }  else {
            while (j < calorieGoals.length - 1 && calorieGoals[j+1].createdAt < theDay) {
                j++;
            }
            res.push({
                date: FormatDate(theDay),
                calories: 0,
                calorieGoal: calorieGoals[j].calories,
            })
        }
    }
}


function formatCalorieStats(calorieLogs, calorieGoals) {
    let res = {};
    let i = calorieLogs.length - 1;
    let j = calorieGoals.length - 1;
    for ( ; i  >= 0; i--) {
        const key = calorieLogs[i].toLocaleDateString();
        if (key in res) {
            res[key].calories += calorieLogs[i].calories;
        } else {
            while (j > 0 && calorieGoals[j].createdAt > calorieLogs[i].createdAt) {
                j--;
            }
            let stat = {
                date: FormatDate(calorieLogs[i].createdAt),
                calories: calorieLogs[i].calories,
                calorieGoal: calorieGoals[j].calories,
            }
            res[key] = stat;
        }
    }
    return res
}
