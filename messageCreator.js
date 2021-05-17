// Peer-to-peer Helper
const { MessageTypeEnum } = require("./messageType");
const Wallet = require("./wallet");

module.exports = class MessageCreator {
  static sendWallet(wallet = new Wallet(), password) {
    return {
      type: MessageTypeEnum.REQUEST_NEW_WALLET,
      payload: {
        yourAddress: wallet.publicKey,
        privateKey: wallet.getPrivateKey(password),
      },
      password: password,
    };
  }

  static getProfile(profile) {
    return {
      type: MessageTypeEnum.REQUEST_PROFILE,
      payload: profile,
    };
  }

  static getLatestBlock() {
    return {
      type: MessageTypeEnum.REQUEST_LATEST_BLOCK,
    };
  }

  static sendLatestBlock(block) {
    return {
      type: MessageTypeEnum.RECEIVE_LATEST_BLOCK,
      payload: block,
    };
  }

  static getBlockchain() {
    return {
      type: MessageTypeEnum.REQUEST_BLOCKCHAIN,
    };
  }

  static sendBlockchain(blockchain) {
    return {
      type: MessageTypeEnum.RECEIVE_BLOCKCHAIN,
      payload: blockchain,
    };
  }

  static getTransactions() {
    return {
      type: MessageTypeEnum.REQUEST_TRANSACTIONS,
    };
  }

  static sendTransactions(transactions) {
    return {
      type: MessageTypeEnum.RECEIVE_TRANSACTIONS,
      payload: transactions,
    };
  }

  static sendLatestTransaction(transaction) {
    return {
      type: MessageTypeEnum.RECEIVE_LATEST_TRANSACTION,
      payload: transaction,
    };
  }

  static sendRemovedTransaction(transaction) {
    return {
      type: MessageTypeEnum.RECEIVE_REMOVE_TRANSACTION,
      payload: transaction,
    };
  }
};
