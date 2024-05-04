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
    // console.log("work ", exerciseLog)
    return await InsertToMongo("exercise_logs", exerciseLog);
}

//Update an existing exercise log
async function UpdateExerciseLog(logId, updates) {
    return await UpdateMongo("exercise_logs", logId, updates);
}

async function SetDailyCalorieGoal(userId, goal) {
    const today = new Date().toLocaleDateString();
    let startTime = new Date(today);
    let endTime = new Date(today);
    endTime.setHours(endTime.getHours() + 24);
    const existingGoal = await FindFromMongo(collectionCalorieGoal, {userId: userId, createdAt: {$gte:startTime, $lt:endTime}});
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
        exerciseId: exerciseId,
        exerciseName: exercise.title,
        calories: exercise.calories,
        createdAt: new Date(),
    }
    
    const logId = await InsertToMongo(collectionCalorieLog, calorieLog);

    return logId 
}

async function GetCalorieLogs(userId, dateStr) {
    const startTime = new Date(dateStr);
    let endTime = new Date(dateStr);
    endTime.setHours(endTime.getHours() + 24);
    const logs = await FindFromMongo(collectionCalorieLog, {userId: userId, createdAt: {$gte: startTime, $lt: endTime}});
    return logs;
}

async function DeleteCalorieLog(userId, exerciseId, dateStr) {
    const startTime = new Date(dateStr);
    let endTime = new Date(dateStr);
    endTime.setHours(endTime.getHours() + 24);
    const calorieLogs = await FindFromMongo(collectionCalorieLog, 
        {userId: userId, exerciseId: exerciseId, createdAt: {$gte: startTime, $lt: endTime}});
    if (!calorieLogs || calorieLogs.length === 0) {
        return -1;
    }
    await DeleteFromMongo(collectionCalorieLog, calorieLogs[calorieLogs.length-1]._id);
    return 0;
}

async function GetLatestCalorieGoal(userId) {
    const latestGoal = await FindFromMongoWithSort(collectionCalorieGoal, {userId: userId}, {_id: -1});
    return latestGoal ? latestGoal[0] : {};
}


async function GetWeeklyCalorieStats(userId, endDateStr) {
    let startTime = new Date(endDateStr);
    startTime.setDate(startTime.getDate() - 6);
    let endTime = new Date(endDateStr);
    endTime.setDate(endTime.getDate() + 1);
    const calorieLogs = await FindFromMongo(collectionCalorieLog, {userId: userId, createdAt: {$gte: startTime, $lt: endTime}});
    let calorieGoals = await FindFromMongo(collectionCalorieGoal, {userId: userId, createdAt: {$gte: startTime, $lt: endTime}});
    if (!calorieGoals || calorieGoals.length === 0) {
        let latestGoal = await GetLatestCalorieGoal();
        if (!latestGoal) {
            latestGoal = {
                goal: 0,
                createdAt: new Date()
            }
        }
        calorieGoals = [latestGoal];
    }

    const stats = formatCalorieStats(calorieLogs, calorieGoals);

    let res = [];
    let j = calorieGoals.length-1;
    for (let i = 6; i >= 0; i--) {
        let theDay = new Date(endDateStr);
        theDay.setDate(theDay.getDate() - i);
        const key = theDay.toLocaleDateString();
        if (key in stats) {
            res.push(stats[key]);
        }  else {
            while (j > 0  && calorieGoals[j].createdAt > theDay) {
                j--;
            }
            res.push({
                date: FormatDate(theDay),
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
        const key = calorieLogs[i].createdAt.toLocaleDateString();
        if (key in res) {
            res[key].calories += calorieLogs[i].calories;
        } else {
            while (j > 0 && calorieGoals[j].createdAt > calorieLogs[i].createdAt) {
                j--;
            }
            let stat = {
                date: FormatDate(calorieLogs[i].createdAt),
                calories: calorieLogs[i].calories,
                calorieGoal: calorieGoals[j].goal,
            }
            res[key] = stat;
        }
    }
    return res
}
