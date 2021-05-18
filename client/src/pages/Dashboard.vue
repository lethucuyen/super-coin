<template>
  <div>
    <h1>PEERS</h1>
    <div class="flex flex-row justify-between items-center mt-5">
      <div class="flex">
        <div
          class="flex-col text-center p-4"
          v-for="(el, index) in peers"
          :key="index"
        >
          <vs-avatar
            size="60px"
            :color="avtColor(el.address === profile.address)"
            :class="[
              'm-0 ',
              { 'selected-peer': el.address === profile.address }
            ]"
            @click="selectPeer()"
          />
          <p
            :class="[
              'font-medium mt-1',
              el.address == profile.address ? 'text-primary' : 'text-grey'
            ]"
          >
            {{ el.name }}
          </p>
        </div>
      </div>

      <vs-button @click="addPeer()">Add Peer</vs-button>
    </div>

    <vs-divider />

    <div v-if="profile">
      <div class="vx-row">
        <div class="vx-col w-full lg:w-1/3 xl:w-1/3 mb-base">
          <div class="m-6">
            <MineNewBlock
              :unconfirmed_txs="profile.unconfirmed_txs"
              @mine="mine($event)"
            />
          </div>
        </div>

        <div class="vx-col w-full lg:w-1/3 xl:w-1/3 mb-base">
          <WalletInfoCard class="m-6" :balance="profile.balance" />
        </div>
        <div class="vx-col w-full lg:w-1/3 xl:w-1/3 mb-base">
          <AddTransaction
            class="m-6"
            :otherPeers="otherPeers"
            :unspentInputs="profile.unspentInputs"
            @pay="pay($event)"
          />
        </div>
      </div>
      <vs-divider />
      <div class="text-center text-5xl p-8">BLOCKCHAIN</div>

      <div class="flex flex-row items-center justify-center mt-6">
        <div class="w-1/2 flex-col">
          <BlockList :blocks="profile.chain" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import CryptoService from "../services/CryptoService";
import { MessageTypeEnum } from "../constants/enums";
import BlockList from "../presentations/dashboard/BlockList";
import WalletInfoCard from "../presentations/dashboard/WalletInfoCard";
import MineNewBlock from "../presentations/dashboard/MineNewBlock";
import AddTransaction from "../presentations/dashboard/AddTransaction";
import { uuid } from "uuidv4";

export default {
  components: { BlockList, WalletInfoCard, MineNewBlock, AddTransaction },
  computed: {
    avtColor() {
      return isSelected => {
        if (isSelected) return "primary";
        return "grey";
      };
    },
    otherPeers() {
      return this.peers.filter(peer => peer.id !== this.profile.id);
    }
  },
  data() {
    return {
      profile: null,
      peers: []
    };
  },
  created() {
    this.requestSocketNewWallet();
    this.requestSocketProfile();
    this.requestSocketPeers();
    this.listenSocketMsgs();

    // this.$socket.emit("error", "This is an error");
  },
  methods: {
    requestSocketNewWallet() {
      const passwordGenerator = uuid();
      console.log("generate password");
      console.log([passwordGenerator]);
      this.$socket.emit(
        "data",
        JSON.stringify({
          type: MessageTypeEnum.REQUEST_NEW_WALLET,
          payload: { password: passwordGenerator }
        })
      );
    },
    requestSocketProfile() {
      this.$socket.emit(
        "data",
        JSON.stringify({
          type: MessageTypeEnum.REQUEST_PROFILE
        })
      );
    },
    requestSocketPeers() {
      this.$socket.emit(
        "data",
        JSON.stringify({
          type: MessageTypeEnum.REQUEST_PEERS
        })
      );
    },
    listenSocketMsgs() {
      this.$socket.on("data", message => {
        this.handleIncomingMsg(message);
      });
    },
    async addPeer() {
      try {
        await CryptoService.testService();
      } catch (e) {
        console.log(e);
      }
    },
    selectPeer() {},
    pay(submitData) {
      console.log(submitData);
    },
    mine(submitData) {
      // console.log(submitData);
      const postData = {
        type: MessageTypeEnum.MINE_NEW_BLOCK,
        payload: submitData
      };
      this.$socket.emit("data", JSON.stringify(postData));
    },
    handleIncomingMsg(message) {
      const msg = JSON.parse(message);
      switch (msg.type) {
        case MessageTypeEnum.REQUEST_NEW_WALLET:
          console.log("-->", MessageTypeEnum.REQUEST_NEW_WALLET);
          console.log(msg);
          break;
        case MessageTypeEnum.REQUEST_LATEST_BLOCK:
          console.log(MessageTypeEnum.REQUEST_LATEST_BLOCK);
          // this.uploadSocketLatestBlock();
          break;
        case MessageTypeEnum.REQUEST_TRANSACTIONS:
          console.log(MessageTypeEnum.REQUEST_TRANSACTIONS);
          // this.uploadSocketTransaction();
          break;
        case MessageTypeEnum.REQUEST_PROFILE:
          console.log(MessageTypeEnum.REQUEST_PROFILE);
          console.log(msg);
          this.profile = msg.payload;
          break;
        case MessageTypeEnum.REQUEST_PEERS:
          console.log(MessageTypeEnum.REQUEST_PEERS);
          console.log(msg);
          this.peers = msg.payload || [];
          break;
        default:
          break;
      }
    }
  }
};
</script>

<style lang="scss">
.bg-success-light {
  background-color: #f6ffed;
}
.bg-danger-light {
  background-color: #faeaea;
}
.bg-blue-light {
  background-color: #d2eafb;
}
.selected-peer {
  bottom: 5%;
  // z-index: 51000;
  box-shadow: 0 1px 20px 1px rgb(146, 88, 255);
}
</style>
