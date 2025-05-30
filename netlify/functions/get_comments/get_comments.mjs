import { client } from "../../../scripts/database.js";
import { ObjectId } from "mongodb";

export const handler = async (event) => {
  try {
    const { movieId } = event.queryStringParameters;

    if (!client.topology || !client.topology.isConnected()) {
      await client.connect();
    }

    const database = client.db(process.env.DBNAME);
    const collection = database.collection(process.env.MONGODB_COLLECTION);

    const movie = await collection.findOne(
      { _id: new ObjectId(movieId) },
      { projection: { comments: 1 } }
    );

    const comments = movie?.comments || [];

    comments.sort((a, b) => new Date(b.date) - new Date(a.date));

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type"
      },
      body: JSON.stringify(comments)
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type"
      },
      body: JSON.stringify({ error: error.message })
    };
  }
};