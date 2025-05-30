import { client } from "../../../scripts/database.js";

const getMovies = async ({ page = 1, limit = 10 }) => {
    try {
        if (!process.env.MONGODB_URI || !process.env.DBNAME || !process.env.MONGODB_COLLECTION) {
            throw new Error("Variáveis de ambiente necessárias não estão configuradas");
        }

        if (!client.topology || !client.topology.isConnected()) {
            await client.connect();
        }

        const database = client.db(process.env.DBNAME);
        const collection = database.collection(process.env.MONGODB_COLLECTION);

        const skip = (page - 1) * limit;

        const results = await collection.find({}).skip(skip).limit(limit).toArray();
        
        if (!results || results.length === 0) {
            return {
                statusCode: 404,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Headers": "Content-Type",
                },
                body: JSON.stringify({ message: "Nenhum filme encontrado" }),
            };
        }

        return {
            statusCode: 200,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
            },
            body: JSON.stringify(results),
        };
    } catch (error) {
        console.error("Erro na função get_movies:", error);
        return {
            statusCode: 500,
            headers: {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Headers": "Content-Type",
            },
            body: JSON.stringify({ 
                error: "Erro ao conectar com o banco de dados",
                details: error.message 
            }),
        };
    }
};

// Exporta como handler para o Netlify reconhecer
export const handler = async (event) => {
    const { page = 1, limit = 10 } = event.queryStringParameters || {};
    return await getMovies({ page: parseInt(page), limit: parseInt(limit) });
};