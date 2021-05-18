<template>
  <div>
    <!-- Email -->
    <vs-input
      v-validate="'required|min:3'"
      data-vv-validate-on="blur"
      name="private-key"
      icon-no-border
      icon="icon icon-user"
      icon-pack="feather"
      label-placeholder="Private Key"
      v-model="private_key"
      class="w-full"
    />
    <span class="text-danger text-sm" v-show="errors.has('private-key')">
      {{ errors.first("private-key") }}</span
    >

    <!-- Password -->
    <vs-input
      data-vv-validate-on="blur"
      v-validate="'required|min:6|max:24'"
      type="password"
      name="password"
      icon-no-border
      icon="icon icon-lock"
      icon-pack="feather"
      label-placeholder="Password"
      v-model="password"
      class="w-full mt-8"
    />
    <span class="text-danger text-sm" v-show="errors.has('password')">{{
      errors.first("password")
    }}</span>

    <!-- Login Button -->
    <div class="flex flex-wrap justify-between mb-3 mt-6">
      <vs-button type="border" @click="registerUser">Đăng ký</vs-button>
      <vs-button :disabled="!validateForm" @click="loginJWT"
        >Access Wallet</vs-button
      >
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      private_key: process.env.VUE_APP_ENV_LOGIN_PRIVATE_KEY, // If using fake api => [admin@admin.com | pass: adminadmin]
      password: process.env.VUE_APP_ENV_LOGIN_PASSWORD
    };
  },
  computed: {
    validateForm() {
      return (
        !this.errors.any() && this.private_key != "" && this.password != ""
      );
    }
  },
  methods: {
    async loginJWT() {},

    registerUser() {
      this.$router.push("/").catch(() => {});
    }
  }
};
</script>
