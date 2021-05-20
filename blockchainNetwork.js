const _clone = require("lodash/cloneDeep");
const Blockchain = require("./blockchain");
const MemPool = require("./mempool");

module.exports = class BlockchainNetWork {
  constructor(blocks, io) {
    this.blocks = blocks || new Blockchain();
    this.mempool = new MemPool();
    this.nodes = [];
    this.peers = [];
    this.io = io;
  }

  addPeer(peer = null, blockChain = new BlockchainNetWork()) {
    blockChain.peers.push(peer);
  }

  addNode(node = null, blockChain = new BlockchainNetWork()) {
    blockChain.nodes.push(node);
  }

  getBlocks() {
    return this.blocks.blockchain.map((block) => block.getDetails());
  }

  getNodes() {
    return this.nodes.map((node) => ({
      address: node.wallet.publicKey,
      balance: node.getBalance(),
    }));
  }

  getPeers() {
    return this.peers;
  }

  uploadMempool(fromNode) {
    this.mempool = fromNode.mempool;
    this.nodes.forEach((node) => {
      if (node.wallet.publicKey !== fromNode.wallet.publicKey)
        node.mempool = _clone(fromNode.mempool);
    });
    return this.mempool;
  }

  uploadBlocks(fromNode) {
    this.blocks = fromNode.blockchain;
    this.nodes.forEach((node) => {
      if (node.wallet.publicKey !== fromNode.wallet.publicKey)
        node.blockchain = _clone(fromNode.blockchain);
    });
    return this.blocks;
  }
};
