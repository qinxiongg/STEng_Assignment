const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const userRoutes = require("./routes/userRoute.js");
const app = express();

// const {
//   verifyTokenWithIPAndBrowser,
// } = require("./middleware/authMiddleware.js");
const { login } = require("./controllers/userControllers.js");

const port = 3000;

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

dotenv.config();

app.use(express.json());
app.use(cookieParser());
app.use("/api", userRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
