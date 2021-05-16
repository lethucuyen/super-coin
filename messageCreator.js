// Peer-to-peer Helper
const { MessageTypeEnum } = require("./messageType");

module.exports = class MessageCreator {
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
