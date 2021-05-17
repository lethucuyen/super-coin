const { MessageTypeEnum } = require("./messageType");
const MessageCreator = require("./messageCreator");
const faker = require("faker");
const { v4 } = require("uuid");
const Node = require("./node");

const connectedPeers = [];

const startSocket = (io) => {
  io.on("connection", (peer) => {
    // On connection of socket
    console.log("New user connected");
    console.log(peer.id);

    const peerNode = new Node();

    incomingConnection(peerNode, peer);
  });
};

// Ham xu ly va lang nghe khi co node ket noi socket toi server
const incomingConnection = (peerNode, peer) => {
  try {
    peerNode.id = peerNode.wallet.publicKey; // la socket_id
    // this.id = v4();
    peerNode.name = faker.name.findName();
    connectedPeers.push({
      socket: peer,
      id: peerNode.id,
      name: peerNode.name,
    });
    broadcast(MessageCreator.getPeers(connectedPeers));

    handleClosedConnection(peer);
    incomingMsgHandler(peerNode, peer);
    peerErrorHandler(peer);
    // Yeu cau goi du lieu tai node len de dong bo
    sendMsg(peer, MessageCreator.getLatestBlock());
    sendMsg(peer, MessageCreator.getTransactions());
  } catch (error) {
    console.log("[incomingConnection]", error);
  }
};

// Ham quang loi den server
const peerErrorHandler = (peer) => {
  peer.on("error", (e) => {});
};

// Ham goi msg den node (co the la goi 1 yeu cau hoac goi du lieu tra ve the yeu cau)
const sendMsg = (peer, payload) => {
  const payloadStr = JSON.stringify(payload); // to JSON
  // console.log("send message");
  // console.log([payloadStr]);
  peer.emit("data", payloadStr); // server to node
};

// Ham xu ly thong diep nhan duoc khi co node ket noi socket toi server
const incomingMsgHandler = (peerNode, peer) => {
  peer.on("data", (message) => {
    // node to sever
    const messageJS = JSON.parse(message || {});
    try {
      handleIncomingMsg(peerNode, peer, messageJS);
    } catch (e) {}
  });
};

// (Helper)
const handleIncomingMsg = (peerNode, peer, message) => {
  console.log("handle incoming message");
  console.log([message]);
  // Ktra msg va co xu ly tuong ung
  switch (message.type) {
    case MessageTypeEnum.REQUEST_LATEST_BLOCK:
      const latestBlock = peerNode.blockchain.latestBlock;
      // Phan hoi lai
      sendMsg(peer, MessageCreator.sendLatestBlock(latestBlock));
      break;
    case MessageTypeEnum.REQUEST_BLOCKCHAIN:
      const chain = peerNode.blockchain.blockchain;
      sendMsg(peer, MessageCreator.sendBlockchain(chain));
      break;
    case MessageTypeEnum.RECEIVE_BLOCKCHAIN:
      handleReceivedBlockchain(peerNode, peer, message.payload);
      break;
    case MessageTypeEnum.RECEIVE_LATEST_BLOCK:
      handleReceivedLatestBlock(peerNode, peer, message.payload);
      break;
    case MessageTypeEnum.REQUEST_TRANSACTIONS:
      sendMsg(peer, MessageCreator.getTransactions()); //?
      break;
    case MessageTypeEnum.RECEIVE_TRANSACTIONS:
      const receivedTransactions = message.payload;
      receivedTransactions.forEach((transactionJS) => {
        const transaction = Transaction.fromJS(transactionJS);
        peerNode.mempool.addTransaction(transaction);
      });
      break;
    case MessageTypeEnum.RECEIVE_LATEST_TRANSACTION:
      peerNode.mempool.addTransaction(Transaction.fromJS(message.payload));
      break;
    case MessageTypeEnum.RECEIVE_REMOVE_TRANSACTION:
      peerNode.mempool.removeTransaction(Transaction.fromJS(message.payload));
      break;
    case MessageTypeEnum.REQUEST_PROFILE:
      try {
        sendMsg(peer, MessageCreator.getProfile(profileInfoHandler(peerNode)));
      } catch (error) {
        console.log(error);
      }
      break;
    case MessageTypeEnum.MINE_NEW_BLOCK:
      if (!message.payload.transaction) {
        // Nap 100 coin moi lan vao tai khoan lam von
        const txs = [peerNode.rewardTransaction(peerNode.wallet.publicKey)];
        peerNode.blockchain.mine(txs);
      } else {
      }

      sendMsg(peer, MessageCreator.getProfile(profileInfoHandler(peerNode)));
      break;
    case MessageTypeEnum.REQUEST_PEERS:
      try {
        sendMsg(peer, MessageCreator.getPeers(connectedPeers));
      } catch (e) {
        console.log(e);
      }
      break;
    default:
      throw `Invalid message type ${message.type} from ${peer}`;
  }
};

