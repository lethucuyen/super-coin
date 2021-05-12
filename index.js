const express = require("express");
var cors = require("cors");
const logger = require("morgan");
require("express-async-errors");
const blockchain = require("./blockchain");

const app = express();

require("dotenv").config({ silent: process.env.NODE_ENV === "production" });

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(logger("dev"));

app.get("/", (req, res) => {
  return res.end("Super Coin - Cryptocurrency Project using Node.js");
});

app.use(function (err, req, res, next) {
  console.error(err.stack);
  res.status(500).json({
    error_message: "Something broke!",
  });
});

app.listen(process.env.PORT || 3006, () =>
  console.log(
    `Server is running at http://localhost:${process.env.PORT || 3006}`
  )
);

app.post("/mine", (req, res) => {
  blockchain.mine(req.body.newBlockData);
  res.json({
    succeeded: true,
    message: "",
    data: null,
  });
});

app.get("/getList", (req, res) => {
  var list = blockchain.get();
  res.json({
    succeeded: true,
    message: "",
    result: list,
  });
});

app.post("/testNotAllowedAction", (req, res) => {
  var isValidChain = blockchain.testNotAllowedAction(
    req.body.index,
    req.body.newData
  );
  res.json({
    succeeded: isValidChain,
    message: isValidChain
      ? "Replacement chain is valid"
      : "Replacement chain is not valid. ",
    result: null,
  });
});
