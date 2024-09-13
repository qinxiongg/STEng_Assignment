// Middlewares for route protection

const { verifyJWT } = require("../services/authService");

async function authJWT(req, res, next) {
  // Get token from cookie
  const token = req.cookies.authToken;
  console.log(token);
  console.log(req.cookies);
  if (!token) {
    return res.status(401).json({ message: "Unauthorised. No token provided" });
  }

  try {
    // Call verifyJWT from authService.js to decode token
    const decoded = await verifyJWT(token);
    next();

    //Attached
  } catch (err) {
    return res
      .status(403)
      .json({ message: "Token is invalid or has expired." });
  }
}

// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));
// app.use(express.static(path.join(__dirname, "static")));

// const verifyTokenWithIPAndBrowser = (req, res, next) => {
//     if (isValid(req)) {
//         next(); //pass to next middleware or route handler
//     } else {
//         res.status(403).send('Unauthorised');
//     }
// };

module.exports = {
  //   verifyTokenWithIPAndBrowser,
  authJWT,
};
