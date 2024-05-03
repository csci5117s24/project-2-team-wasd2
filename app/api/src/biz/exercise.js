const { FindFromMongo, InsertToMongo, UpdateMongo, DeleteFromMongo } = require('../common/mongo');

module.exports = {
    GetExerciseLogs,
    AddExerciseLog,
    UpdateExerciseLog,
}

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


