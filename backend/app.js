const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const userRoutes = require("./routes/userRoute.js");
const tmsRoutes = require("./routes/tmsRoutes.js");
const demoAPIRoutes = require("./routes/demoAPIRoutes.js");
const msgCode = require("../backend/constants/msgCode.js");

const app = express();
// const { verifyTokenWithIPAndBrowser,} = require("./middleware/authMiddleware.js");

const port = 3000;

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use("/api", userRoutes);
app.use("/api", tmsRoutes);
app.use("/api/demo", demoAPIRoutes);

app.use("/api/demo", demoAPIRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
