const { app } = require('@azure/functions');
const { MongoClient, ObjectID} = require('mongodb');
const { FindByIDFromMongo, UpdateMongo, DeleteFromMongo, FindFromMongo } = require('../common/mongo');
const {FormatWaterLogs, GetWaterLogStatistics} = require('../biz/water');
const { GetExerciseLogs, AddExerciseLog, UpdateExerciseLog, DeleteExerciseLog, GetCalorieStatistics, SetWeeklyExerciseGoals, GetWeeklyExerciseGoals,UpdateWeeklyExerciseGoals} = require('../biz/exercise');


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
        console.log(token); 
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
            return { status: 401, jsonBody: { error: "Unauthorized access" } };
        }

        const userId = token.userId;
        let filters = { userId: userId };
        const dateStr = request.query.get("date");
        if (dateStr) {
            console.log("Received date string:", dateStr);
            let startDate = new Date(dateStr);
            console.log("Parsed start date:", startDate);
            let endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 1);
            console.log("Calculated end date:", endDate);
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
            console.error("Error retrieving exercise logs:", error);
            return { status: 500, jsonBody: { error: "Failed to retrieve exercise logs" } };
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
            console.log("Authentication failed");
            return { status: 401, jsonBody: { error: "Unauthorized access" } };
        }

        const userId = token.userId;
        const exercise = await request.json();

        console.log("Received exercise data:", exercise);
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
            timestamp: new Date(exercise.timestamp)
        };

        try {
            const resultId = await AddExerciseLog(newLog);
            console.log("Insert successful, ID:", resultId);
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
        const { title, description, calories } = request.body;
        const logId = request.params.id;
        const updates = { title, description, calories };
        const updated = await UpdateExerciseLog(logId, updates);
        return {
            status: 200, 
            jsonBody: { updated }
        }
    }
});

app.http('deleteExerciseLog', {
    methods: ["DELETE"], 
    authLevel: "anonymous",
    route: "exercise/{id}",
    handler: async (request, context) => {
        const token = await authenticate(request);
        if (!token) {
            return { status: 401 };
        }
        const logId = request.params.id;
        const deleted = await DeleteExerciseLog(logId);
        return {
            status: 200, 
            jsonBody: { deleted }
        }
    }
});

app.http('updateCalorieGoal', {
    methods: ["POST"],
    authLevel: "anonymous",
    route: "calorieGoal/update",
    handler: async (request, context) => {
        const token = await authenticate(request);
        if (!token) {
            console.log("Authentication failed");
            return { status: 401, jsonBody: { error: "Unauthorized access" } };
        }

        const userId = token.userId;
        const { workoutId, caloriesBurned } = await request.json();

        if (!workoutId || typeof caloriesBurned !== 'number' || caloriesBurned <= 0) {
            return {
                status: 400,
                jsonBody: { message: "Invalid parameter, missing or incorrect fields." }
            };
        }

        try {
            const today = new Date();
            const weekStartDate = new Date(today.setDate(today.getDate() - today.getDay())).toISOString();
            let [goals] = await FindFromMongo("weekly_goals", { userId, weekStartDate });

            if (!goals) {
                goals = {
                    userId,
                    weekStartDate,
                    goals: { calorieGoal: 1000, workoutsLogged: [] }, 
                    createdAt: new Date()
                };
                await InsertToMongo("weekly_goals", goals);
            }

            const updates = {
                "$set": {
                    "goals.calorieGoal": goals.goals.calorieGoal - caloriesBurned
                },
                "$push": {
                    "goals.workoutsLogged": {
                        workoutId,
                        caloriesBurned,
                        timestamp: new Date()
                    }
                }
            };

            await UpdateMongo("weekly_goals", goals._id, updates);

            return {
                status: 200,
                jsonBody: { message: "Calorie goal updated successfully" }
            };
        } catch (error) {
            console.error("Failed to update calorie goal:", error);
            return {
                status: 500,
                jsonBody: { error: "Failed to update calorie goal" }
            };
        }
    }
});
app.http('getCalorieGoal', {
    methods: ["GET"],
    authLevel: "anonymous",
    route: "calorieGoal",
    handler: async (request, context) => {
        const token = await authenticate(request);
        if (!token) {
            return {
                status: 401,
                jsonBody: { error: "Unauthorized access" }
            };
        }

        const userId = token.userId;
        const weekStartDate = request.query.weekStartDate;

        try {
            const goals = await FindFromMongo("weekly_goals", { userId, weekStartDate });
            return {
                status: 200,
                jsonBody: goals.length > 0 ? goals[0] : "No goals found for the specified week."
            };
        } catch (error) {
            return {
                status: 500,
                jsonBody: { error: "Failed to fetch calorie goals due to an internal error" }
            };
        }
    }
});

