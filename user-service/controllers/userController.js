const User = require("../models/userModel");

const getUsers = async (req, res) => {

  try {

    const users = await User.find().select("-password");

    res.json(users);

  } catch (error) {

    res.status(500).json({
      message: error.message
    });

  }

};

module.exports = {
  getUsers
};