const { MessageTypeEnum } = require("./models/messageType");
const MessageCreator = require("./models/messageCreator");

const socketListeners = (socket, blockchainNetwork) => {
  socket.on(MessageTypeEnum.REQUEST_MESSAGE, (message) => {
    console.log(MessageTypeEnum.REQUEST_MESSAGE);
    console.log(message);
  });
};

module.exports = socketListeners;
