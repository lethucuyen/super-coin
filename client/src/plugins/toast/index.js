// Notes: In here, this object need to be clarified
export default {
  install(Vue) {
    Vue.prototype.$success = function({ message, title = "Thành công" }) {
      this.$vs.notify({
        title,
        text: message,
        iconPack: "feather",
        icon: "icon-check",
        color: "success"
      });
    };

    Vue.prototype.$error = function({ message, title = "Thất bại" }) {
      this.$vs.notify({
        title,
        text: message,
        iconPack: "feather",
        icon: "icon-alert-circle",
        color: "danger"
      });
    };

    Vue.prototype.$warning = function({ message, title }) {
      this.$vs.notify({
        title,
        text: message,
        iconPack: "feather",
        icon: "icon-alert-circle",
        color: "warning"
      });
    };
  }
};
