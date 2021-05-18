const Block = require("./block");
const CryptoJS = require("crypto-js");
// const BLOCK_GENERATION_INTERVAL = 10;
// const DIFFICULTY_ADJUSTMENT_INTERVAL = 2016;

module.exports = class Blockchain {
  constructor() {
    this.blockchain = [Block.getGenesisBlock];
    // this.difficulty = 4;
  }

  get() {
    return this.blockchain;
  }

  set(chain) {
    try {
      this.shouldReplaceChain(chain);
    } catch (e) {
      throw e;
    }
  }

  // Ham GET lay ra block cuoi cung
  get latestBlock() {
    return this.blockchain[this.blockchain.length - 1];
  }

  // Ham tinh toan difficulty dua tren index cua chinh no
  getDifficulty(index) {
    return Math.round(index / 50) + 3;
  }
  // getDifficulty(aBlockchain) {
  //   const lastestBlock = aBlockchain[aBlockchain.length - 1]
  //   if (lastestBlock.index % DIFFICULTY_ADJUSTMENT_INTERVAL === 0 && lastestBlock.index !== 0) {
  //     // dieu chinh do kho
  //     return getAdjustedDifficulty(lastestBlock, aBlockchain)
  //   } else {
  //     // mac dinh
  //     return lastestBlock.index;
  //   }
  // }

  // Ham tinh toan hash dua tren du lieu cua chinh no
  calculateHash(index, previousHash, timestamp, transactions, nonce) {
    return CryptoJS.SHA256(
      index + previousHash + timestamp + JSON.stringify(transactions) + nonce
    ).toString();
  }

  // Ham tinh toan hash voi input co dang block
  calculateHashForBlock(block) {
    return this.calculateHash(
      block.index,
      block.previousHash,
      block.timestamp,
      block.transactions,
      block.nonce
    );
  }

  // Ham tao ra block moi dua tren thong tin cua block cuoi cung
  generateNextBlock(transactions) {
    const previousBlock = this.latestBlock;
    const nextIndex = previousBlock.index + 1;
    const nextTimestamp = new Date().getTime() / 1000;
    let nonce = 0;
    let nextHash = "";
    // hashcash proof-of-work: loop until nonce yields hash that passes difficulty.
    while (!this.hashMatchesDifficulty(nextHash, nextIndex)) {
      nonce = nonce + 1;
      nextHash = this.calculateHash(
        nextIndex,
        previousBlock.hash,
        nextTimestamp,
        transactions,
        nonce
      );
    }
    const nextBlock = new Block(
      nextIndex,
      previousBlock.hash,
      nextTimestamp,
      transactions,
      nextHash,
      nonce
    );
    console.log([nextBlock]);
    return nextBlock;
  }

  // Ham ktra 1 gia tri hash co du do kho hay khong
  hashMatchesDifficulty(hash, index) {
    // const hashInBinary = hexToBinary(hash);
    // cons requiredPrefix = "0".repeat(this.getDifficutt(index));
    // // ktra co bat dau bang n so 0 hay khong
    // return hashInBinary.startWith(requiredPrefix);
    for (var i = 0, b = hash.length; i < b; i++) {
      if (hash[i] !== "0") {
        break;
      }
    }
    return i >= this.getDifficulty(index);
  }

  // Ham ktra tinh toan ven cua 1 block
  isValidNewBlock(newBlock, previousBlock) {
    const blockHash = this.calculateHashForBlock(newBlock);

    if (previousBlock.index + 1 !== newBlock.index) {
      console.log("New block has invalid index");
      return false;
    } else if (previousBlock.hash !== newBlock.previousHash) {
      console.log("New block has invalid previous hash");
      return false;
    } else if (blockHash !== newBlock.hash) {
      console.log(`Invalid hash: ${blockHash} ${newBlock.hash}`);
      return false;
    } else if (
      !this.hashMatchesDifficulty(
        this.calculateHashForBlock(newBlock),
        newBlock.index
      )
    ) {
      console.log(
        `Invalid hash does not meet difficulty requirements: ${this.calculateHashForBlock(
          newBlock
        )}`
      );
      return false;
    }
    return true;
  }

  // Ham ktra khi 1 nut (node) gap 1 khoi co chi so lon hon khoi hien tai
  // => thay the phuc vu viec dong bo giua cac node voi nhau
  shouldReplaceChain(newBlocks) {
    if (!this.isValidChain(newBlocks)) {
      console.log(
        "Replacement chain is not valid. Won't replace existing blockchain."
      );
      return null;
    }

    if (newBlocks.length <= this.blockchain.length) {
      console.log(
        "Replacement chain is shorter than original. Won't replace existing blockchain."
      );
      return null;
    }

    if (!this.isEqualGenesis(newBlocks)) {
      console.log(
        `Genesis ${blockchainToValidate[0]} is different from current genesis ${this.blockchain[0]}`
      );
      return null;
    }

    console.log(
      "Received blockchain is valid. Replacing current blockchain with received blockchain"
    );
    this.blockchain = newBlocks.map(
      (json) =>
        new Block(
          json.index,
          json.previousHash,
          json.timestamp,
          json.transactions,
          json.hash,
          json.nonce
        )
    );
  }

  // Ham ktra 2 khoi co tuong dong ve block dau tien hay khong
  isEqualGenesis(blockchainToValidate) {
    if (
      JSON.stringify(blockchainToValidate[0]) !==
      JSON.stringify(this.blockchain[0])
    ) {
      console.log(
        `Genesis ${blockchainToValidate[0]} is different from current genesis ${this.blockchain[0]}`
      );
      return false;
    }
    return true;
  }

  // Ham ktra toan bo blockchain co hop le hay khong
  isValidChain(blockchainToValidate) {
    // Ktra block dau tien
    if (
      JSON.stringify(blockchainToValidate[0]) !== JSON.stringify(Block.genesis)
    ) {
      return false;
    }

    // Ktra nhung block con lai
    const tempBlocks = [blockchainToValidate[0]];
    // tempBlocks = [a[0]] => 1 phan tu dau tien
    for (let i = 1; i < blockchainToValidate.length; i = i + 1) {
      if (this.isValidNewBlock(blockchainToValidate[i], tempBlocks[i - 1])) {
        tempBlocks.push(blockchainToValidate[i]);
      } else {
        return false;
      }
      // So sanh tung cap: a[1] voi a[0] => tempBlocks.push[1], ..v.v cho den het
    }
    return true;
  }

  // Ham dao 1 block da tim duoc
  mine(seed) {
    const newBlock = this.generateNextBlock(seed);
    if (this.addBlock(newBlock)) {
      console.log("Congratulations! A new block was mined.");
    }
  }

  // Them 1 block vao mang luoi
  addBlock(newBlock) {
    if (this.isValidNewBlock(newBlock, this.latestBlock)) {
      this.blockchain.push(newBlock);
      return true;
    }
    return false;
  }

  testNotAllowedAction(index, newData) {
    let tempBlocks = [];

    for (let i = 0; i < this.blockchain.length; i++) {
      if (this.blockchain[i].index === parseInt(index)) {
        console.log(true);
        let newBlock = { ...this.blockchain[i], data: newData };
        tempBlocks.push(newBlock);
      } else {
        tempBlocks.push(this.blockchain[i]);
      }
    }

    console.log(tempBlocks);

    return this.isValidChain(tempBlocks);
  }
};
