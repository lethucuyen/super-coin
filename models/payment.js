module.exports = class Payment {
  constructor(amount = 0, address = "", fee = 0) {
    this.amount = amount;
    this.address = address;
    this.fee = fee;
  }
};
