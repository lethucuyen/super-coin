const _clone = require("lodash/cloneDeep");
const Exchange = require("peer-exchange");
const Blockchain = require("./blockchain");
const Node = require("./node");
const Transaction = require("./transaction");
const { MessageTypeEnum } = require("./messageType");
const MessageCreator = require("./messageCreator");
const faker = require("faker");
const { v4 } = require("uuid");
// const { startSocket, getPeers, broadcast } = require("./peers.js");
const peers = require("./peers");

module.exports = class Peer extends Node {
  constructor() {
    super(...arguments);
    // this.connectedPeers = [];
  }
};
