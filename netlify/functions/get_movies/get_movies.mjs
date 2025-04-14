import { MongoClient } from "mongodb";

const mongoClient = new MongoClient(process.env.MONGODB_URI);

const clientPromise = mongoClient.connect();

const getMovies = async ({ page = 1, limit = 10 }) => {
    try {
        const database = (await clientPromise).db(process.env.DBNAME);
        const collection = database.collection(process.env.MONGODB_COLLECTION);

        const skip = (page - 1) * limit;

        const results = await collection.find({}).skip(skip).limit(limit).toArray();
        return results;
    } catch (error) {
        return { statusCode: 500, body: error.toString() };
    }
};

export { getMovies };