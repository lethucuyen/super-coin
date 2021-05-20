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

const http = require("http");
const server = http.createServer(app);

server.listen(process.env.PORT || 3006, () =>
  console.log(
    `Server is running at http://localhost:${process.env.PORT || 3006}`
  )
);
const Wallet = require("./wallet");

const io = require("socket.io")(server);
const client = require("socket.io-client");
const BlockchainNetwork = require("./blockchainNetwork");

const blockChain = new BlockchainNetwork(null, io);

blockChain.addPeer(
  client(`http://localhost:${process.env.PORT || 3006}`),
  blockChain
);

io.on("connection", (socket) => {
  // On connection of socket
  console.log("New user connected, ID =", socket.id);
  blockChain.addPeer(socket, blockChain);
  console.log(blockChain.getPeers().length);

  socket.on("disconnect", () => {
    console.log(`User: ${socket.id} was disconnected`);
  });
});

app.post("/register", (req, res) => {
  const wallet_password = req.body.password;

  const node = new Node();
  node.newWallet(wallet_password);

  blockChain.addNode(node, blockChain);

  // console.log('broadcast to other nodes in the network');
  // const lastestNodes = blockChain.getNodes.map((item) => ({
  //   address: item.wallet.publicKey,
  // }));
  // io.emit("lastest nodes", lastestNodes)

  res.json({
    succeeded: true,
    message: "Register Success",
    data: {
      address: node.wallet.publicKey,
      nodesLength: blockChain.nodes.length,
      nodes: blockChain.getNodes(),
      blockchain: blockChain.getBlocks(),
    },
  });
});

app.get("/nodes", (req, res) => {
  res.json({
    succeeded: true,
    message: "Get Nodes Success",
    data: {
      nodes: blockChain.getNodes(),
    },
  });
});

app.post("/reward", (req, res) => {
  const target = req.body.address;

  const node = blockChain.nodes.filter(
    (node) => node.wallet.publicKey === target
  )[0];

  let txs = [];
  let count = 0;
  while (count < 1) {
    txs.push(node.rewardTransaction(node.wallet.publicKey));
    count++;
  }
  node.blockchain.mine(txs);

  blockChain.uploadBlocks(node);

  res.json({
    succeeded: true,
    message: "Reward Success",
    data: {
      balance: node.getBalance(),
      blockchain: blockChain.getBlocks(),
    },
  });
});

app.post("/balance", (req, res) => {
  const target = req.body.address;
  const node = blockChain.nodes.filter(
    (node) => node.wallet.publicKey === target
  )[0];

  res.json({
    succeeded: true,
    message: "Get Balance Success",
    data: {
      balance: node.getBalance(),
    },
  });
});

app.post("/getFunds", (req, res) => {
  const target = req.body.address;
  const node = blockChain.nodes.filter(
    (node) => node.wallet.publicKey === target
  )[0];

  res.json({
    succeeded: true,
    message: "Get Balance Success",
    data: node.getUnspentInputs(),
  });
});

app.post("/pay", (req, res) => {
  const { password, from, to, amount, fee } = req.body;
  const node1 = blockChain.nodes.filter(
    (node) => node.wallet.publicKey === from
  )[0];
  const node2 = blockChain.nodes.filter(
    (node) => node.wallet.publicKey === to
  )[0];

  console.log(
    `create transaction where node1 gives node2 ${amount} coins with fee of ${fee}`
  );

  const tx = node1.createTransaction(
    [{ amount: amount, address: node2.wallet.publicKey, fee: fee }],
    password
  );

  node2.mempool.addTransaction(tx);
  console.log([node2.mempool]);

  blockChain.uploadMempool(node2);

  res.json({
    succeeded: true,
    message: "Transaction Success",
    data: {
      mempool: node2.mempool.getDetails(),
    },
  });
});

app.post("/mine", (req, res) => {
  const miner = req.body.miner;
  const node = blockChain.nodes.filter(
    (node) => node.wallet.publicKey === miner
  )[0];

  node.mine(); // for one block

  blockChain.uploadMempool(node);
  blockChain.uploadBlocks(node);

  res.json({
    succeeded: true,
    message: "Mine New Block Success",
    data: {
      currentBalance: node.getBalance(),
      mempool: node.mempool.getDetails(),
      blockchain: node.blockchain.blockchain.map((block) => block.getDetails()),
    },
  });
});

app.get("/blockchain", (req, res) => {
  res.json({
    succeeded: true,
    message: "Get Blocks Success",
    result: blockChain.getBlocks(),
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

  console.log("start three nodes node1, node2 and node3");
  const node1 = new Node();
  const node2 = new Node();
  const node3 = new Node();

  node1.newWallet("pw1");
  node2.newWallet("pw2");
  node3.newWallet("pw3");
  blockChain.addNode(node1, blockChain);
  blockChain.addNode(node2, blockChain);
  blockChain.addNode(node3, blockChain);

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
  blockChain.uploadBlocks(node1);

  console.log("node1 should be added 100 coins");

  console.log(node1.getBalance());

  console.log(
    "create transaction where node1 gives node2 10 coins with fee of 5"
  );

  const tx = node1.createTransaction(
    [{ amount: 10, address: node2.wallet.publicKey, fee: 5 }],
    "pw1"
  );
  console.log([tx]);

  console.log("add the transaction to pool");

  node2.mempool.addTransaction(tx);
  blockChain.uploadMempool(node2);

  console.log("node3 mines the new transaction");

  node3.mine();
  blockChain.uploadMempool(node3);
  blockChain.uploadBlocks(node3);

  // Log
  console.log("node1", node1.mempool);
  console.log("node2", node2.mempool);
  console.log("node3", node3.mempool);
  console.log("node1", node1.blockchain);
  console.log("node2", node2.blockchain);
  console.log("node3", node3.blockchain);

  res.json({
    succeeded: true,
    message: "",
    result: {
      node1: {
        address: node1.wallet.publicKey,
        balance: node1.getBalance(),
      },
      node2: {
        address: node2.wallet.publicKey,
        balance: node2.getBalance(),
      },
      node3: {
        address: node3.wallet.publicKey,
        balance: node3.getBalance(),
      },
    },
  });
});
