import { client } from "../../../scripts/database.js";
import { ObjectId } from "mongodb";

export const handler = async (event) => {
  try {
    const { movieId, text, date } = JSON.parse(event.body);

    if (!client.topology || !client.topology.isConnected()) {
      await client.connect();
    }

    const database = client.db(process.env.DBNAME);
    const collection = database.collection(process.env.MONGODB_COLLECTION);

    await collection.updateOne(
      { _id: new ObjectId(movieId) },
      {
        $push: {
          comments: {
            _id: new ObjectId(),
            text,
            date: new Date(date)
          }
        }
      }
    );

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type"
      },
      body: JSON.stringify({ message: "Comentário adicionado com sucesso" })
    };
  } catch (error) {
    console.error("Erro detalhado:", error);
    return {
      statusCode: 500,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type"
      },
      body: JSON.stringify({ 
        error: error.message,
        stack: error.stack,
        details: "Erro ao adicionar comentário"
      })
    };
  }
};
