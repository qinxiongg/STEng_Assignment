const query = require("../config/database");
const { generateJWT, verifyJWT } = require("../services/authService");
const { Checkgroup } = require("../middleware/middlewares");
// const { Checkgroup, createAdmin } = require("../middleware/middlewares");
const jwt = require("jsonwebtoken");
var bcrypt = require("bcryptjs");

const secretKey = process.env.JWT_SECRET;

// authenicate login
const login = async (req, res) => {
  console.log("login called");
  const { username, password } = req.body;

  // Run createAdmin if username is admin
  // if (username === "admin") {
  //   await createAdmin();
  // }

  if (!username || !password) {
    return res.status(400).json({ message: "Invalid Credentials." });
  }

  try {
    const ipAddress =
      req.ip || req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    const browserType = req.headers["user-agent"];

    const results = await query("SELECT * FROM accounts WHERE username = ?", [
      username,
    ]);

    // Check whether the username exist in the database
    if (results.length === 0) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const user = results[0];

    // Check if queried account is disabled
    if (user.accountStatus === "Disabled") {
      return res.status(403).json({ message: "Access denied" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    // Generate JWT
    const tokenPayload = {
      username: user.username,
      ipAddress: ipAddress,
      browserType: req.headers["user-agent"],
    };

    const authToken = jwt.sign(tokenPayload, secretKey, { expiresIn: "1h" });

    res.cookie("authToken", authToken, {
      maxAge: 1 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "Strict",
    });

    return res.status(200).json({ success: "Successfully logged in" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const logout = async (req, res) => {
  try {
    if (req.cookies.authToken) {
      res.clearCookie("authToken", {
        path: "/",
        httpOnly: true,
        sameSite: "Strict",
      });
    } else {
      console.log("no cookies found");
    }

    return res.status(200).json({ success: "Successfully logged out" });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const getCurrentUser = async (req, res) => {
  const authToken = req.cookies.authToken;

  if (!authToken) {
    return res.status(401).json({ message: "Access denied" });
  }

  try {
    const decoded = jwt.verify(authToken, secretKey);
    const username = decoded.username;

    const [result] = await query(
      `SELECT * FROM accounts 
      WHERE username = ?`,
      [username]
    );

    // Query user's usergroup
    const userGroupQuery = await query(
      `SELECT usergroup
          FROM user_group
          WHERE username = ?`,
      [username]
    );

    if (userGroupQuery.length === 0) {
      return res.status(404).json({ message: "Usergroup not found" });
    }

    // convert usergroup result to an array
    userGroup = userGroupQuery.map((group) => group.usergroup);

    if (result.length === 0) {
      return res.status(404).json({ message: "Unable to find user" });
    }

    const user = {
      username: result.username,
      email: result.email,
      usergroup: userGroup,
    };

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

// Fetch all users from database
const getAllUsers = async (req, res) => {
  try {
    const users_list = await query(`SELECT * from accounts`);
    const groups = await query("SELECT * from user_group");

    users_list.forEach((user) => {
      user.usergroupConcat = groups
        .filter((group) => group.username === user.username)
        .map((group) => group.usergroup);
    });

    return res.json({ users_list });
  } catch (error) {
    return res.status(500).json({ message: "Error querying from database" });
  }
};

// Add new user to database when input field is submitted
const createUser = async (req, res) => {
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

    return res.status(201).json({ success: "New user successfully added" });
  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "Username already exist" });
    }
    console.error("Error when adding new user:", error);
    return res.status(500).json({ message: "Database query error" });
  }
};

const addNewGroups = async (req, res) => {
  const { newGroupName } = req.body;

  if (!newGroupName) {
    return res.status(401).json({ message: "Enter group name" });
  }

  // Check if group already exist
  const groupExist = await query(
    `SELECT * FROM user_group 
    WHERE usergroup = ?`,
    [newGroupName]
  );

  if (groupExist.length > 0) {
    return res.status(409).json({ message: "Group already exist" });
  }

  try {
    await query(
      `INSERT INTO user_group (usergroup) 
      VALUES (?)`,
      [newGroupName]
    );
    return res.status(201).json({ success: "Successfully added group" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error adding group to database", error });
  }
};

const getAllGroups = async (req, res) => {
  try {
    const userGroups = await query("SELECT DISTINCT usergroup from user_group");
    res.json(userGroups);
  } catch (error) {
    res.status(500).json({ message: "Database query error" });
  }
};

const getUserProfile = async (req, res) => {
  const authToken = req.cookies.authToken;
  if (!authToken) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(authToken, secretKey);
    const username = decoded.username;

    const result = await query(
      `SELECT username, email, password 
      FROM accounts 
      WHERE username = ?`,
      [username]
    );

    userProfile = {
      username: result[0].username,
      email: result[0].email,
    };

    res.json(userProfile);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

const updateUserProfile = async (req, res) => {
  const { username, email, password } = req.body;

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
    let updateProfileQuery = "UPDATE accounts SET ";
    const params = [];

    if (email) {
      updateProfileQuery += "email = ?, ";
      params.push(email);
    }

    if (password) {
      const hashedPassword = bcrypt.hash(password, 10);
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
    return res.status(500).json({ error: error.message });
  }
};

const editUser = async (req, res) => {
  const { username, email, password, usergroupConcat, accountStatus } =
    req.body;

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
    return res
      .status(200)
      .json({ success: "Credentials successfully changed" });
  } catch (error) {
    return res.status(500).json({ message: "Database query error" });
  }
};

// check if user is a admin
const checkIsAdmin = async (req, res) => {
  const token = req.cookies.authToken;

  try {
    const decoded = await jwt.verify(token, secretKey);
    const username = decoded.username;
    const isAdmin = await Checkgroup(username, "admin");

    return res.status(200).json({ isAdmin });
  } catch (error) {
    res.status(401).json({ message: "Access denied" });
  }
};

module.exports = {
  login,
  getCurrentUser,
  getAllUsers,
  createUser,
  addNewGroups,
  getAllGroups,
  getUserProfile,
  updateUserProfile,
  editUser,
  checkIsAdmin,
  logout,
};
