const CryptoJS = require("crypto-js");
const EC = require("elliptic").ec;
const ec = new EC("secp256k1");

module.exports = class TxIn {
  constructor(
    txHash = "",
    txIndex = 0,
    amount = 0,
    address = "",
    signature = ""
  ) {
    this.txHash = txHash; // tro toi id(hash du lieu) va index cua unspent transaction output
    this.txIndex = txIndex;
    this.amount = amount;
    this.address = address;
    if (signature) this._signature = signature; // chung thuc (duoc ky bang 'private key')
  }

  getDetails() {
    return {
      txHash: this.txHash,
      txIndex: this.txIndex,
      amount: this.amount,
      address: this.address,
    };
  }

  // Ham lay chu ky cho giao dich
  get signature() {
    return this._signature;
  }

  // Ham GET tinh toan hash dua tren du lieu cua chinh no
  get hash() {
    return CryptoJS.SHA256(
      this.txHash + this.txIndex + this.amount + this.address
    ).toString(); // Is Hex String
  }

  // Ham dinh danh chu ky cho 1 giao dich
  sign(secretKey) {
    const key = ec.keyFromPrivate(secretKey);
    const signature = key.sign(this.hash);
    this._signature = signature.toDER();
  }

  // Ham kiem tra chu ky co hop le hay khong
  static verifySignature(input) {
    const inputHash = CryptoJS.SHA256(
      input.txHash + input.txIndex + input.amount + input.address
    ).toString();
    const key = ec.keyFromPublic(input.address, "hex");
    if (!key.verify(inputHash, input.signature)) {
      throw `Input ${input} has wrong signature.`;
    }
  }

  // Ham so sanh bang giua cac transaction
  equals(input) {
    return (
      this.txIndex === input.txIndex &&
      this.txHash === input.txHash &&
      this.amount === input.amount &&
      this.address === input.address
    );
  }

  // Ham lay ra hash code tu gia tri hash (~ hexToBinary(hex))
  hashCode(input) {
    return parseInt(String(parseInt(this.hash, 10)), 32);
  }

  // Ham lay ra gia tri dang object tu json
  static fromJS(json) {
    const { txIndex, txHash, amount, address, _signature } = json;
    const input = new Input(txIndex, txHash, amount, address, _signature);
    return input;
  }
};
