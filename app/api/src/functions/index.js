const { app } = require('@azure/functions');
const { MongoClient, ObjectID} = require('mongodb');
const { FindByIDFromMongo, UpdateMongo, DeleteFromMongo, FindFromMongo } = require('../common/mongo');
const { FormatWaterLogs, GetWaterLogStatistics} = require('../biz/water');
const { GetWeeklyWeightStats } = require('../biz/weight');
const { 
    AddExerciseLog, SetDailyCalorieGoal, GetDailyCalorieGoal, AddCalorieLog, DeleteCalorieLog,GetCalorieLogs, GetWeeklyCalorieStats,
} = require('../biz/exercise');


app.http('ping', {
    methods: ['GET'],
    authLevel: "anonymous",
    route: 'ping',
    handler: async (request, context) => {
        return {
            jsonBody: {
                "data": "pong"
            }
        }
    }
})


async function authenticate(request) {
    const auth_header = request.headers.get("X-MS-CLIENT-PRINCIPAL");
    let token = null; 
    if (auth_header) {
        token = JSON.parse(Buffer.from(auth_header, 'base64').toString());
    }
    return token;
}

app.http('getExerciseLogs', {
    methods: ["GET"], 
    authLevel: "anonymous",
    route: "exercise/logs", 
    handler: async (request, context) => {
        const token = await authenticate(request);
        if (!token) {
            return { status: 401, jsonBody: { error: "unauthorized access" } };
        }

        const userId = token.userId;
        let filters = { userId: userId };
        const dateStr = request.query.get("date");
        if (dateStr) {
            let startDate = new Date(dateStr);
            let endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 1);
            filters.date = { $gte: startDate, $lt: endDate };
        }
        

        const client = await MongoClient.connect(process.env.AZURE_MONGO_DB);
        try {
            const db = client.db("tracker");
            const collection = db.collection("exercise_logs");
            const exerciseLogs = await collection.find(filters).toArray();

            return {
                status: 200,
                jsonBody: { exerciseLogs }
            };
        } catch (error) {
            console.error("error retrieving logs:", error);
            return { status: 500, jsonBody: { error: "failed to retrieve logs" } };
        } finally {
            client.close(); 
        }
    }
});


app.http('getExerciseLog', {
    methods: ["GET"], 
    authLevel: "anonymous",
    route: "exercise/log/{timestamp}", 
    handler: async (request, context) => {
        const token = await authenticate(request);
        if (!token) {
            return { status: 401 };
        }
        const userId = token.userId;
        const timestamp = new Date(request.params.timestamp);
        const logs = await FindFromMongo("exercise_logs", { userId, timestamp });
        return {
            status: 200, 
            jsonBody: { log: logs }
        }
    }
});


app.http('addExerciseLog', {
    methods: ["POST"],
    authLevel: "anonymous",
    route: "exercise",
    handler: async (request, context) => {
        const token = await authenticate(request);
        if (!token) {
            return { status: 401, jsonBody: { error: "Unauthorized access" } };
        }

        const userId = token.userId;
        const exercise = await request.json();
        if ( !exercise.title || !exercise.description || !exercise.calories) {
            return {
                status: 400,
                jsonBody: { message: "Invalid parameter, missing one of the required fields." }
            };
        }

        const newLog = {
            userId,
            title: exercise.title,
            description: exercise.description,
            calories: exercise.calories,
            createdAt: new Date()
        };

        try {
            const resultId = await AddExerciseLog(newLog);
            return {
                status: 200,
                jsonBody: { id: resultId }
            };
        } catch (error) {
            console.error("Failed to insert exercise log:", error);
            return {
                status: 500,
                jsonBody: { error: "Failed to add exercise log" }
            };
        }
    }
});



