const query = require("../config/database");
const { generateJWT, verifyJWT } = require("../services/authService");
const { Checkgroup, createAdmin } = require("../middleware/middlewares");
const jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

const secretKey = process.env.JWT_SECRET;

// authenicate login
const login = async (req, res) => {
  console.log("login called");
  const { username, password } = req.body;
  const ipAddress = req.ip;
  const browserType = req.headers["user-agent"];

  // Run createAdmin if username is admin
  if (username === "admin") {
    await createAdmin();
  }

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
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // Take the first and only row of the queried results
    const user = results[0];

    // Check if queried account is disabled
    if (user.accountStatus === "Disabled") {
      return res.status(403).json({ message: "" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // Generate JWT
    const tokenPayload = {
      username: user.username,
      ipAddress: req.ip,
      browserType: req.headers["user-agent"],
    };

    const token = generateJWT(tokenPayload);

    // if everything else is okay then login
    return res
      .cookie("authToken", token, { maxAge: 3600000, httpOnly: true })
      .status(200)
      .json({ message: "Successfully logged in" });
  } catch (error) {
    return res.status(500).json({ message: "Error." });
  }
};

// Fetch all users from database
const getUsers = async (req, res) => {
  try {
    const users_list = await query(`SELECT * from accounts`);
    const groups = await query("SELECT * from user_group");

    users_list.forEach((user) => {
      user.usergroupConcat = groups
        .filter((group) => group.username === user.username)
        .map((group) => group.usergroup);
    });

    // console.log(users_list);

    return res.json({ users_list });
  } catch (error) {
    // console.log("error:", error);
    // use toast for database error????
    return res.status(500).json({ message: "Error querying from database" });
  }
};

// Add new user to database when input field is submitted
const register = async (req, res) => {
  const { username, email, groups, password, active } = req.body;

  if (!username || !password || !active) {
    return res
      .status(400)
      .json({ message: "Please enter the required fields" });
  }

  const usernameRegex = /^[^\s]{1,50}$/;
  if (!usernameRegex.test(username)) {
    return res.status(400).json({
      message: "Username must be 1-50 characters long and contains no spaces",
    });
  }

  const passwordRegex =
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,10}$/;
  if (!passwordRegex.test(password)) {
    return res.status(400).json({
      message:
        "password must be 8 - 10 characters long and contains alphabets, numbers and special characters",
    });
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (email) {
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Email format must match the pattern username@domain.com",
      });
    }
  }

  try {
    const hashedpassword = await bcrypt.hash(password, 10);

    await query(
      "INSERT INTO accounts (username, password, email, accountStatus) VALUES (?, ?, ?, ?)",
      [username, hashedpassword, email, active]
    );

    for (const group of groups) {
      await query("INSERT INTO user_group(usergroup, username) VALUES (?, ?)", [
        group,
        username,
      ]);
    }

    return res.status(201).json({ message: "New user added successfully" });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Username already exist" });
    }
    // change to "something went wrong"

    console.error("Error when adding new user:", error);
    return res.status(500).json({ message: "Database query error" });
  }
};

