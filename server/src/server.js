require("dotenv").config();

const app = require("./app");
const connectDatabase = require("./config/database");

const http = require('http');
const { initSocket } = require('./socket');

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDatabase();

  const server = http.createServer(app);
  initSocket(server);

  server.listen(PORT, () => {
    console.log(`CureLink server running on port ${PORT}`);
  });
};

startServer();