const query = require("../config/database");
const bcrypt = require("bcrypt");
const { generateJWT } = require("../services/authService");

// TO-DO
// JWT

// authenicate login
const login = async (req, res) => {
  console.log("login called");
  const { username, password } = req.body;
  const ipAddress = req.ip;
  const browserType = req.headers["user-agent"];

  // Check if login input fields is mepty
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Please enter your username and/or password" });
  }

  try {
    const results = await query("SELECT * FROM accounts WHERE username = ?", [
      username,
    ]);

    // Check whether the username exist in the database
    if (results.length === 0) {
      return res
        .status(401)
        .json({ message: "Invalid Username and/or Password." });
    }

    // Take the first and only row of the queried results
    const user = results[0];

    // Check if queried account is disabled
    if (user.accountStatus === "Disabled") {
      return res.status(403).json({ message: "Account is disabled." });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res
        .status(401)
        .json({ message: "Invalid Username and/or Password." });
    }

    // Generate JWT
    const tokenPayload = {
      username: user.username,
      ipAddress: ipAddress,
      browserType: browserType,
    };

    const token = generateJWT(tokenPayload);

    // if everything else is okay then login
    return res
      .cookie("authToken", token, { maxAge: 3600000, httpOnly: true })
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
  login,
  getUsers,
  register,
};
