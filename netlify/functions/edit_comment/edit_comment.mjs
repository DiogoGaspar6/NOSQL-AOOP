import { client } from "../../../scripts/database.js";
import { ObjectId } from "mongodb";

export const handler = async (event) => {
  try {
    const { movieId, commentId, text } = JSON.parse(event.body);

    if (!client.topology || !client.topology.isConnected()) {
      await client.connect();
    }

    const database = client.db(process.env.DBNAME);
    const collection = database.collection(process.env.MONGODB_COLLECTION);

    await collection.updateOne(
      { 
        _id: new ObjectId(movieId),
        "comments._id": new ObjectId(commentId)
      },
      {
        $set: {
          "comments.$.text": text,
          "comments.$.edited": true,
          "comments.$.editDate": new Date()
        }
      }
    );

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type"
      },
      body: JSON.stringify({ message: "Comentário atualizado com sucesso" })
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
