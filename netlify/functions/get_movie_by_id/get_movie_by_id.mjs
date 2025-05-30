import { ObjectId } from "mongodb";
import { client } from "../../../scripts/database.js";

export const handler = async (event) => {
  try {
    const { id } = event.queryStringParameters;

    if (!client.topology || !client.topology.isConnected()) {
      await client.connect();
    }

    if (!id) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type",
        },
        body: JSON.stringify({ error: "ID do filme não fornecido" }),
      };
    }

    const database = client.db(process.env.DBNAME);
    const collection = database.collection(process.env.MONGODB_COLLECTION);

    const movie = await collection.findOne({ _id: new ObjectId(id) });

    if (!movie) {
      return {
        statusCode: 404,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type",
        },
        body: JSON.stringify({ error: "Filme não encontrado" }),
      };
    }

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify(movie),
    };
  } catch (error) {
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({ error: error.message }),
    };
  }
};