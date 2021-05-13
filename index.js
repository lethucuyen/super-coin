const express = require("express");
var cors = require("cors");
const logger = require("morgan");
require("express-async-errors");
const blockchain = require("./blockchain");
const Node = require("./node");

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

app.post("/testWallets", (req, res) => {
  // Tao vi

  console.log("start two nodes node1 and node2");
  const node1 = new Node();
  const node2 = new Node();
  const node3 = new Node();

  node1.newWallet("pw1");
  node2.newWallet("pw2");
  node3.newWallet("pw2");

  console.log("node1 should have 0 coins");
  console.log(node1.getBalance());

  // Nap 200 coin vao tai khoan lam von

  console.log("add the transaction to node1");
  let txs = [];
  let count = 0;
  while (count < 2) {
    txs.push(node1.rewardTransaction(node1.wallet.publicKey));
    count++;
  }

  console.log(txs);

  node1.blockchain.mine(txs);

  console.log("node1 should have 200 coins");
  console.log(node1.getBalance());

  // Node1 goi tien cho node2

  console.log(
    "create transaction where node1 gives node2 10 coins with fee of 5"
  );
  const tx = node1.createTransaction(
    [{ amount: 10, address: node2.wallet.publicKey, fee: 5 }],
    "pw1"
  );
  console.log([tx]);

  console.log("add the transaction to node2");
  node2.mempool.addTransaction(tx);
  console.log(node2.mempool);

  // Dao
  console.log("node2 mines the new transaction");
  node2.mine();
  console.log("So du cua node1:", node1.getBalance());
  console.log("So du cua node2:", node2.getBalance());

  res.json({
    succeeded: true,
    message: "",
    result: null,
  });
});
