// TOGGLE BUSY LOADING
// Notes: In here, this object need to be clarified
export default {
  install(Vue) {
    Vue.prototype.$globalBusyOn = function() {
      this.$vs.loading();
    };

    Vue.prototype.$globalBusyOff = function() {
      this.$vs.loading.close();
    };
  }
};
