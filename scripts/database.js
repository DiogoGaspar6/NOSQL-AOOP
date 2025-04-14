const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();

const uri = `mongodb+srv://${process.env.DBUSER}:${process.env.DBPASSWORD}@${process.env.CLUSTER_URL}/?retryWrites=true&w=majority&tls=true&appName=${process.env.CLUSTER_NAME}`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

const connect = async () => {
  try {
    await client.connect();
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error);
  }
  return client;
}

module.exports = { connect, client };