app.http('updateExerciseLog', {
    methods: ["PUT"],
    authLevel: "anonymous", 
    route: "exercise/{id}",
    handler: async (request, context) => {
        const token = await authenticate(request);
        if (!token) {
            return { status: 401 };
        }
        const userId = token.userId;
        const data = await request.json();
        if (!data || !data.title || !data.description || !data.calories) {
            return { status: 400, jsonBody: { error: "Missing one of the required fields: title, description, or calories." } };
        }
        const logId = request.params.id;

        const exerciseLog = await FindByIDFromMongo("exercise_logs", logId);
        if (!exerciseLog || exerciseLog.userId !== userId) {
            return { status: 404, jsonBody: { error: "No such exercise log found or you do not have permission to update it." } };
        }

        const updates = { title: data.title, description: data.description, calories: data.calories };
        const updateResult = await UpdateMongo("exercise_logs", logId, updates);
        if (updateResult.modifiedCount === 0) {
            return { status: 304, jsonBody: { message: "No changes were made to the exercise log." } }; 
        }

        return {
            status: 200, 
            jsonBody: { message: "Exercise log updated successfully.", id: logId, updates }
        };
    }
});

app.http('deleteExerciseLog', {
    methods: ["DELETE"], 
    authLevel: "anonymous", 
    route: "exercise/{id}",
    handler: async (request, context) => {
        const token = await authenticate(request);
        if (!token) {
            return { status: 401, jsonBody: { message: "Authentication required" } };
        }
        const userId = token.userId;
        const logId = request.params.id;

        const exerciseLog = await FindByIDFromMongo("exercise_logs", logId);
        if (!exerciseLog) {
            return { status: 404, jsonBody: { message: "Exercise log not found." } };
        }
        if (exerciseLog.userId !== userId) {
            return { status: 403, jsonBody: { message: "Unauthorized to delete this exercise log." } };
        }

        const deleteCount = await DeleteFromMongo("exercise_logs", logId);
        if (deleteCount === 1) {
            return {
                status: 200, 
                jsonBody: { message: "Exercise log deleted successfully." }
            };
        } else {
            return {
                status: 500,
                jsonBody: { message: "Failed to delete exercise log." }
            };
        }
    }
});

app.http('setCalorieGoal', {
    methods: ["POST"], 
    authLevel: "anonymous",
    route: "calorie/goal",
    handler: async (request, context) => {
        const token = await authenticate(request);
        if (!token) {
            return { status: 401 };
        }
        const data = await request.json();
        if (!data || !data.goal || !data.timestamp || !data.localeDate) {
            return { status: 400 };
        }
        await SetDailyCalorieGoal(token.userId, data);
        return {
            status: 200, 
            jsonBody: {}
        }
    }
});

app.http('getCalorieGoal', {
    methods: ["GET"], 
    authLevel: "anonymous",
    route: "calorie/goal",
    handler: async (request, context) => {
        const token = await authenticate(request);
        if (!token) {
            return { status: 401 };
        }
        const goal = await GetDailyCalorieGoal(token.userId);
        return {
            status: 200, 
            jsonBody: { goal }
        }
    }
});

app.http('addCalorieLog', {
    methods: ["POST"], 
    authLevel: "anonymous",
    route: "calorie/log",
    handler: async (request, context) => {
        const token = await authenticate(request);
        if (!token) {
            return { status: 401 }
        }
        const data = await request.json();
        if (!data || !data.exerciseId || !data.timestamp || !data.localeDate) {
            return {status: 400, jsonBody: {message: "invalid parameter"}}
        }
        const res = await AddCalorieLog(token.userId, data);
        if (res === -1) {
            return { status: 400, jsonBody: {message: "no permission"}}
        }
        return {
            status: 200, 
            jsonBody: {id: res}
        }
    }
});

app.http('deleteCalorieLog', {
    methods: ["DELETE"], 
    authLevel: "anonymous",
    route: "calorie/log",
    handler: async (request, context) => {
        const token = await authenticate(request);
        if (!token) {
            return { status: 401 }
        }
        const data = await request.json();
        if (!data || !data.logId) {
            return {status: 400 }
        }
        const res = await DeleteCalorieLog(token.userId, data.logId);
        if (res !==  0) {
            return {
                status: 400,
                jsonBody: {message: "invalid parameter"}
            }
        }
        return {
            status: 200, 
            jsonBody: {}
        }
    }
});