// Ham xu ly du lieu profile truoc khi tra ve
const profileInfoHandler = (peerNode) => {
  try {
    return {
      id: peerNode.id,
      chain: blockchainInfoHandler(peerNode, peerNode.blockchain.blockchain),
      balance: peerNode.getBalance(),
      unspentInputs: peerNode.getUnspentInputs(),
      unconfirmed_txs: peerNode.mempool.transactions.map((transaction) => ({
        from: peerNode.wallet.publicKey,
        to: transaction.outputs[0].address,
        amount: transaction.amount,
      })),
    };
  } catch (error) {
    console.log("[profileInfoHandler]", error);
  }
};

// Ham xu ly du lieu blockchain truoc khi tra ve
const blockchainInfoHandler = (peerNode, chain) => {
  try {
    const blocks = chain.map((block) => ({
      ...block,
      transactions: block.transactions.map((transaction) => {
        return {
          from: transaction.type == "reward" ? "🏆 REWARD" : "",
          to: transaction.outputs[0].address,
          status: peerNode.mempool.transactions.includes(transaction)
            ? "unspent"
            : "spent",
          amount: transaction.outputTotal,
        };
      }),
    }));
    return blocks;
  } catch (e) {
    console.log(e);
  }
  return [];
};

// Ham xu ly du lieu blockchain moi nhat => broadcast cho cac node xung quanh duoc biet
const handleReceivedBlockchain = (peerNode, peer, blockchain) => {
  const receivedBlockchain = Blockchain.fromJS(blockchain);
  try {
    peerNode.blockchain.blockchain = receivedBlockchain;
    broadcast(MessageCreator.sendLatestBlock(peerNode.blockchain.latestBlock));
  } catch (e) {
    throw e;
  }
};

// Ham xu ly du lieu block moi them => broadcast cho cac node xung quanh duoc biet
const handleReceivedLatestBlock = (peerNode, peer, block) => {
  const latestBlockReceived = Object.assign(Object.assign({}, block), {
    transactions: [block.transactions.map((tx) => Transaction.fromJS(tx))],
  }); // Result: {...block, transactions: [newTrasactions]}
  const latestBlockHeld = peerNode.blockchain.latestBlock;
  try {
    peerNode.blockchain.addBlock(latestBlockReceived);
    broadcast(MessageCreator.sendLatestBlock(latestBlockReceived));
  } catch (e) {
    throw e;
  } finally {
    sendMsg(peer, MessageCreator.getBlockchain());
  }
};

// Ham broadcast cho cac node xung quanh duoc biet
const broadcast = (data) => {
  connectedPeers.forEach((peer) => sendMsg(peer.socket, data));
};

// Ham xu ly khi peer nao do ngat ket noi
const handleClosedConnection = (peer) => {
  peer.on("disconnect", () => {
    console.log(`User: ${peer.id} was disconnected`);
    connectedPeers.splice(search(peer.id.toString(), connectedPeers), 1);
    broadcast(MessageCreator.getPeers(connectedPeers));
  });
};

// Ham tim index cua socket | Vi du : search((socket.id).toString(), this.connectedPeers);
const search = (nameKey, myArray) => {
  for (var i = 0; i < myArray.length; i++) {
    if (myArray[i].socket.id === nameKey) {
      return i;
    }
  }
};

module.exports = { startSocket };
