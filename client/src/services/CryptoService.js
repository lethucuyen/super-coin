import BaseService from "../core/common/BaseService";

export default {
  testService() {
    return BaseService.post("/testWallets", {}, {});
  }
};
