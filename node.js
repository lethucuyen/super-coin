const Blockchain = require("./blockchain");
const MemPool = require("./memPool");
const Wallet = require("./wallet");
const TxIn = require("./txIn");
const Transaction = require("./transaction");
const _clone = require("lodash/clone");

module.exports = class Node {
  constructor(
    blockchain = new Blockchain(),
    mempool = new MemPool(),
    wallet = new Wallet()
  ) {
    this.blockchain = blockchain;
    this.mempool = mempool;
    this.wallet = wallet;
    this.reward = 100;
  }

  newWallet(password) {
    this.wallet = new Wallet(password);
    // console.log([this.wallet]);
  }

  mine(address = this.wallet.publicKey) {
    try {
      // Lay ra cac transaction cho block nay va clear trong hang cho de dao
      const regTxs = this.mempool.getTransactionsForBlock();
      // Chi tra phan thuong cho miner
      const rewardTx = this.rewardTransaction(address);
      regTxs.push(rewardTx);
      let txs = _clone(regTxs);
      try {
        const feeTx = this.getFeeTransaction(regTxs, address);
        txs.push(feeTx); // co nen tinh vao gioi han kich thuoc 1 block => ?
      } catch (e) {
        // log error but not fatal ?
      } finally {
        console.log(txs);
        const nextBlock = this.blockchain.generateNextBlock(txs);
        try {
          this.blockchain.addBlock(nextBlock);
        } catch (e) {
          throw e;
        }
      }
    } catch (error) {
      throw `Failed to mine: ${error}`;
    }
  }

  // Ham lay ra so du cua 1 tai khoan dua vao 'public key'
  getBalance(address = this.wallet.publicKey) {
    try {
      const inputs = this.getUnspentInputs();
      const inputsForAddress = inputs.filter(
        (input) => input.address === address
      );
      return inputsForAddress.reduce((total, input) => total + input.amount, 0);
    } catch (error) {
     console.log("[GET_BALANCE]", error);
    }
  }

  // Ham tao 1 giao dich moi
  createTransaction(payments, password) {
    try {
      const paidTotal = payments.reduce(
        (total, paid) => total + paid.amount,
        0
      );
      const fee = payments.reduce((total, payment) => total + payment.fee, 0);
      const unspentInputs = this.getUnspentInputs();
      let inputTotal = 0;
      let inputs = [];
      for (let i = 0; i < unspentInputs.length; i++) {
        const output = unspentInputs[i];
        let enoughMoney = true;
        // ktra so du < so tien muon goi va phi giao dich => khong du tien
        if (inputTotal < paidTotal + fee) {
          inputTotal = inputTotal + output.amount;
          enoughMoney = false;
        }
        if (enoughMoney) break;

        inputs.push(output);
      }
      let outputs = payments.map((payment) => ({
        amount: payment.amount,
        address: payment.address,
      }));

      let change = inputTotal - paidTotal - fee;
      if (change > 0) {
        const changeOutput = { amount: change, address: this.wallet.publicKey };
        outputs.push(changeOutput);
      }
      try {
        inputs = this.signInputs(inputs, password);
        return new Transaction("regular", inputs, outputs);
      } catch (err) {
        throw `Failed to create transactions: ${err}`;
      }
    } catch (error) {
      throw `Failed to create transactions: ${error}`;
    }
  }

  signInputs(inputs, password) {
    try {
      const privateKey = this.wallet.getPrivateKey(password);
      return inputs.map((input) => {
        input.sign(privateKey);
        return input;
      });
    } catch (err) {
      throw `Error signing inputs ${inputs}: ${err}`;
    }
  }

  // (helper) Lay ra cac 'unspent tracsaction output' (funds) ma no chua xai toi (cua no)
  getUnspentInputs() {
    try {
      let inputs = this.getInputs();
      let outputs = this.getOutputs();

      const unspentOutputs = outputs.filter(
        (output) => !inputs.includes(output)
      );
      return unspentOutputs;
    } catch (error) {
      console.log("[GET_UNSPENT_INPUTS]", error);
    }
    return [];
  }

  // (helper)
  getInputs() {
    let inputs = [];
    try {
      this.blockchain.blockchain.forEach((block) => {
        block.transactions.forEach((transaction) => {
          transaction.inputs.forEach((input) => {
            if (input.address === this.wallet.publicKey) {
              inputs.push(input);
            }
          });
        });
      });
    } catch (error) {
      console.log("[GET_INPUTS]", error);
    }
    return inputs;
  }

  // (helper)
  getOutputs() {
    let outputs = [];
    try {
      this.blockchain.blockchain.forEach((block) => {
        block.transactions.forEach((tx, i) => {
          tx.outputs.forEach((output) => {
            if (output.address === this.wallet.publicKey) {
              let input = new TxIn(i, tx.hash, output.amount, output.address);
              outputs.push(input);
            }
          });
        });
      });
    } catch (error) {
      console.log("[GET_OUTPUTS]", error);
    }
    return outputs;
  }

  getFeeTransaction(regTxs, address) {
    try {
      const totalFee = regTxs.reduce((total, transaction) => {
        return total + transaction.fee;
      }, 0);
      console.log("totalFee:", totalFee);
      if (totalFee > 0) {
        const outputs = [{ address, amount: totalFee }];
        return new Transaction("fee", [], outputs);
      } else {
        throw "No fees in Transaction.";
      }
    } catch (error) {
      console.log("[GET_FEE_TRANSACTION]", error);
    }
    return null;
  }

  rewardTransaction(address) {
    try {
      const outputs = [{ address, amount: this.reward }];
      return new Transaction("reward", [], outputs);
    } catch (error) {
      console.log("[REWARD_TRANSACTION]", error);
    }
    return null;
  }
};
