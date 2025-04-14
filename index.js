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

// MIDDLEWARE 

server.get('/movies', async (req, res) => {
  try {
    const { getMovies } = await import('./netlify/functions/get_movies/get_movies.mjs');
    const page = parseInt(req.query.page || "1");
    const limit = parseInt(req.query.limit || "10");

    const movies = await getMovies({ page, limit });
    res.json(movies);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

const startServer = async () => {
  try {
    await connect();
    server.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to connect to database:', error);
    process.exit(1);
  }
};

startServer();