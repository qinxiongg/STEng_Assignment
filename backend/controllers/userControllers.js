const jwt = require("jsonwebtoken");
const query = require("../config/database");
const bcrypt = require("bcrypt");

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
    // TODO: implement password check
    const results = await query("SELECT * FROM accounts WHERE username = ?", [
      username,
    ]);

    if (results.length === 0) {
      return res
        .status(401)
        .json({ message: "Invalid Username and/or Password." });
    }

    const user = results[0];

    if (user.accountStatus === "Disabled") {
      return res.status(403).json({ message: "Account is disabled." });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res
        .status(401)
        .json({ message: "Invalid Username and/or Password." });
    }

    // implement JWT here??
    req.session.loggedin = true;
    req.session.username = username;

    // cookie for jwt
    return res
      .cookie("cookieName", 50, { maxAge: 900000, httpOnly: true })
      .status(200)
      .json({ message: "Successfully logged in" });
  } catch (error) {
    return res.status(500).json({ message: "Unable to connect to database." });
  }
};

// Fetch all users from database
const getUsers = async (req, res) => {
  try {
    const users_list = await query("SELECT * FROM accounts");

    res.json({ users_list });
  } catch (error) {
    console.log("error:", error);
    // use toast for database error????
    return res.status(500).json({ message: "Error querying from database" });
  }
};

// Add new users to database when input field is submitted
const register = async (req, res) => {
  const { username, email, password, active } = req.body;

  if (!username || !email || !password || !active) {
    return res.status(400).json({ message: "Please enter your credentials" });
  }

  try {
    const hashedpassword = await bcrypt.hash(password, 10);

    const results = await query(
      "INSERT INTO accounts (username, password, email, accountStatus) VALUES (?, ?, ?, ?)",
      [username, hashedpassword, email, active]
    );

    return res.status(201).json({ message: "New user added successfully" });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Username already exist" });
    }
    console.error("Error when adding new user:", error);
    return res.status(500).json({ message: "Database query error" });
  }
};

module.exports = {
  authController,
  getUsers,
  register,
};
