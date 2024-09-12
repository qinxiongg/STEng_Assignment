const jwt = require("jsonwebtoken");
const query = require("../config/database");

// TO-DO
// JWT and bcrypt

// authenicate login
const authController = async (req, res) => {
  console.log("login called");
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Please enter your username and/or password" });
  }

  try {
    const results = await query(
      "SELECT * FROM accounts WHERE username = ? and password = ?",
      [username, password]
    );

    if (results.length > 0) {
      const user = results[0]; //takes the first and only row

      if (user.accountStatus === "Disabled") {
        return res.status(403).json({ message: "Account is disabled." });
      }

      // implement JWT here??
      req.session.loggedin = true;
      req.session.username = username;

      // cookie for jwt
      return res
        .cookie("cookieName", 50, { maxAge: 900000, httpOnly: true })
        .status(200)
        .json({ message: "Successfully logged in" });
    } else {
      return res
        .status(401)
        .json({ message: "Invalid Username and/or Password." });
    }
  } catch (error) {
    return res.status(500).json({ message: "Unable to connect to database." });
  }
};

// Get all users from database
const getUsers = async (req, res) => {
  try {
    const users_list = await query("SELECT * FROM accounts");

    res.json(users_list);
  } catch (error) {
    console.log("error:", error);
    // use toast for database error????
    return res.status(500).json({ message: "Error querying from database" });
  }
};

// Add new users to database when input field is submitted
const addnewUsers = async (req, res) => {
  
}

module.exports = {
  authController,
  getUsers,
  addnewUsers,
};
