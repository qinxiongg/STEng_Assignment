// Middlewares for route protection
const query = require("../config/database");
const { verifyJWT } = require("../services/authService");
const bcrypt = require("bcrypt");

async function authenticateJWT(req, res, next) {
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
  } catch (err) {
    return res
      .status(403)
      .json({ message: "Token is invalid or has expired." });
  }
}

// put checkgroup here and create another function to verify checkgroup
async function checkgroup(userid, groupname) {
  const username = req.body.username;
  

}

// move this to other file
const createAdmin = async () => {
  const adminUsername = "admin";
  const adminPwd = "admin";

  try {
    const results = await query("SELECT * FROM accounts WHERE username = ?", [
      adminUsername,
    ]);

    if (results.length === 0) {
      const hashedAdminPwd = await bcrypt.hash(adminPwd, 10);

      await query(
        "INSERT INTO accounts (username, password, email, accountStatus) VALUES (?, ?, ?, ?)",
        [adminUsername, hashedAdminPwd, "admin@admin.com", "Active"]
      );
      console.log("Admin account created.");
    
    }
  } catch (error) {
    console.error("Error setting up admin account:", error);
  }
};




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
  authenticateJWT,
  createAdmin,
};
