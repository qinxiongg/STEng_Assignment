const query = require("../config/database");
const bcrypt = require("bcrypt");
const { generateJWT, verifyJWT } = require("../services/authService");
const { createAdmin } = require("../middleware/middlewares");

// TO-DO
// JWT

// authenicate login
const login = async (req, res) => {
  console.log("login called");
  const { username, password } = req.body;
  const ipAddress = req.ip;
  const browserType = req.headers["user-agent"];

  // Run createAdmin if username is admin
  if (username === "admin") {
    createAdmin();
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
    const users_list = await query(`SELECT * from accounts`);
    const groups = await query("SELECT * from user_group");

    users_list.forEach((user) => {
      user.usergroupConcat = groups
        .filter((group) => group.username === user.username)
        .map((group) => group.usergroup);
    });

    console.log(users_list);

    return res.json({ users_list });
  } catch (error) {
    console.log("error:", error);
    // use toast for database error????
    return res.status(500).json({ message: "Error querying from database" });
  }
};

// Add new user to database when input field is submitted
const register = async (req, res) => {
  const { username, email, groups, password, active } = req.body;

  if (!username || !email || !password || !active || !groups) {
    return res
      .status(400)
      .json({ message: "Please enter the required fields" });
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
    console.error("Error when adding new user:", error);
    return res.status(500).json({ message: "Database query error" });
  }
};

const addGroups = async (req, res) => {
  const { groupName } = req.body;

  if (!groupName) {
    return res.status(401).json({ message: "Enter group name" });
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
    const username = decoded.username;
    const result = await query(
      "SELECT username, email, password FROM accounts WHERE username = ?",
      [username]
    );
    res.json({ profile: result[0] });
  } catch (error) {
    res.status(403).json({ message: "Invalid token" });
  }
};

const updateUserProfile = async (req, res) => {
  const token = req.cookies.authToken;

  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = await verifyJWT(token);
    const username = decoded.username;

    const { email, password } = req.body;

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

    // const result = await query(
    //   "UPDATE accounts SET email = ?, password = ? WHERE username = ?",
    //   [email, hashedPassword, username]
    // );

    if (params.length > 1) {
      // console.log(
      //   "Executing query:",
      //   updateProfileQuery,
      //   "with params:",
      //   params
      // );

      await query(updateProfileQuery, params);
      return res.status(200).json({ message: "Profile updated successfully" });
    } else {
      return res.status(400).json({ message: "No fields to update" });
    }
  } catch (error) {
    console.error("Error updating profile:", error);
    return res
      .status(500)
      .json({ message: "Unable to update profile", error: error.message });
  }
};

  const editUser = async (req, res) => {
    const { username, email, password, group, accountStatus } = req.body;

    console.log(req.body)
    if (!email && !password && !group && !accountStatus) {
      return res.status(400).json({ message: "No fields to update" });
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
      if (group) {
        await query("UPDATE user_group SET usergroup = ? WHERE username = ?", [
          group,
          username,
        ]);
      }
      if (accountStatus) {
        await query("UPDATE accounts SET accountStatus = ? WHERE username = ?", [
          accountStatus,
          username,
        ]);
      }
      return res.status(200).json({ message: "User updated successfully" });
    } catch (error) {
      console.error("Error updating user:", error);
      return res.status(500).json({ message: "Database query error" });
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
};
