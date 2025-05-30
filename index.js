const express = require('express');
const { connect } = require('./scripts/database');
require('dotenv').config();

const server = express();
const PORT = process.env.PORT || 3000;

server.use(express.json());
server.use(express.static(__dirname + '/'));

// ABRIR O INDEX.HTML
server.get('/', (req, res) => {
  res.sendFile(__dirname + '/pages/index.html');
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