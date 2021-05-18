<template>
  <div>
    <vx-card
      title-color="#fff"
      content-color="#fff"
      card-background="linear-gradient(120deg, #7f7fd5, #86a8e7, #91eae4)"
    >
      <div style="height: 330px">
        <div class="w-full">
          <label>RECIPIENT:</label>
          <v-select
            placeholder="Peer"
            class="bg-white text-grey"
            v-model="submitData.peer"
            :options="otherPeers"
            label="name"
          />
        </div>

        <div class="w-full mt-5">
          <label>AMOUNT / FEE:</label>
          <div class="w-full flex">
            <vs-input-number
              class="w-1/2"
              color="dark"
              :step="20"
              v-model="submitData.amount"
            />
            <vs-input-number
              class="w-1/2"
              color="dark"
              :step="5"
              v-model="submitData.fee"
            />
          </div>
          <!-- <small class="opacity-75">Insufficient balance!</small> -->
        </div>

        <div class="w-full mt-5">
          <label>FUNDS:</label>
          <v-select
            placeholder="Inputs"
            class="bg-white text-grey"
            multiple
            :closeOnSelect="false"
            v-model="submitData.funds"
            :options="fund_choices"
            label="label"
          />
          <!-- <small class="opacity-75">Insufficient funds!</small> -->
        </div>

        <vs-divider />

        <vs-button
          class="bg-dark-gradient mt-5"
          icon-pack="feather"
          icon="icon-feather"
          @click="onSubmit(submitData)"
          >PAY</vs-button
        >
      </div>
    </vx-card>
  </div>
</template>

<script>
export default {
  props: {
    unspentInputs: { type: Array, default: () => [] },
    otherPeers: { type: Array, default: () => [] }
  },
  data() {
    return {
      submitData: {
        peer: null,
        amount: 0,
        fee: 0,
        funds: []
      },
      peer_choices: ["Christian", "Susan"]
      // fund_choices: [
      //   { id: 0, label: "$100 from Mining" },
      //   { id: 1, label: "$100 from Mining" }
      // ]
    };
  },
  computed: {
    fund_choices() {
      console.log("Unspent Inputs:");
      console.log(this.unspentInputs);
      console.log(
        this.unspentInputs.map((unspent, index) => ({
          id: index,
          label: `${unspent.amount} coins from Todo`,
          value: unspent
        }))
      );
      return this.unspentInputs.map((unspent, index) => ({
        id: index,
        label: `${unspent.amount} coins from Todo`,
        value: unspent
      }));
    }
    // fundLabel() {
    //   return unspent => {
    //     return `${unspent.amount} coins from Todo on ${unspent.timestamp}`;
    //   };
    // }
  },
  methods: {
    onSubmit(submitData) {
      this.$emit("pay", submitData);
    }
  }
};
</script>
