const EC = require("elliptic").ec;
const ec = new EC("secp256k1");

module.exports = class Wallet {
  constructor(password = "") {
    this.keyPair = ec.genKeyPair();
    this.password = password;
  }

  // Ham GET lay ra 'public key'
  get publicKey() {
    return this.keyPair.getPublic("hex");
  }

  // Ham lay ra 'private key'
  getPrivateKey(password) {
    if (password === this.password) {
      return this.keyPair.getPrivate("hex");
    } else {
      throw `Incorrect wallet password`;
    }
  }
};
