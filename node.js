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
      const nextBlock = this.blockchain.generateNextBlock(txs);

      try {
        this.blockchain.addBlock(nextBlock);
      } catch (e) {
        throw e;
      }
    }
  }

  // Ham lay ra so du cua 1 tai khoan dua vao 'public key'
  getBalance(address = this.wallet.publicKey) {
    const inputs = this.getUnspentInputs();
    // console.log(inputs);
    const inputsForAddress = inputs.filter(
      (input) => input.address === address
    );
    return inputsForAddress.reduce((total, input) => total + input.amount, 0);
  }

  // Ham tao 1 giao dich moi
  createTransaction(payments, password) {
    const paidTotal = payments.reduce((total, paid) => total + paid.amount, 0);
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
      // console.log(changeOutput);
      outputs.push(changeOutput);
      // console.log(outputs);
    }
    try {
      inputs = this.signInputs(inputs, password);
      const from = this.wallet.publicKey;
      const to = payments[0].address;
      return new Transaction("regular", inputs, outputs, from, to);
    } catch (err) {
      throw `Failed to create transactions: ${err}`;
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
  getUnspentInputs(address = this.wallet.publicKey) {
    let inputs = this.getInputs(address);
    let outputs = this.getOutputs(address);

    const isIncludes = (array, item) => {
      for (let i = 0; i < array.length; i++) {
        if (
          array[i].txHash == item.txHash &&
          array[i].txIndex == item.txIndex &&
          array[i].amount == item.amount &&
          array[i].address == item.address
        ) {
          return true;
        }
      }
      return false;
    };

    // remove signature to compare
    const _inputs = inputs.map((input) => ({
      txHash: input.txHash,
      txIndex: input.txIndex,
      amount: input.amount,
      address: input.address,
    }));

    const unspentOutputs = outputs.filter(
      (output) => !isIncludes(_inputs, output)
    );

    return unspentOutputs;
  }

  // (helper)
  getInputs(address = this.wallet.publicKey) {
    let inputs = [];
    this.blockchain.blockchain.forEach((block) => {
      block.transactions.forEach((transaction) => {
        transaction.inputs.forEach((input) => {
          if (input.address === address) {
            inputs.push(input);
          }
        });
      });
    });
    return inputs;
  }

  // (helper)
  getOutputs(address = this.wallet.publicKey) {
    let outputs = [];
    // this.blockchain.blockchain.forEach((block) => {
    //   block.transactions.forEach((tx, i) => {
    //     tx.outputs.forEach((output) => {
    //       console.log(output);
    //     });
    //   });
    // });
    this.blockchain.blockchain.forEach((block) => {
      block.transactions.forEach((tx, i) => {
        tx.outputs.forEach((output) => {
          if (output.address === address) {
            let input = new TxIn(i, tx.hash, output.amount, output.address);
            outputs.push(input);
            // console.log(input);
          }
        });
      });
    });
    return outputs;
  }

  getFeeTransaction(regTxs, address) {
    const totalFee = regTxs.reduce((total, transaction) => {
      return total + transaction.fee;
    }, 0);
    // console.log("total fee:", totalFee);
    if (totalFee > 0) {
      const outputs = [{ address, amount: totalFee }];
      const from = this.wallet.publicKey;
      const to = address;
      return new Transaction("fee", [], outputs, from, to);
    } else {
      throw "No fees in Transaction.";
    }
  }

  rewardTransaction(address) {
    const outputs = [{ address, amount: this.reward }];
    const from = "REWARD";
    const to = address;
    return new Transaction("reward", [], outputs, from, to);
  }
};
