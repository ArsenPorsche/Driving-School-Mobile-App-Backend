require("dotenv").config();

const express = require("express");
const cors = require("cors");
const http = require("http");
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");
const scheduleJob = require("./jobs/scheduleJob");

const app = express();
const server = http.createServer(app);

// ------- Global middleware -------
app.use(express.json({ limit: "1mb" }));
app.use(cors());

// ------- Database -------
connectDB();

// ------- WebSockets -------
const { init: initSocket } = require("./services/socket");
initSocket(server);

// ------- API Routes -------
app.use("/auth", require("./routes/auth"));
app.use("/instructors", require("./routes/instructors"));
app.use("/lessons", require("./routes/lessons"));
app.use("/products", require("./routes/products"));
app.use("/chats", require("./routes/chats"));
app.use("/tests", require("./routes/tests"));

// ------- Global error handler (MUST be after routes) -------
app.use(errorHandler);

// ------- Scheduled jobs -------
scheduleJob();

// ------- Start server -------
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