app.http('getCalorieLogs', {
    methods: ["GET"], 
    authLevel: "anonymous",
    route: "calorie/logs",
    handler: async (request, context) => {
        const token = await authenticate(request);
        if (!token) {
            return { status: 401 }
        }
        let queryDay = request.query.get("dateStr");
        if (!queryDay) {
            return { status: 400, jsonBody: {message: "missing required field dateStr"} }
        }
        const logs = await GetCalorieLogs(token.userId, queryDay);
        return {
            status: 200, 
            jsonBody: {calorieLogs: logs}
        }
    }
});

app.http('getWeeklyCalorieStats', {
    methods: ["GET"], 
    authLevel: "anonymous",
    route: "calorie/stats",
    handler: async (request, context) => {
        const token = await authenticate(request);
        if (!token) {
            return { status: 401 }
        }
        let endDateStr = request.query.get("endDate");
        let endTime = request.query.get("endTime");
        if (!endDateStr || !endTime) {
            return {status: 400, jsonBody: {message: "missing required field endDate/endTime"}}
        }
        endTime = parseInt(endTime);
        const stats = await GetWeeklyCalorieStats(token.userId, endDateStr, endTime);
        return {
            status: 200, 
            jsonBody: {stats: stats}
        }
    }
});


app.http('getWaterLogs', {
    methods: ["GET"], 
    authLevel: "anonymous",
    route: "waterlog", 
    handler: async (request, context) => {
        // take care of auth
        const token = await authenticate(request);
        if (!token) {
            return {
                status: 401
            }
        }
        const userId = token.userId; 
        const dateStr = request.query.get("date");
        if (!dateStr) {
            return {status: 400}
        }
        let filters = {userId: userId, localeDate: dateStr};
        const client = await MongoClient.connect(process.env.AZURE_MONGO_DB);
        const waterlog = await client.db("tracker").collection("water").find(filters).toArray();
        client.close();
        const res = await FormatWaterLogs(userId, waterlog);

        return {
            status: 200, 
            jsonBody: {waterlog: res}
        }
    }
})


app.http('getWeightLogs', {
    methods: ["GET"], 
    authLevel: "anonymous",
    route: "weight", 
    handler: async (request, context) => {
        // take care of auth
        const token = await authenticate(request);
        if (!token) {
            return {
                status: 401
            }
        }
        const userId = token.userId; 
        const client = await MongoClient.connect(process.env.AZURE_MONGO_DB);
        const weightlog = await client.db("tracker").collection("weightlog").find({userId: userId}).toArray();
        client.close();

        return {
            status: 200, 
            jsonBody: {weightlog: weightlog}
        }
    }
})


app.http('getWeightLog', {
    methods: ["GET"], 
    authLevel: "anonymous",
    route: "weight/{id}",
    handler: async (request, context) => {
        const token = await authenticate(request);
        if (!token) {
            return {
                status: 401
            }
        }
        const userId = token.userId;
        const id = request.params.id;

        if (ObjectID.isValid(id)) {
            const client = await MongoClient.connect(process.env.AZURE_MONGO_DB);
            const weightlog = await client.db("tracker").collection("weightlog").findOne({userId: userId, _id: ObjectID(id)});
            client.close();

            if (waterlog.matchedCount === 0) {
                return {
                    status: 404, 
                    jsonBody: {
                        message: "weight log not found"
                    }
                }
            } else {
                return {
                    status: 200,
                    jsonBody: {status: "updated", weightlog: weightlog}
                }
            }
        } else {
            return {
                status: 400, 
                jsonBody: {
                    message: "invalid id for water log"
                }
            }
        }
    }
})


