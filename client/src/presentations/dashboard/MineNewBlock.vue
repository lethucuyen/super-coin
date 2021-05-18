<template>
  <div>
    <vx-card
      class="card-overlay bg-cover"
      title-color="#fff"
      content-color="#fff"
      :card-background="
        'linear-gradient(120deg ,rgba(247,97,161,0.5), rgba(140,27,171,.8)), url(' +
          card_bg_img_2 +
          ')'
      "
    >
      <div v-if="unconfirmed_txs.length !== 0">
        UNCONFIRMED TRANSACTIONS:
        <v-select
          placeholder="Please select a transaction to mine"
          class="bg-white text-grey"
          v-model="submitData.transaction"
          :options="unconfirmed_txs"
        />
      </div>
      <small>Mining reward: 100</small>
      <br />
      <br />
      <vs-button
        class="bg-danger"
        icon-pack="feather"
        icon="icon-codepen"
        @click="$emit('mine', submitData)"
      >
        MINE NEW BLOCK
      </vs-button>
    </vx-card>
  </div>
</template>

<script>
export default {
  props: {
    unconfirmed_txs: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      card_bg_img_2: require("@/assets/images/pages/card-bg-image-demo-2.jpg"),
      submitData: {
        transaction: null
      }
      // unconfirmed_transactions_choices: ["150/0 Mandy to Susan"]
    };
  }
};
</script>
