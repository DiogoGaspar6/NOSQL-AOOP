const { client } = require('../../../scripts/database');
const MovieChatbot = require('../../../scripts/chatbot');

export const handler = async function(event, context) {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Método não permitido, usa POST' }),
    };
  }

  try {
    const { query, userType } = JSON.parse(event.body);

    if (!query || !userType) {
      return {
        statusCode: 400,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ error: 'query e userType são obrigatórios' }),
      };
    }

    const chatbot = new MovieChatbot();

    const resposta = await chatbot.processQuery(query, userType);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ resposta }),
    };

  } catch (error) {
    console.error('Erro na função:', error);
    return {
      statusCode: 500,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ error: 'Erro interno no servidor' }),
    };
  }
};
