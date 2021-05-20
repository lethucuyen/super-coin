module.exports = class Block {
  constructor(
    index = 0,
    previousHash = "0",
    timestamp = new Date().getTime() / 1000,
    transactions = [],
    hash = "",
    nonce = 0
  ) {
    this.index = index;
    this.previousHash = previousHash.toString();
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.hash = hash.toString();
    this.nonce = nonce;
    this.createdDate = new Date();
  }

  static get getGenesisBlock() {
    return new Block(
      0,
      "0",
      1465154705,
      [],
      "0000018035a828da0878ae92ab6fbb16be1ca87a02a3feaa9e3c2b6871931046",
      56551
    );
  }

  getDetails() {
    return {
      index: this.index,
      previousHash: this.previousHash,
      timestamp: this.timestamp,
      transactions: this.transactions.map((tx) => tx.getDetails()),
      hash: this.hash,
      nonce: this.nonce,
      createdDate: this.createdDate,
    };
  }
};
