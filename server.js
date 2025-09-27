const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const scheduleJob = require("./jobs/scheduleJob");

const app = express();

app.use(express.json());
app.use(cors());

connectDB();

app.use("/auth", require("./routes/auth"))
app.use("/instructors", require("./routes/instructors"));
app.use("/lessons", require("./routes/lessons"));
app.use("/products", require("./routes/products"));

scheduleJob();

app.listen(3000, "0.0.0.0", () => {
  console.log("Server running on port 3000");
});