app.http('postWeightGoal', {
    methods: ["POST"], 
    authLevel: "anonymous",
    route: "weight/goal",
    handler: async (request, context) => {
        const token = await authenticate(request);
        if (!token) {
            return {
                status: 401
            }
        }
        const userId = token.userId;
        const goal = await request.json();

		if (!goal || !goal.value || !goal.unit || !goal.deadline) {
            return {
                status: 400,
                jsonBody: {message: "invalid parameter"}
            }
        }

        const client = await MongoClient.connect(process.env.AZURE_MONGO_DB);
        const existingGoal = await client.db("tracker").collection("weight_goal").findOne({userId: userId});
        if (existingGoal) {
            const result = await client.db("tracker").collection("weight_goal").updateOne({userId: userId}, {$set: {value: goal.value, unit: goal.unit, deadline: goal.deadline}});
        } else {
			const payload = {
				userId: userId, 
				value: goal.value,
				unit: goal.unit,
				deadline: goal.deadline,
			};
            const result = await client.db("tracker").collection("weight_goal").insertOne(payload);
        }
        
        client.close();

        return {
            status: 200, 
            jsonBody: {goal: goal}
        }
    }
})

app.http('postWaterGoal', {
    methods: ["POST"], 
    authLevel: "anonymous",
    route: "water/goal",
    handler: async (request, context) => {
        const token = await authenticate(request);
        if (!token) {
            return {
                status: 401
            }
        }
        const userId = token.userId;
        const goal = await request.json();
        if (!goal || !goal.value || !goal.unit) {
            return {
                status: 400,
                jsonBody: {message: "invalid parameter"}
            }
        }

        const client = await MongoClient.connect(process.env.AZURE_MONGO_DB);
        const existingGoal = await client.db("tracker").collection("water_goal").findOne({userId: userId});
        if (existingGoal) {
            const result = await client.db("tracker").collection("water_goal").updateOne({userId: userId}, {$set: {value: goal.value, unit: goal.unit}});
        } else {
            const payload = {
                userId: userId, 
                value: goal.value,
                unit: goal.unit,
            };
            const result = await client.db("tracker").collection("water_goal").insertOne(payload);
        }
        
        client.close();

        return {
            status: 200, 
            jsonBody: {goal: goal}
        }
    }
})

app.http('getWeightGoal', {
    methods: ["GET"], 
    authLevel: "anonymous",
    route: "weight/goal",
    handler: async (request, context) => {
        const token = await authenticate(request);
        if (!token) {
            return {
                status: 401
            }
        }
        const userId = token.userId;
        const client = await MongoClient.connect(process.env.AZURE_MONGO_DB);
        const goal = await client.db("tracker").collection("weight_goal").findOne({userId: userId});
        client.close();

        return {
            status: 200, 
            jsonBody: {goal: goal}
        }
    }
})

app.http('getWaterGoal', {
    methods: ["GET"], 
    authLevel: "anonymous",
    route: "water/goal",
    handler: async (request, context) => {
        const token = await authenticate(request);
        if (!token) {
            return {
                status: 401
            }
        }
        const userId = token.userId;
        const client = await MongoClient.connect(process.env.AZURE_MONGO_DB);
        const goal = await client.db("tracker").collection("water_goal").findOne({userId: userId});
        client.close();

        return {
            status: 200, 
            jsonBody: {goal: goal}
        }
    }
})


app.http('postWeightLog', {
    methods: ["POST"], 
    authLevel: "anonymous",
    route: "weight",
    handler: async (request, context) => {
		const token = await authenticate(request);
        if (!token) {
            return {
                status: 401
            }
        }

    const userId = token.userId;
		const data = await request.json();

		if (!data || !data.value || !data.unit || !data.picture || !data.timestamp || !data.localeDate) {
            return {
                status: 400,
            }
        }

        const playload = {
            userId: userId,
            value: data.value,
            unit: data.unit,
            timestamp: data.timestamp,
            localeDate: data.localeDate,
			picture: data.picture
        }
        const client = await MongoClient.connect(process.env.AZURE_MONGO_DB);
        const result = await client.db("tracker").collection("weightlog").insertOne(playload);
        client.close();

        return {
            status: 200,
            jsonBody: {id: result.insertedId}
        }
    }
})


