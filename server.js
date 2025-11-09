const express = require("express");
const cors = require("cors");
const http = require("http");
const connectDB = require("./config/db");
const scheduleJob = require("./jobs/scheduleJob");

const app = express();
const server = http.createServer(app);

app.use(express.json());
app.use(cors());

connectDB();

// Init sockets
const { init: initSocket } = require("./services/socket");
initSocket(server);

app.use("/auth", require("./routes/auth"))
app.use("/instructors", require("./routes/instructors"));
app.use("/lessons", require("./routes/lessons"));
app.use("/products", require("./routes/products"));
app.use("/chats", require("./routes/chats"));

scheduleJob();

server.listen(3000, "0.0.0.0", () => {
  console.log("Server running on port 3000");
});
