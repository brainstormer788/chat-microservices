const Message = require("../models/messageModel");
const Conversation = require("../models/conversationModel");
const mongoose = require("mongoose");

const sendMessage = async (req,res)=>{

  try{

    const { receiverId, text } = req.body;
    if (!receiverId || !String(text || "").trim()) {
      return res.status(400).json({ message: "receiverId and text are required" });
    }

    const senderId = req.user.id;

    let conversation = await Conversation.findOne({
      participants: { $all: [senderId, receiverId] }
    });

    if(!conversation){

      conversation = await Conversation.create({
        participants:[senderId,receiverId]
      });

    }

    const message = await Message.create({
      conversationId:conversation._id,
      sender:senderId,
      text
    });

    res.json(message);

  }catch(error){

    res.status(500).json({message:error.message});

  }

};


const getMessages = async (req,res)=>{

  try{

    const { conversationId } = req.params;
    const currentUserId = req.user.id;

    if (!conversationId) {
      return res.status(400).json({ message: "conversationId is required" });
    }

    let conversation = null;

    // Accept both:
    // 1) Real conversation id
    // 2) Other user's id (frontend-selected user id)
    if (mongoose.Types.ObjectId.isValid(conversationId)) {
      conversation = await Conversation.findOne({
        _id: conversationId,
        participants: currentUserId
      });
    }

    if (!conversation) {
      conversation = await Conversation.findOne({
        participants: { $all: [currentUserId, conversationId] }
      });
    }

    if (!conversation) {
      return res.json([]);
    }

    const messages = await Message.find({
      conversationId: conversation._id
    }).sort({ createdAt: 1 });

    return res.json(messages);

  }catch(error){

    return res.status(500).json({message:error.message});

  }

};


module.exports = {
  sendMessage,
  getMessages
};
