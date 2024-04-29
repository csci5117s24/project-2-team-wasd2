const { app } = require('@azure/functions');
const { MongoClient, ObjectID} = require('mongodb');

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

// water apis
// Water (maybe add a field for date)
// GET /waterlog (all water logs) 
// GET /water/id (water log for specific day)
// POST /water/goal (set water goal)
// PUT /water/goal (edit water goal)
// POST /water/id (post log for the day)
// intake
// date
// PUT /water/id (edit log for the day)
// change either

async function authenticate(request) {
    const auth_header = request.headers["X-MS-CLIENT-PRINCIPAL"];
    let token = null; 
    if (auth_header) {
        token = JSON.parse(Buffer.from(auth_header, 'base64').toString());
        console.log(token); 
    }
    
    if (!token) {
        return {
            status: 401, 
            jsonBody: {
                message: "Unauthorized"
            }
        }
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
        const userId = token.userId; 
        const client = await MongoClient.connect(process.env.AZURE_MONGO_DB);
        const waterlog = await client.db("tracker").collection("water").find({userId: userId}).toArray();
        client.close();

        console.log(waterlog);

        return {
            status: 200, 
            jsonBody: {waterlog: waterlog}
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

app.http('getWaterLog', {
    methods: ["GET"], 
    authLevel: "anonymous",
    route: "water/{id}",
    handler: async (request, context) => {
        const token = await authenticate(request);
        const userId = token.userId;
        const id = request.params.id;

        if (ObjectID.isValid(id)) {
            const client = await MongoClient.connect(process.env.AZURE_MONGO_DB);
            const waterlog = await client.db("tracker").collection("water").findOne({userId: userId, _id: ObjectID(id)});
            client.close();

            if (waterlog.matchedCount === 0) {
                return {
                    status: 404, 
                    jsonBody: {
                        message: "water log not found"
                    }
                }
            } else {
                return {
                    status: 200,
                    jsonBody: {status: "updated", waterlog: waterlog}
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
        const userId = token.userId;
        const goal = request.body ?? {}; // need to figure out what the frontend body looks like to create payload

        const payload = {userId, goal};
        const client = await MongoClient.connect(process.env.AZURE_MONGO_DB);
        const result = await client.db("tracker").collection("water").insertOne(payload);
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
        const userId = token.userId;
        const goal = request.body ?? {}; // need to figure out what the frontend body looks like to create payload

        const payload = {userId, goal};
        const client = await MongoClient.connect(process.env.AZURE_MONGO_DB);
        const result = await client.db("tracker").collection("water").updateOne({userId: userId}, {$set: {goal: goal}});
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
        const userId = token.userId;
        const intake = request.body.intake ?? 0;
        const unit = request.body.unit ?? "oz";  // we in the americas RAHHH
        const date = new Date();

        const payload = {userId, intake, date, unit};
        const client = await MongoClient.connect(process.env.AZURE_MONGO_DB);
        const result = await client.db("tracker").collection("water").insertOne(payload);
        client.close();

        return {
            status: 200, 
            jsonBody: {intake: intake, unit: unit, date: date}
        }
    }
})

app.http('putWaterLog', {
    methods: ["PUT"], 
    authLevel: "anonymous",
    route: "water/{id}",
    handler: async (request, context) => {
        const token = await authenticate(request);
        const userId = token.userId;
        const id = request.params.id;
        const intake = request.body.intake ?? 0;
        const unit = request.body.unit ?? "oz";  // we in the americas RAHHH
        const date = new Date();

        if (ObjectID.isValid(id)) {
            const client = await MongoClient.connect(process.env.AZURE_MONGO_DB);
            const result = await client.db("tracker").collection("water").updateOne({userId: userId, _id: new ObjectID(id)}, {$set: intake, date, unit});
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
                    jsonBody: {intake: intake, unit: unit, date: date}
                }
            }
        } else {
            return {
                status: 404, 
                jsonBody: {
                    message: "invalid id for water log"
                }
            }
        }
    }
})


app.http('putWorkoutLog', {
    methods: ["PUT"], 
    authLevel: "anonymous",
    route: "workout/{id}",
    handler: async (request, context) => {
        const token = await authenticate(request);
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



