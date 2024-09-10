const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const userRoutes = require("./routes/userRoute.js");
const session = require("express-session");
const {
  verifyTokenWithIPAndBrowser,
} = require("./middleware/authMiddleware.js");
const { loginController } = require("./controllers/userControllers.js");

const port = 3000;

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),

  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);

dotenv.config();

app.use(express.json());
app.use(cookieParser());
app.use("/api", userRoutes);

app.get("/", (req, res) => {
  console.log("this is being called");
  res.status(200).send("it works!");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