app.http('setCalorieGoal', {
    methods: ["POST"],
    authLevel: "anonymous",
    route: "calorieGoal/set",
    handler: async (request, context) => {
        const token = await authenticate(request);
        if (!token) {
            return {
                status: 401,
                jsonBody: { error: "Unauthorized access" }
            };
        }

        const userId = token.userId;
        const { weekStartDate, calorieGoal } = await request.json();

        if (!weekStartDate || calorieGoal === undefined) {
            return {
                status: 400,
                jsonBody: { message: "Invalid parameter, missing one of the required fields." }
            };
        }

        try {
            const newGoal = {
                userId,
                weekStartDate,
                goals: { calorieGoal, workoutsLogged: [] },
                createdAt: new Date()
            };
            await InsertToMongo("weekly_goals", newGoal);

            return {
                status: 200,
                jsonBody: "New calorie goal set successfully"
            };
        } catch (error) {
            return {
                status: 500,
                jsonBody: { error: "Failed to set new calorie goal due to an internal error" }
            };
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
        let filters = {userId: userId}
        const dateStr = request.query.get("date");
        if (dateStr) {
            let startDate = new Date(dateStr);
            let endDate = new Date(dateStr);
            endDate.setDate(endDate.getDate() + 1);
            filters.createDate = {$gte:startDate, $lt: endDate};
        }
        console.log(filters);
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

        console.log(weightlog);

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
		console.log(goal)

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
        // const goal = request.body ?? {}; // need to figure out what the frontend body looks like to create payload
        console.log(goal);
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

app.http('putWaterGoal', {
    methods: ["PUT"], 
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
        const goal = request.body ?? {}; // need to figure out what the frontend body looks like to create payload

        const payload = {userId: userId, goal: goal};
        const client = await MongoClient.connect(process.env.AZURE_MONGO_DB);
        const result = await client.db("tracker").collection("water_goal").updateOne({userId: userId}, {$set: {goal: goal}});
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

		if (!data || !data.value || !data.unit || !data.picture || !data.timestamp) {
            return {
                status: 400,
            }
        }

        const playload = {
            userId: userId,
            value: data.value,
            unit: data.unit,
            timestamp: data.timestamp,
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

app.http('postWorkoutLog', {
    methods: ["POST"], 
    authLevel: "anonymous",
    route: "workout",
    handler: async (request, context) => {
        const token = await authenticate(request);
        if (!token) {
            return {
                status: 401
            }
        }
        const userId = token.userId;
        const title = request.body.title ?? 0;
        const description = request.body.description ?? "none"; 
        const calories = request.body.calories;
        const timestamp = request.body.timestamp ?? 0;
        const goal = request.body.goal ?? 0;
        const payload = {userId: userId,timestamp:timestamp, title:title, description: description,calories: calories,goal:goal};
        const client = await MongoClient.connect(process.env.AZURE_MONGO_DB);
        const result = await client.db("tracker").collection("weightlog").insertOne(payload);
        client.close();

        return {
            status: 200, 
            jsonBody: {title: title, description: description, calories: calories}
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
        if (!data || !data.value || !data.unit) {
            return {
                status: 400,
            }
        }

        const playload = {
            userId: userId,
            value: data.value,
            unit: data.unit,
            createDate: new Date()
        }
        const client = await MongoClient.connect(process.env.AZURE_MONGO_DB);
        const result = await client.db("tracker").collection("water").insertOne(playload);
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
            console.log("invalid parameter");
            return {
                status: 400,
            }
        }
        const id = data.id;

        const waterLog = await FindByIDFromMongo("water", id);
        console.log("find waterlog: ", waterLog);
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
		console.log("::: put weight :::")
		console.log(data)
        if (!data || !data._id || !data.value || !data.unit || !data.picture) {
            console.log("invalid parameter");
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
        
		/*
        const token = await authenticate(request);
        if (!token) {
            return {
                status: 401
            }
        }
        const userId = token.userId;
        const id = request.params.id;
        const value = request.body.value ?? 0;
        const unit = request.body.unit ?? "kg";  
        const timestamp = request.body.timestamp ?? Date.now();
        const picture = request.body.picture;

        if (ObjectID.isValid(id)) {
            const client = await MongoClient.connect(process.env.AZURE_MONGO_DB);
            const result = await client.db("tracker").collection("weightlog").updateOne({userId: userId, _id: new ObjectID(id)}, {$set: unit, value, timestamp, picture});
            client.close();

            if (result.matchedCount === 0) {
                return {
                    status: 404, 
                    jsonBody: {
                        message: "water log not found"
                    }
                }
            } else {
                return {
                    status: 200, 
                    jsonBody: {weight: weight, unit: unit, date: date,picture: picture}
                }
            }
        } else {
            return {
                status: 404, 
                jsonBody: {
                    message: "invalid id for weight log"
                }
            }
        }*/
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
        const res = await GetWaterLogStatistics(userId, rangeType);
        return {
            status: 200, 
            jsonBody:  res
        }
    }
})


app.http('updateCalorieGoal', {
    methods: ["PUT"],
    authLevel: "anonymous",
    route: "calorieGoal/update",
    handler: async (request, context) => {
        const token = await authenticate(request);
        if (!token) {
            console.log("Authentication failed");
            return { status: 401, jsonBody: { error: "Unauthorized access" } };
        }

        const userId = token.userId;
        const { workoutId, caloriesBurned } = await request.json();

        if (!workoutId || typeof caloriesBurned !== 'number' || caloriesBurned <= 0) {
            return {
                status: 400,
                jsonBody: { message: "Invalid parameter, missing or incorrect fields." }
            };
        }

        const client = await MongoClient.connect(process.env.AZURE_MONGO_DB);
        const result = await client.db("tracker").collection("calorie_goal").updateOne({userId: userId}, {$inc: {calorieGoal: -caloriesBurned}});
        client.close();

        return {
            status: 200,
            jsonBody: { message: "Calorie goal updated successfully" }
        };
        
    }
    
})