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

// Root endpoint
app.get("/", (req, res) => {
  res.send(
    `This is the API for the website on <a href="${process.env.CLIENT_URL}">${process.env.CLIENT_URL}</a>`
  );
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
