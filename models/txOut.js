module.exports = class TxOut {
  constructor(address = "", amount = 0) {
    this.address = address; // dia chi cua nguoi nhan duoc coin (chinh la 'public key')
    this.amount = amount; // so tien
  }
};
