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
      this.transactions.push(transaction);
    } catch (err) {
      throw `Failed to add transaction: ${err}`;
    }
  }

  //  Ham ktra truong hop chi tiêu cho một giao dịch đã chi tiêu trước đó
  // (Đầu ra đã chi tiêu không thể được sử dụng lại làm đầu vào trong một giao dịch khác.)
  isTransactionDoubleSpent(transaction) {
    try {
      if (this.transactions.length !== 0) {
        const isDoubleSpent = this.transactions.some((tx) =>
          tx.hasSameInput(transaction)
        );
        if (isDoubleSpent) {
          throw `Transaction ${transaction} is double spent.`;
        }
      }
    } catch (error) {
      console.log("[CHECK_TRANSACTION_DOUBLE_SPENT]", error);
    }
  }

  // Ham lay cac transaction de dien vao 1 block
  getTransactionsForBlock() {
    try {
      // Lay ra so luong transaction vua du 1 block
      const transactionsForBlock = this.transactions.slice(0, this.blockSize);
      // Clear khoi danh sach transaction trong hang cho de dao
      this.clearTransactions(transactionsForBlock);
      return transactionsForBlock;
    } catch (error) {
      console.log("[GET_TRANSACTIONS_FOR_BLOCK]", error);
    }
    return [];
  }

  // Ham clear cac transaction
  clearTransactions(transactionsToClear) {
    try {
      this.transactions = this.transactions.filter(
        (n) => !transactionsToClear.includes(n)
      );
    } catch (error) {
      console.log("[CLEAR_TRANSACTIONS]", error);
    }
  }

  // Ham loai bo 1 transaction nao do kho danh sach cac transaction trong hang cho de dao
  removeTransaction(transaction) {
    try {
      this.transactions = this.transactions.filter(
        (tx) => !tx.equals(transaction)
      );
    } catch (error) {
      console.log("[REMOVE_TRANSACTION]", error);
    }
  }

  toString() {
    return JSON.stringify(this.transactions, null, 2);
  }
};
