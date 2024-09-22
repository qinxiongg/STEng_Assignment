const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
dotenv.config();
const secretKey = process.env.JWT_SECRET;

// move to login
function generateJWT(tokenPayload) {
  return jwt.sign(tokenPayload, secretKey, { expiresIn: "1h" });
}

// move to middleware
function verifyJWT(token) {
  return new Promise((resolve, reject) => {
    jwt.verify(token, secretKey, (err, decoded) => {
      if (err) reject(err);
      resolve(decoded);
    });
  });
}

module.exports = { generateJWT, verifyJWT };
