import { client } from "../../../scripts/database.js";

export const handler = async (event) => {
  try {
    const { query } = event.queryStringParameters;

    if (!client.topology || !client.topology.isConnected()) {
      await client.connect();
    }

    if (!query) {
      return {
        statusCode: 400,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Headers": "Content-Type",
        },
        body: JSON.stringify({ error: "Search query is required" }),
      };
    }

    const database = client.db(process.env.DBNAME);
    const collection = database.collection(process.env.MONGODB_COLLECTION);

    const movies = await collection
      .find({
        title: { $regex: query, $options: "i" },
      })
      .limit(10)
      .toArray();

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify(movies),
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
