/*=========================================================================================
  File Name: main.js
  Description: main vue(js) file
==========================================================================================*/

import Vue from "vue";
import App from "./App.vue";

// Vuesax Component Framework
import Vuesax from "vuesax";
import "material-icons/iconfont/material-icons.css"; //Material Icons
import "vuesax/dist/vuesax.css"; // Vuesax
Vue.config.productionTip = false
Vue.use(Vuesax);

// axios
import axios from "./axios.js";
Vue.prototype.$http = axios;

// API Calls
import "./services/http/requests";

// Theme Configurations
import "../themeConfig.js";

// Firebase
import "../firebaseConfig.js";

// Auth0 Plugin
import AuthPlugin from "./plugins/auth";
Vue.use(AuthPlugin);

// ACL
import acl from "./plugins/acl/acl";

// Globally Registered Components
import "./theme/globalComponents.js";

// Styles: SCSS
import "./assets/scss/main.scss";

// Tailwind
import "./assets/css/main.css";

// Vue Router
import router from "./router";

// Connect Socket.io
import socket from "./socket";
Vue.use(socket);

// Vuex Store
import store from "./store/store";

// i18n
import i18n from "./plugins/i18n/i18n";

// Vuexy Admin Filters
import "./filters/filters";

// Clipboard
import VueClipboard from "vue-clipboard2";
Vue.use(VueClipboard);

// Tour
import VueTour from "vue-tour";
Vue.use(VueTour);
require("vue-tour/dist/vue-tour.css");

// VeeValidate
import VeeValidate from "vee-validate";
Vue.use(VeeValidate);

// Google Maps
import * as VueGoogleMaps from "vue2-google-maps";
Vue.use(VueGoogleMaps, {
  load: {
    // Add your API key here
    key: "YOUR_API_KEY",
    libraries: "places" // This is required if you use the Auto complete plug-in
  }
});

// Vuejs - Vue wrapper for hammerjs
import { VueHammer } from "vue2-hammer";
Vue.use(VueHammer);

// Vuetify - Toast
import ToastPlugin from "./plugins/toast";
Vue.use(ToastPlugin);

// Event Bus
import EventBusPlugin from "./plugins/event_bus";
Vue.use(EventBusPlugin);

// Vuetify - Global Busy Loading
import BusyLoadingPlugin from "./plugins/busy_loading";
Vue.use(BusyLoadingPlugin);

// PrismJS
import "prismjs";
import "prismjs/themes/prism-tomorrow.css";

// Feather font icon
require("./assets/css/iconfont.css");

// Vue select css
// Note: In latest version you have to add it separately
// import 'vue-select/dist/vue-select.css';

Vue.config.productionTip = false;

new Vue({
  router,
  store,
  i18n,
  acl,
  render: h => h(App)
}).$mount("#app");

