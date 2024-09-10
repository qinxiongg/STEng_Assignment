const express = require("express");
const session = require("express-session");
const path = require("path");
const app = express();

const connection = require("../config/database");

const loginController = (req, res) => {
  console.log('login called')
  const { username, password } = req.body;

  if (username && password) {
    connection.query(
      "SELECT * FROM accounts WHERE username = ? and password = ?",
      [username, password],
      (error, results) => {
        if (error) return res.status(500).send("Unable to connect to database");

        if (results.length > 0) {
          req.session.loggedin = true;
          req.session.username = username;
          res.redirect("/tms");
        } else {
          res.status(401).send("Incorrect Username and/or Password");
        }
      }
    );
  } else {
    res.status(400).send("Please enter your username and password");
  }
};

module.exports = {
  loginController
};
