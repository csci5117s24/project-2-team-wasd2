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
    route: "/waterlog", 
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

app.http('getWaterLog', {
    methods: ["GET"], 
    authLevel: "anonymous",
    route: "/water/{id}",
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

app.http('postWaterGoal', {
    methods: ["POST"], 
    authLevel: "anonymous",
    route: "/water/goal",
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
    route: "/water/goal",
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

app.http('postWaterLog', {
    methods: ["POST"], 
    authLevel: "anonymous",
    route: "/water",
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
    route: "/water/{id}",
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




