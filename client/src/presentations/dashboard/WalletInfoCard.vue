<template>
  <div>
    <vx-card
      class="card-overlay bg-cover text-center"
      title-color="#fff"
      content-color="#fff"
      :card-background="
        'linear-gradient(120deg ,rgba(109,213,237,.8), rgba(33,147,176,0.5)), url(' +
          card_bg_img_1 +
          ')'
      "
    >
      <div class="border-solid border-white rounded p-5">
        <div class="text-5xl">{{ balance }}</div>
        <div class="text-2xl">BALANCE</div>
      </div>
      <feather-icon icon="FeatherIcon" class="mt-5" />
    </vx-card>
  </div>
</template>

<script>
export default {
  props: { balance: Number },
  data() {
    return {
      card_bg_img_1: require("@/assets/images/pages/card-bg-image-demo-1.jpg")
    };
  }
};
</script>
