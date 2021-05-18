import BaseService from "../core/common/BaseService";

export default {
  /* <LOGIN> */

  verifyLogin(data) {
    return BaseService.post("/users/login", data, {});
  },

  verifyFacebookLogin(data) {
    return BaseService.get("/users/verify-facebook-login", data);
  },

  verifyGoogleLogin(data) {
    return BaseService.get("/users/verify-google-login", data);
  },

  /* </LOGIN> */

  /* <FORGOT PASSWORD> */

  changePassword(data) {
    return BaseService.post("/users/change-password", data, {});
  },

  checkExistEmail(data) {
    return BaseService.post("/users/check-exist-email", data, {});
  },

  resetPassword(data) {
    return BaseService.post("/users/reset-password", data, {});
  },

  requestVerificationCode(data) {
    return BaseService.post("/users/reset-password/request", data, {});
  },

  verifyCode(data) {
    return BaseService.post("/users/reset-password/verify", data, {});
  },

  /* </FORGOT PASSWORD> */

  /* <REGISTER USER> */

  registerLogin(data) {
    return BaseService.post("/users/register", data, {});
  },

  activateAccount(token) {
    return BaseService.get(`/users/activation/${token}`, {});
  }

  /* </REGISTER USER> */
};
