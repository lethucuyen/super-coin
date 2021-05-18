import io from "socket.io-client";

const ENDPOINT = process.env.VUE_APP_ENV_API_URL;

export default {
  install(Vue) {
    Vue.prototype.$socket = socket;
  }
};

const socket = io(ENDPOINT, {
  transports: ["websocket", "polling", "flashsocket"]
});
