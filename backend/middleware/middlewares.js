// Middlewares for route protection
const query = require("../config/database");
const jwt = require("jsonwebtoken");
const { verifyJWT } = require("../services/authService"); // change to jwt
var bcrypt = require("bcryptjs");

// const bcrypt = require("bcrypt");

const secretKey = process.env.JWT_SECRET;

// Authenticate
async function authenticateJWT(req, res, next) {
  const token = req.cookies.authToken;

  if (!token) {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const decoded = jwt.verify(token, secretKey);
    const currentIP = req.ip;
    const currentBrowser = req.headers["user-agent"];
    const checkUserStatus = await checkUserAccStatus(decoded.username);
    if (
      currentIP == decoded.ipAddress &&
      currentBrowser == decoded.browserType &&
      checkUserStatus
    ) {
      req.user = decoded; //make user data readily available
      next();
    } else {
      return res.status(403).json({ message: "Access denied" });
    }
  } catch (error) {
    return res.status(403).json({ message: "Access denied" });
  }
}

// Check if user is in authorised group
const Checkgroup = async (userid, groupname) => {
  try {
    const result = await query(
      `SELECT COUNT(*) as count
      FROM user_group
      WHERE username = ? AND usergroup = ?`,
      [userid, groupname]
    );
    const count = result[0].count;
    return count > 0;
  } catch (error) {
    console.error("Unable to query database");
    res.status(500).json({ message: error });
  }
};

// Check if user's account status is active or disabled
const checkUserAccStatus = async (username) => {
  try {
    const results = await query(
      `SELECT accountStatus
      FROM accounts
      WHERE username = ?`,
      [username]
    );
    if (results.length === 0) {
      console.error("User not found", error);
    }

    return results[0].accountStatus === "Active"; // return true if status is active
  } catch (error) {
    console.error("Error checking user's account status", error);
    return res
      .status(403)
      .json({ message: "Access denied12" });
  }
};

// // move this to other file
// const createAdmin = async () => {
//   const adminUsername = "admin";
//   const adminPwd = "admin123!!";

//   try {
//     const results = await query("SELECT * FROM accounts WHERE username = ?", [
//       adminUsername,
//     ]);

//     if (results.length === 0) {
//       const hashedAdminPwd = await bcrypt.hash(adminPwd, 10);

//       await query(
//         "INSERT INTO accounts (username, password, email, accountStatus) VALUES (?, ?, ?, ?)",
//         [adminUsername, hashedAdminPwd, "admin@admin.com", "Active"]
//       );
//       console.log("Admin account created.");
//     }
//   } catch (error) {
//     console.error("Error setting up admin account:", error);
//   }
// };

// Middleware to protect routes and check group
const verifyTokenWithIPAndBrowser =
  (requiredGroup) => async (req, res, next) => {
    const token = req.cookies.authToken;
    if (!token) {
      return res.status(403).json({ message: "Access denied" });
    }

    try {
      const decoded = jwt.verify(token, secretKey);

      const currentIP = req.ip;
      const currentBrowser = req.headers["user-agent"];
      const checkUserStatus = await checkUserAccStatus(decoded.username);
      const checkUserGroup = await Checkgroup(decoded.username, requiredGroup);

      if (
        currentIP == decoded.ipAddress &&
        currentBrowser == decoded.browserType &&
        checkUserStatus &&
        checkUserGroup
      ) {
        next();
      } else {
        res.clearCookie("authToken");
        return res.status(403).json({ message: "Access denied" }); // TODO: redirect user back to login
      }
    } catch (error) {
      res.status(403).json({ message: "Access denied" });
    }
  };

module.exports = {
  verifyTokenWithIPAndBrowser,
  authenticateJWT,
  Checkgroup,
};
