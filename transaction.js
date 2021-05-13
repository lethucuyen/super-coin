const CryptoJS = require("crypto-js");
const TxIn = require("./txIn");
const TxOut = require("./txOut");

module.exports = class Transaction {
  constructor(type = "", inputs = [], outputs = []) {
    this.type = type; // type: "regular" | "fee" | "reward"
    this.inputs = inputs; // tro toi dia chi ma no chua xai tien toi ('unspent')
    this.outputs = outputs; // nguoi nhan va so tien
    this.reward = 100;
  }

  // Ham GET tinh toan hash dua tren du lieu cua chinh no
  get hash() {
    const inputs = JSON.stringify(this.inputs);
    const outputs = JSON.stringify(this.outputs);

    return CryptoJS.SHA256(this.type + inputs + outputs).toString();
  }

  // Ham GET lay ra so du cua tai khoan (funds)
  get inputTotal() {
    return this.inputs.reduce((total, input) => total + input.amount, 0);
  }

  // Ham GET lay ra so tien muon goi di (amount/fee)
  get outputTotal() {
    return this.outputs.reduce((total, output) => total + output.amount, 0);
  }

  // Ham GET lay ra phi giao dich neu co (chuyen hoa hong hay phan thuong thi khong co phi nay)
  get fee() {
    if (this.type === "regular") {
      return this.inputTotal - this.outputTotal;
    } else {
      throw `Transaction type ${this.type} does not have fees`;
    }
  }

  // Ham kiem tra tinh toan ven cua 1 transaction
  isValidTransaction() {
    try {
      // Du so du TK de goi
      this.isInputsMoreThanOutputs();
      // Chu ky hop le
      this.verifyInputSignatures();
      return true;
    } catch (err) {
      throw err;
    }
  }

  // Ham ktra co du so du de thuc hien giao dich hay khong
  isInputsMoreThanOutputs() {
    const inputTotal = this.inputTotal;
    const outputTotal = this.outputTotal;
    if (inputTotal < outputTotal) {
      throw `Insufficient balance: inputs ${inputTotal} < outputs ${outputTotal}`;
    }
  }

  // Ham xac nhan chu ky cho cac giao dich hop le hay khong
  verifyInputSignatures() {
    try {
      this.inputs.forEach((input) => {
        TxIn.verifySignature(input);
      });
    } catch (err) {
      throw err;
    }
  }

  // Ham ktra input bi trung lap
  hasSameInput(tx) {
    return tx.inputs.some((input) => this.inputs.some((i) => i.equals(input)));
  }

  // Ham ktra 2 transaction bang nhau
  equals(tx) {
    return (
      this.type === tx.type &&
      this.inputs.equals(tx.inputs) &&
      this.outputs.equals(tx.outputs) &&
      this.hash === tx.hash
    );
  }

  // Ham lay ra hash code tu gia tri hash (~ hexToBonary(hex))
  hashCode() {
    return parseInt(String(parseInt(this.hash, 10)), 32);
  }

  // Ham chi tra phi giao dich(hoa hong) cho miner
  feeTransaction(address) {
    const inputTotal = this.inputTotal;
    const outputTotal = this.outputTotal;
    if (inputTotal > outputTotal) {
      const fee = inputTotal - outputTotal;
      const outputs = [{ address, amount: fee }];
      return new Transaction("fee", [], outputs);
    } else {
      throw `No fees for transaction`;
    }
  }

  // Ham chi tra phan thuong cho miner
  static rewardTransaction(address) {
    const outputs = [{ address, amount: this.reward }];
    return new Transaction("reward", [], outputs);
  }

  // Ham lay ra gia tri dang object tu json
  static fromJS(json) {
    const inputs = [json.inputs.map((input) => TxIn.fromJS(input))];
    const outputs = [json.outputs];
    return new Transaction(json.type, inputs, outputs);
  }
};
