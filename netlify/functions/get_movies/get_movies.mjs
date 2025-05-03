import { MongoClient } from "mongodb";

const mongoClient = new MongoClient(process.env.MONGODB_URI);

const clientPromise = mongoClient.connect();

const getMovies = async ({ page = 1, limit = 10 }) => {
    try {
        const database = (await clientPromise).db(process.env.DBNAME);
        const collection = database.collection(process.env.MONGODB_COLLECTION);

        const skip = (page - 1) * limit;

        const results = await collection.find({}).skip(skip).limit(limit).toArray();
        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
            },
            body: JSON.stringify(results),
        };
    } catch (error) {
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
            },
            body: JSON.stringify({ error: error.toString() }),
        };
    }
};

// Exporta como handler para o Netlify reconhecer
export const handler = async (event) => {
    const { page = 1, limit = 10 } = event.queryStringParameters || {};
    return await getMovies({ page: parseInt(page), limit: parseInt(limit) });
};