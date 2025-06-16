const express = require('express');
const { connect } = require('./scripts/database');
const MovieChatbot = require('./scripts/chatbot');
require('dotenv').config();

const server = express();
const PORT = process.env.PORT || 3000;
const chatbot = new MovieChatbot();

server.use(express.json());
server.use(express.static(__dirname + '/'));

// ABRIR O INDEX.HTML
server.get('/', (req, res) => {
  res.sendFile(__dirname + '/pages/index.html');
});

// Rota para a página do chatbot
server.get('/chat', (req, res) => {
  res.sendFile(__dirname + '/pages/chat.html');
});

// Endpoint do chatbot
server.post('/api/chat', async (req, res) => {
  try {
    const { message, userType = 'casual' } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Mensagem é obrigatória' });
    }

    const response = await chatbot.processQuery(message, userType);
    res.json({ response });
  } catch (error) {
    console.error('Erro no endpoint do chatbot:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});

const startServer = async () => {
  try {
    await connect();
    server.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to connect to database:', error);
    process.exit(1);
  }
};

startServer();