const addGroups = async (req, res) => {
  const { groupName } = req.body;

  if (!groupName) {
    return res.status(401).json({ message: "Enter group name" });
  }

  // Check if group already exist
  const groupExist = await query(
    "SELECT * FROM user_group WHERE usergroup = ?",
    [groupName]
  );

  if (groupExist.length > 0) {
    return res.status(409).json({ message: "Group already exist" });
  }

  try {
    const result = await query(
      "INSERT INTO user_group (usergroup) VALUES (?)",
      [groupName]
    );
    return res.status(201).json({ message: "Successfully added group" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error adding group to database", error });
  }
};

const getGroups = async (req, res) => {
  try {
    const userGroups = await query("SELECT DISTINCT usergroup from user_group");
    res.json({ userGroups });
  } catch (error) {
    res.status(500).json({ message: "Database query error" });
  }
};

const getUsername = async (req, res) => {
  const token = req.cookies.authToken;
  if (!token)
    return res
      .status(401)
      .json({ message: "No token provided for username display " });
  try {
    const decoded = await verifyJWT(token);
    res.status(200).json({ username: decoded.username });
  } catch (error) {
    res.status(403).json({ message: "Invalid token" });
  }
};

const getUserProfile = async (req, res) => {
  const token = req.cookies.authToken;
  if (!token)
    return res
      .status(401)
      .json({ message: "No token provided for user profile" });

  try {
    const decoded = await verifyJWT(token);
    // console.log(decoded);
    const username = decoded.username;
    const result = await query(
      `SELECT username, email, password 
      FROM accounts 
      WHERE username = ?`,
      [username]
    );
    res.json({ profile: result[0] });
  } catch (error) {
    res.status(403).json({ message: "Invalid token" });
  }
};

const updateUserProfile = async (req, res) => {
  console.log("update profile called");
  const token = req.cookies.authToken;

  const { password } = req.body;

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }
  console.log("password", password);
  if (password && password.length > 0) {
    const passwordRegex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,10}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "password must be 8 - 10 characters long and contains alphabets, numbers and special characters",
      });
    }
  }

  try {
    const decoded = await verifyJWT(token);
    const username = decoded.username;
    console.log;
    const { email, password } = req.body;

    console.log("show edit profile", req.body);

    let updateProfileQuery = "UPDATE accounts SET ";
    const params = [];

    if (email) {
      updateProfileQuery += "email = ?, ";
      params.push(email);
    }

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      updateProfileQuery += "password = ?, ";
      params.push(hashedPassword);
    }

    updateProfileQuery = updateProfileQuery.slice(0, -2);
    updateProfileQuery += " WHERE username = ?";
    params.push(username);

    if (params.length > 1) {
      await query(updateProfileQuery, params);
      return res.status(200).json({ success: "Profile updated successfully" });
    } else {
      return res.status(400).json({ message: "No fields to update" });
    }
  } catch (error) {
    console.error("Error updating profile:", error);
    return res
      .status(403)
      .json({ message: "Access denied", error: error.message });
  }
};

const editUser = async (req, res) => {
  const { username, email, password, usergroupConcat, accountStatus } =
    req.body;

  console.log(req.body);
  if (!email && !password && !accountStatus) {
    return res.status(400).json({ message: "No fields to update" });
  }
  if (password) {
    const passwordRegex =
      /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,10}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "password must be 8 - 10 characters long and contains alphabets, numbers and special characters",
      });
    }
  }

  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (email) {
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        message: "Email format must match the pattern username@domain.com",
      });
    }
  }

  try {
    if (email) {
      await query("UPDATE accounts SET email = ? WHERE username = ?", [
        email,
        username,
      ]);
    }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await query("UPDATE accounts SET password = ? WHERE username = ?", [
        hashedPassword,
        username,
      ]);
    }
    if (usergroupConcat) {
      await query("DELETE FROM user_group WHERE username = ?", [username]);

      //loop
      for (const group of usergroupConcat) {
        await query(
          "INSERT INTO user_group(usergroup, username) VALUES (?, ?)",
          [group, username]
        );
      }
    }
    if (accountStatus) {
      await query("UPDATE accounts SET accountStatus = ? WHERE username = ?", [
        accountStatus,
        username,
      ]);
    }
    return res.status(200).json({ success: "Credential successfully changed" });
  } catch (error) {
    console.error("Error updating user:", error);
    return res.status(500).json({ message: "Database query error" });
  }
};

// check if user is a admin
const checkIsAdmin = async (req, res) => {
  const token = req.cookies.authToken;
  console.log("token is ", token);

  try {
    const decoded = await jwt.verify(token, secretKey);
    const username = decoded.username;
    const isAdmin = await Checkgroup(username, "admin");
    console.log(isAdmin);
    return res.status(200).json({ isAdmin });
  } catch (error) {
    res.status(401).json({ message: "Access denied" });
  }
};

module.exports = {
  login,
  getUsers,
  register,
  addGroups,
  getGroups,
  getUsername,
  getUserProfile,
  updateUserProfile,
  editUser,
  checkIsAdmin,
  createAdmin,
};
