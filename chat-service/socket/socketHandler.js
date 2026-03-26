const { getIO } = require("../config/socketServer");

let onlineUsers = {};

const handleSockets = () => {

  const io = getIO();

  io.on("connection", (socket) => {
    const userId = socket.data?.user?.id;

    if (!userId) {
      socket.disconnect(true);
      return;
    }

    onlineUsers[userId] = socket.id;
    console.log("User connected:", userId);
    io.emit("onlineUsers", Object.keys(onlineUsers));

    socket.on("sendMessage", (data) => {
      if (!data || typeof data !== "object") {
        return;
      }

      const { receiverId, message } = data;
      const messageSender = message?.sender || message?.senderId;

      if (!receiverId || !message || String(messageSender) !== String(userId)) {
        return;
      }

      const receiverSocket = onlineUsers[receiverId];

      if (receiverSocket) {

        io.to(receiverSocket).emit("receiveMessage", message);

      }

    });


    socket.on("typing", (receiverId) => {

      const receiverSocket = onlineUsers[receiverId];

      if (receiverSocket) {

        io.to(receiverSocket).emit("typing");

      }

    });


    socket.on("disconnect", () => {

      for (let userId in onlineUsers) {

        if (onlineUsers[userId] === socket.id) {

          delete onlineUsers[userId];

          break;

        }

      }

      io.emit("onlineUsers", Object.keys(onlineUsers));

      console.log("User disconnected");

    });

  });

};

module.exports = handleSockets;
