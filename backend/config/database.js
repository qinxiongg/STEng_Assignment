const mysql = require("mysql2");
const dotenv = require("dotenv");
const util = require("util");
dotenv.config();


const pool = mysql.createPool({
  host: process.env.Host,
  user: process.env.User,
  password: process.env.password,
  database: process.env.database,
  connectionLimit: 20,
  maxIdle: 20,
  idleTimeout: 60000,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});


pool.getConnection((err, connection) => {
  if (err) {
    console.error("Error connecting to database", err.stack);
    return;
  }
  console.log("Connected to the database as id" + connection.threadId);
  connection.release(); //release the connection
});

// promisify query
const query = (sql, params) => {
  return new Promise((resolve, reject) => {
    pool.query(sql, params, (error, results) => {
      if (error) {
        reject(error);
      } else {
        resolve(results);
      }
    });
  });
};

module.exports = query;