app.http('postWaterLog', {
    methods: ["POST"], 
    authLevel: "anonymous",
    route: "water",
    handler: async (request, context) => {
        const token = await authenticate(request);
        if (!token) {
            return {
                status: 401
            }
        }
        const userId = token.userId;
        const data = await request.json();
        if (!data || !data.value || !data.unit || !data.timestamp || !data.localeDate) {
            return {
                status: 400,
            }
        }

        const payload = {
            userId: userId,
            value: data.value,
            unit: data.unit,
            timestamp: data.timestamp,
            localeDate: data.localeDate,
            // createDate: new Date()
        }
        const client = await MongoClient.connect(process.env.AZURE_MONGO_DB);
        const result = await client.db("tracker").collection("water").insertOne(payload);
        client.close();

        return {
            status: 200, 
            jsonBody: {id: result.insertedId}
        }
    }
})

app.http('putWaterLog', {
    methods: ["PUT"], 
    authLevel: "anonymous",
    route: "water",
    handler: async (request, context) => {
        const token = await authenticate(request);
        if (!token) {
            return {
                status: 401
            }
        }
        const userId = token.userId;
        const data = await request.json();
        if (!data || !data.id || !data.value || !data.unit) {
            return {
                status: 400,
            }
        }
        const id = data.id;

        const waterLog = await FindByIDFromMongo("water", id);
        if (!waterLog || waterLog.userId !== userId) {
            return {
                status: 400,
            }
        }
        await UpdateMongo("water", id, {"value": data.value, "unit": data.unit});
        return {
            status: 200, 
            jsonBody: {id: id, value: data.value, unit: data.unit}
        }
    }
})

app.http('deleteWaterLog', {
    methods: ["DELETE"], 
    authLevel: "anonymous",
    route: "water",
    handler: async (request, context) => {
        const token = await authenticate(request);
        if (!token) {
            return {
                status: 401
            }
        }
        const userId = token.userId;
        const data = await request.json();
        if (!data || !data.id) {
            return {
                status: 400
            }
        }
        const id = data.id;
        const waterLog = await FindByIDFromMongo("water", id);
        if (!waterLog || waterLog.userId !== userId) {
            return {
                status: 400,
            }
        }
        await DeleteFromMongo("water", id);
        return {
            status: 200, 
            jsonBody: {}
        }
    }
})

app.http('deleteWeightLog', {
    methods: ["DELETE"], 
    authLevel: "anonymous",
    route: "weight",
    handler: async (request, context) => {
        const token = await authenticate(request);
        if (!token) {
            return {
                status: 401
            }
        }
        const userId = token.userId;
        const data = await request.json();

        if (!data || !data._id) {
            return {
                status: 400
            }
        }
        const id = data._id;
        const weightLog = await FindByIDFromMongo("weightlog", id);
        if (!weightLog || weightLog.userId !== userId) {
            return {
                status: 400,
            }
        }
        await DeleteFromMongo("weightlog", id);
        return {
            status: 200, 
            jsonBody: {}
        }
    }
})


app.http('putWeightLog', {
    methods: ["PUT"], 
    authLevel: "anonymous",
    route: "weight",
    handler: async (request, context) => {
		const token = await authenticate(request);
        if (!token) {
            return {
                status: 401
            }
        }
        const userId = token.userId;
        const data = await request.json();
        if (!data || !data._id || !data.value || !data.unit || !data.picture) {
            return {
                status: 400,
            }
        }
        const id = data._id;

        const weightLog = await FindByIDFromMongo("weightlog", id);
        if (!weightLog || weightLog.userId !== userId) {
            return {
                status: 400,
            }
        }
        await UpdateMongo("weightlog", id, {"value": data.value, "unit": data.unit, "picture": data.picture});
        return {
            status: 200, 
            jsonBody: {id: id, value: data.value, unit: data.unit, picture: data.picture}
		}
    }
})


