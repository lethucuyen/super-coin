module.exports = class MemPool {
  constructor(transactions = [], blockSize = 5) {
    this.transactions = transactions;
    this.blockSize = blockSize;
  }

  // Ham tao 1 transaction
  addTransaction(transaction) {
    try {
      // La transaction hop le
      transaction.isValidTransaction();
      // Khong bi trung lap spent (funds)
      this.isTransactionDoubleSpent(transaction);
      console.log([transaction]);
      this.transactions = this.transactions.push(transaction);
    } catch (err) {
      throw err;
    }
  }

  //  Ham ktra 1 transaction co bi trung lap spent (funds) hay khong
  isTransactionDoubleSpent(transaction) {
    if (this.transactions.length !== 0) {
      const isDoubleSpent = this.transactions.some((tx) =>
        tx.hasSameInput(transaction)
      );
      if (isDoubleSpent) {
        throw `Transaction ${transaction} is double spent.`;
      }
    }
  }

  // Ham lay cac transaction de dien vao 1 block
  getTransactionsForBlock() {
    // Lay ra so luong transaction vua du 1 block
    const transactionsForBlock = this.transactions.slice(0, this.blockSize);
    // Clear khoi danh sach transaction trong hang cho de dao
    this.clearTransactions(transactionsForBlock);
    return transactionsForBlock;
  }

  // Ham clear cac transaction
  clearTransactions(transactionsToClear) {
    this.transactions = this.transactions.filter(
      (n) => !transactionsToClear.includes(n)
    );
  }

  // Ham loai bo 1 transaction nao do kho danh sach cac transaction trong hang cho de dao
  removeTransaction(transaction) {
    this.transactions = this.transactions.filter(
      (tx) => !tx.equals(transaction)
    );
  }

  toString() {
    return JSON.stringify(this.transactions, null, 2);
  }
};
