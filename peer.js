const _clone = require("lodash/cloneDeep");
const Exchange = require("peer-exchange");
const Blockchain = require("./blockchain");
const Node = require("./node");
const Transaction = require("./transaction");
const { MessageTypeEnum } = require("./messageType");
const MessageCreator = require("./messageCreator");

module.exports = class Peer extends Node {
  constructor() {
    super(...arguments);
    this.connectedPeers = [];
  }

  startSocket(io) {
    io.on("connection", (peer) => {
      // On connection of socket
      console.log("New user connected");
      console.log(peer.id);
      this.incomingConnection(peer);
    });
  }

  // Ham xu ly va lang nghe khi co node ket noi socket toi server
  incomingConnection(peer) {
    this.connectedPeers.push(peer);
    this.handleClosedConnection(peer);
    this.incomingMsgHandler(peer);
    this.peerErrorHandler(peer);
    // Yeu cau goi du lieu tai node len de dong bo
    this.sendMsg(peer, MessageCreator.getLatestBlock());
    this.sendMsg(peer, MessageCreator.getTransactions());
  }

  // Ham quang loi den server
  peerErrorHandler(peer) {
    peer.on("error", (e) => {});
  }

  // Ham goi msg den node (co the la goi 1 yeu cau hoac goi du lieu tra ve the yeu cau)
  sendMsg(peer, payload) {
    const payloadStr = JSON.stringify(payload); // to JSON
    console.log("send message");
    console.log([payloadStr]);
    peer.emit("data", payloadStr); // server to node
  }

  // Ham xu ly thong diep nhan duoc khi co node ket noi socket toi server
  incomingMsgHandler(peer) {
    peer.on("data", (message) => {
      // node to sever
      console.log(message);
      // const messageJS = JSON.parse(message.toString("utf8"));
      try {
        this.handleIncomingMsg(peer, message);
      } catch (e) {}
    });
  }

  // (Helper)
  handleIncomingMsg(peer, message) {
    // Ktra msg va co xu ly tuong ung
    switch (message.type) {
      case MessageTypeEnum.REQUEST_LATEST_BLOCK:
        const latestBlock = this.blockchain.latestBlock;
        // Phan hoi lai
        this.sendMsg(peer, MessageCreator.sendLatestBlock(latestBlock));
        break;
      case MessageTypeEnum.REQUEST_BLOCKCHAIN:
        const chain = this.blockchain.blockchain;
        this.sendMsg(peer, MessageCreator.sendBlockchain(chain));
        break;
      case MessageTypeEnum.RECEIVE_BLOCKCHAIN:
        this.handleReceivedBlockchain(peer, message.payload);
        break;
      case MessageTypeEnum.RECEIVE_LATEST_BLOCK:
        this.handleReceivedLatestBlock(peer, message.payload);
        break;
      case MessageTypeEnum.REQUEST_TRANSACTIONS:
        this.sendMsg(peer, MessageCreator.getTransactions()); //?
        break;
      case MessageTypeEnum.RECEIVE_TRANSACTIONS:
        const receivedTransactions = message.payload;
        receivedTransactions.forEach((transactionJS) => {
          const transaction = Transaction.fromJS(transactionJS);
          this.mempool.addTransaction(transaction);
        });
        break;
      case MessageTypeEnum.RECEIVE_LATEST_TRANSACTION:
        this.mempool.addTransaction(Transaction.fromJS(message.payload));
        break;
      case MessageTypeEnum.RECEIVE_REMOVE_TRANSACTION:
        this.mempool.removeTransaction(Transaction.fromJS(message.payload));
        break;
      default:
        throw `Invalid message type ${message.type} from ${peer}`;
    }
  }

  // Ham xu ly du lieu blockchain moi nhat => broadcast cho cac node xung quanh duoc biet
  handleReceivedBlockchain(peer, blockchain) {
    const receivedBlockchain = Blockchain.fromJS(blockchain);
    try {
      this.blockchain.blockchain = receivedBlockchain;
      this.broadcast(
        MessageCreator.sendLatestBlock(this.blockchain.latestBlock)
      );
    } catch (e) {
      throw e;
    }
  }

  // Ham xu ly du lieu block moi them => broadcast cho cac node xung quanh duoc biet
  handleReceivedLatestBlock(peer, block) {
    const latestBlockReceived = Object.assign(Object.assign({}, block), {
      transactions: [block.transactions.map((tx) => Transaction.fromJS(tx))],
    }); // Result: {...block, transactions: [newTrasactions]}
    const latestBlockHeld = this.blockchain.latestBlock;
    try {
      this.blockchain.addBlock(latestBlockReceived);
      this.broadcast(MessageCreator.sendLatestBlock(latestBlockReceived));
    } catch (e) {
      throw e;
    } finally {
      this.sendMsg(peer, MessageCreator.getBlockchain());
    }
  }

  // Ham broadcast cho cac node xung quanh duoc biet
  broadcast(data) {
    this.connectedPeers.forEach((peer) => this.sendMsg(peer, data));
  }

  // Ham xu ly khi peer nao do ngat ket noi
  handleClosedConnection(socket) {
    socket.on("disconnect", () => {
      console.log(`User: ${socket.id} was disconnected`);
      this.connectedPeers.splice(
        this.search(socket.id.toString(), this.connectedPeers),
        1
      );
    });
  }

  // Ham tim index cua socket | Vi du : search((socket.id).toString(), this.connectedPeers);
  search(nameKey, myArray) {
    for (var i = 0; i < myArray.length; i++) {
      if (myArray[i].id === nameKey) {
        return i;
      }
    }
  }

  // connectToPeer(host, port) {
  //   const socket = net.connect(port, host, () =>
  //     p2p.connect(socket, (err, peer) => {
  //       if (err) {
  //         throw err;
  //       } else {
  //         this.incomingConnection.call(this, peer);
  //       }
  //     })
  //   );
  // }

  // discoverPeers() {
  //   p2p.getNewPeer((err, peer) => {
  //     if (err) {
  //       throw err;
  //     } else {
  //       this.incomingConnection.call(this, peer);
  //     }
  //   });
  // }
};