app.http('getWaterLogStats', {
    methods: ["GET"], 
    authLevel: "anonymous",
    route: "water/stats", 
    handler: async (request, context) => {
        // take care of auth
        const token = await authenticate(request);
        if (!token) {
            return {
                status: 401
            }
        }
        const userId = token.userId; 
        var rangeType = request.query.get("rangeType");
        if (!rangeType) {
            rangeType = "days";
        }
        let endDate = request.query.get("endDate");
        let endTime = request.query.get("endTime");
        if (!endDate || !endTime) {
            return {status: 400, jsonBody: {message: "invalid parameter"}};
        }
        endTime = parseInt(endTime);
        const res = await GetWaterLogStatistics(userId, rangeType, endDate, endTime);
        return {
            status: 200, 
            jsonBody:  res
        }
    }
})


app.http('getWeeklyWeightStats', {
    methods: ["GET"], 
    authLevel: "anonymous",
    route: "weight/stats",
    handler: async (request, context) => {
        const token = await authenticate(request);
        if (!token) {
            return { status: 401 }
        }
        let endDateStr = request.query.get("endDate");
        let endTime = request.query.get("endTime");
        if (!endDateStr || !endTime) {
            return {status: 400, jsonBody: {message: "invalid parameter"}}
        }
        endTime = parseInt(endTime);
        const stats = await GetWeeklyWeightStats(token.userId, endDateStr, endTime);
        return {
            status: 200, 
            jsonBody: {stats: stats}
        }
    }
});


app.http('fixData', {
    methods: ["GET"], 
    authLevel: "anonymous",
    route: "secret/fixdata",
    handler: async (request, context) => {
        const token = await authenticate(request);
        if (!token) {
            return { status: 401 }
        }
        
        /*
        // calorie goal createdAt
        const calorieGoals = await FindFromMongo("calorie_goal", {});
        let updated = 0;
        for (var cg of calorieGoals) {
            if (cg.timestamp) {
                continue
            }
            let updates = {
                timestamp: cg.createdAt.getTime(),
                localeDate: cg.createdAt.toLocaleDateString()
            }
            await UpdateMongo("calorie_goal", cg._id, updates);
            updated += 1;
        }
        console.log("===== updated calorie goals: ", updated);


        // calorie log
        updated = 0;
        const calorieLogs = await FindFromMongo("calorie_log", {});
        for (var cg of calorieLogs) {
            if (cg.timestamp) {
                continue
            }
            let updates = {
                timestamp: cg.createdAt.getTime(),
                localeDate: cg.createdAt.toLocaleDateString()
            }
            await UpdateMongo("calorie_log", cg._id, updates);
            updated++;
        }
        console.log("===== updated calorie logs: ", updated);

        // weight log
        updated = 0;
        const weightLogs = await FindFromMongo("weightlog", {});
        for (var cg of weightLogs) {
            if (cg.localeDate) {
                continue;
            }
            let updates = {
                localeDate: new Date(cg.timestamp).toLocaleDateString()
            }
            await UpdateMongo("weightlog", cg._id, updates);
            updated++;
        }
        console.log("===== updated weight logs: ", updated);

        // water log
        updated = 0;
        const waterLogs = await FindFromMongo("water", {});
        for (var cg of waterLogs) {
            if (cg.timestamp) {
                continue
            }
            if (!cg.createDate) {
                await DeleteFromMongo("water", cg._id);
                updated++;
                continue;
            }
            let updates = {
                timestamp: cg.createDate.getTime(),
                localeDate: cg.createDate.toLocaleDateString()
            }
            await UpdateMongo("water", cg._id, updates);
            updated++;
        }
        console.log("===== updated water logs: ", updated);
        */

        const newCalorieGoals = await FindFromMongo("calorie_goal", {});
        const newCalorieLogs = await FindFromMongo("calorie_log", {}); 
        const newWeightLogs = await FindFromMongo("weightlog", {});
        const newWaterLogs = await FindFromMongo("water", {});


        return {
            status: 200, 
            jsonBody: {
                calorieGoal: newCalorieGoals, 
                calorieLog: newCalorieLogs,
                weightLog: newWeightLogs,
                waterLog: newWaterLogs
            }
        }
    }
});