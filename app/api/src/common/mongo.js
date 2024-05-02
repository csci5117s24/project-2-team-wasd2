const { ObjectId } = require('mongodb');
const mongoClient = require("mongodb").MongoClient;

const dbName = "tracker";

module.exports = {
    InsertToMongo: insertToMongo,
    FindFromMongo: findFromMongo,
    FindFromMongoWithSort: findFromMongoWithSort,
    FindByIDFromMongo: findByIDFromMongo,
    UpdateMongo: updateMongo,
    DeleteFromMongo: deleteFromMongo,
}

async function insertToMongo(collection, document) {
    const client = await mongoClient.connect(process.env.AZURE_MONGO_DB);
    const result = await client.db(dbName).collection(collection).insertOne(document);
    return result.insertedId;
}

async function findFromMongo(collection, filters) {
    const client = await mongoClient.connect(process.env.AZURE_MONGO_DB);
    const results = await client.db(dbName).collection(collection).find(filters).toArray();
    return results;
}

async function findFromMongoWithSort(collection, filters, sortCond) {
    console.log("find with sort: ", filters, sortCond);
    const client = await mongoClient.connect(process.env.AZURE_MONGO_DB);
    // fixme: error here
    const cursor = client.db(dbName).collection(collection).find(filters).sort(sortCond);
    var res = [];
    for await (const doc of cursor) {
        res.push(doc);
    }
    return res;
}

async function findByIDFromMongo(collection, id) {
    const client = await mongoClient.connect(process.env.AZURE_MONGO_DB);
    const result = await client.db(dbName).collection(collection).findOne({_id: new ObjectId(id)});
    return result;
}

async function updateMongo(collection, id, updates ) {
    const client = await mongoClient.connect(process.env.AZURE_MONGO_DB);
    const result = await client.db(dbName).collection(collection).updateOne({_id: new ObjectId(id)}, {$set: updates});
    return result.modifiedCount;
}

async function deleteFromMongo(collection, id) {
    const client = await mongoClient.connect(process.env.AZURE_MONGO_DB);
    const result = await client.db(dbName).collection(collection).deleteOne({_id: new ObjectId(id)});
    return result.modifiedCount;
}