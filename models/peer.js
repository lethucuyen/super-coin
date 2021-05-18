const _clone = require("lodash/cloneDeep");
const faker = require("faker");
const Exchange = require("peer-exchange");
const Blockchain = require("./blockchain");
const Node = require("./node");
const Wallet = require("./wallet");
const Transaction = require("./transaction");
const { MessageTypeEnum } = require("./messageType");
const MessageCreator = require("./messageCreator");

module.exports = class Peer extends Node {
  constructor() {
    console.log("new peer");
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
    console.log("push a new connected peer");
    this.connectedPeers.push(peer);
    console.log(this.connectedPeers.length);
    this.handleClosedConnection(peer);
    this.incomingMsgHandler(peer);
    this.peerErrorHandler(peer);
    // Yeu cau node lay du lieu ve (Bug: Web chua khoi tao socket => ko can thiet do da lay profile thay the)
    // setTimeout(function () {
    //   this.sendMsg(peer, MessageCreator.getLatestBlock());
    //   this.sendMsg(peer, MessageCreator.getTransactions());
    // }, 7000);
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
    console.log("this peer is listening incoming message..");
    peer.on("data", (message) => {
      // node to sever
      const messageJS = JSON.parse(message || {});
      console.log("incoming message -->", messageJS.type);
      try {
        this.handleIncomingMsg(peer, messageJS);
      } catch (e) {
        console.log("[INCOMING_MSG_HANDLER]", e);
      }
    });
  }

  // (Helper)
  handleIncomingMsg(peer, message) {
    // Ktra msg va co xu ly tuong ung
    switch (message.type) {
      case MessageTypeEnum.REQUEST_NEW_WALLET:
        console.log([message.payload]);
        console.log("create a new wallet with password");
        const wallet = new Wallet(message.payload.password);
        this.sendMsg(
          peer,
          MessageCreator.sendWallet(wallet, message.payload.password)
        );
        break;
      case MessageTypeEnum.REQUEST_PEERS:
        console.log("todo something");
        break;
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
      case MessageTypeEnum.REQUEST_PROFILE:
        this.sendMsg(
          peer,
          MessageCreator.getProfile(this.profileInfoHandler())
        );
        break;
      case MessageTypeEnum.MINE_NEW_BLOCK:
        if (!message.payload.transaction) {
          // Nap 100 coin moi lan vao tai khoan lam von
          const txs = [this.rewardTransaction(this.wallet.publicKey)];
          this.blockchain.mine(txs);
        } else {
        }

        this.sendMsg(
          peer,
          MessageCreator.getProfile(this.profileInfoHandler())
        );
        break;
      default:
        throw `Invalid message type ${message.type} from ${peer}`;
    }
  }

  profileInfoHandler() {
    try {
      console.log(this.wallet.name);
    } catch (error) {
      console.log(error);
    }
    return {
      name: this.wallet.name,
      address: this.wallet.publicKey,
      chain: this.blockchainInfoHandler(this.blockchain.blockchain),
      balance: this.getBalance(this.wallet.publicKey),
      unconfirmed_txs: this.mempool.transactions.map((transaction) => ({
        from: this.wallet.publicKey,
        to: transaction.outputs[0].address,
        amount: transaction.amount,
      })),
    };
  }

  // Ham xu ly du lieu blockchain truoc khi tra ve
  blockchainInfoHandler(chain) {
    try {
      const blocks = chain.map((block) => ({
        ...block,
        transactions: block.transactions.map((transaction) => {
          console.log(transaction);
          console.log(this.mempool.transactions.includes(transaction));
          return {
            from: transaction.type == "reward" ? "🏆 REWARD" : "",
            to: transaction.outputs[0].address,
            status: this.mempool.transactions.includes(transaction)
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
  handleClosedConnection(peer) {
    peer.on("disconnect", () => {
      console.log(`User: ${peer.id} was disconnected`);
      this.connectedPeers.splice(
        this.search(peer.id.toString(), this.connectedPeers),
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

  // Ham quang loi den server
  peerErrorHandler(peer) {
    peer.on("error", (e) => {});
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
