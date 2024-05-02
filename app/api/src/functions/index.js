const { app } = require('@azure/functions');
const { MongoClient, ObjectID} = require('mongodb');
const { FindByIDFromMongo, UpdateMongo, DeleteFromMongo, FindFromMongo } = require('../common/mongo');
const {FormatWaterLogs, GetWaterLogStatistics} = require('../biz/water');

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


app.http('getWorkoutLogs', {
    methods: ["GET"], 
    authLevel: "anonymous",
    route: "workout/logs", 
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
        const workoutlog = await client.db("tracker").collection("workout").find({userId: userId}).toArray();
        client.close();

        console.log(workoutlog);

        return {
            status: 200, 
            jsonBody: {workoutlog: workoutlog}
        }
    }
})

app.http('getWorkoutLog', {
    methods: ["GET"], 
    authLevel: "anonymous",
    route: "workout/log", 
    handler: async (request, context) => {
        // take care of auth
        const token = await authenticate(request);
        const userId = token.userId; 
        const client = await MongoClient.connect(process.env.AZURE_MONGO_DB);
        const timestamp = request.params.timestamp;
        const workoutlog = await client.db("tracker").collection("workout").find({userId: userId,timestamp:timestamp}).toArray();
        client.close();

        console.log(workoutlog);

        return {
            status: 200, 
            jsonBody: {workoutlog: workoutlog}
        }
    }
})
app.http('getWeightLogs', {
    methods: ["GET"], 
    authLevel: "anonymous",
    route: "weightlog", 
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
        const weightlog = await client.db("tracker").collection("weight").find({userId: userId}).toArray();
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
            const weightlog = await client.db("tracker").collection("weight").findOne({userId: userId, _id: ObjectID(id)});
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
        const goal = request.body ?? {}; // need to figure out what the frontend body looks like to create payload

        const payload = {userId, goal};
        const client = await MongoClient.connect(process.env.AZURE_MONGO_DB);
        const result = await client.db("tracker").collection("weight").insertOne(payload);
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

        const payload = {userId, goal};
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
        const weight = request.body.weight ?? 0;
        const unit = request.body.unit ?? "kg"; 
        const picutre = request.body.picture;
        const date = request.body.timestamp;

        const payload = {userId, weight, date, unit,picture};
        const client = await MongoClient.connect(process.env.AZURE_MONGO_DB);
        const result = await client.db("tracker").collection("weight").insertOne(payload);
        client.close();

        return {
            status: 200, 
            jsonBody: {weight: weight, unit: unit, date: date,picture: picture}
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
        const payload = {userId,timestamp, title, description, calories,goal};
        const client = await MongoClient.connect(process.env.AZURE_MONGO_DB);
        const result = await client.db("tracker").collection("weight").insertOne(payload);
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


app.http('putWorkoutLog', {
    methods: ["PUT"], 
    authLevel: "anonymous",
    route: "workout/{id}",
    handler: async (request, context) => {
        const token = await authenticate(request);
        if (!token) {
            return {
                status: 401
            }
        }
        const userId = token.userId;
        const id = request.params.id;
        const title = request.body.title;
        const description = request.body.description;
        const calories = request.body.calories;
        if (ObjectID.isValid(id)) {
            const client = await MongoClient.connect(process.env.AZURE_MONGO_DB);
            const result = await client.db("tracker").collection("weight").updateOne({userId: userId, _id: new ObjectID(id)}, {$set: title, description, calories});
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
                    jsonBody: {title: title, description: description, calories: calories}
                }
            }
        } else {
            return {
                status: 404, 
                jsonBody: {
                    message: "invalid id for weight log"
                }
            }
        }
    }
})

app.http('putWeightLog', {
    methods: ["PUT"], 
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
        const weight = request.body.weight ?? 0;
        const unit = request.body.unit ?? "kg";  
        const date = request.body.timestamp;
        const picture = request.body.picture;

        if (ObjectID.isValid(id)) {
            const client = await MongoClient.connect(process.env.AZURE_MONGO_DB);
            const result = await client.db("tracker").collection("weight").updateOne({userId: userId, _id: new ObjectID(id)}, {$set: weight, date, unit,picture});
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
        const res = await GetWaterLogStatistics(userId, rangeType);
        return {
            status: 200, 
            jsonBody:  res
        }
    }
})
