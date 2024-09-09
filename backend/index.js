import express from "./node_modules/express";
const app = express();
const port = 3000;

// remove this for security?????
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
})

// login
app.get("/", (req, res) => {
  res.send("something here");
});

//  change credentials
app.put("/what is this", (req, res) => {
  res.sendStatus(200);
});
