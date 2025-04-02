const express = require("express");
const cors = require("cors");
const authRoutes = require("./routes/authRoutes");
const dotenv = require("dotenv");
const database = require("./config/database");
dotenv.config();

//Instantiate the server
const app = express();

//connect to DB
database.connectDB();

//middleware
app.use(cors());
app.use(express.json());

//routes
app.use("/api/users", authRoutes);

const PORT = process.env.PORT || 3000;

//default routes
app.get("/", (req, res) => {
  return res.json({
    success: true,
    message: "Server is running...",
  });
});

// server listen
app.listen(PORT, () => {
  console.log(`Server is running at ${PORT}`);
});
