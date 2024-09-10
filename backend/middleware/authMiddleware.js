const express = require("express");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(express.static(path.join(__dirname, "static")));

const verifyTokenWithIPAndBrowser = (req, res, next) => {
    if (isValid(req)) {
        next(); //pass to next middleware or route handler
    } else {
        res.status(403).send('Unauthorised');
    }
};

module.exports = {
    verifyTokenWithIPAndBrowser
};