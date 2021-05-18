import * as RequestFactory from "./RequestFactory";

export default {
  get(url, params) {
    return RequestFactory.get({ url, params });
  },

  post(url, data, params) {
    return RequestFactory.post({ url, data, params });
  },

  postFile(url, data, params) {
    return RequestFactory.postFile({ url, data, params });
  }
};
