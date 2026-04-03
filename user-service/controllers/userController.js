const User = require("../models/userModel");

const escapeRegex = (value = "") => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getUsers = async (req, res) => {

  try {

    const searchQuery = String(req.query?.q || "").trim();
    const query = searchQuery
      ? {
          name: {
            $regex: escapeRegex(searchQuery),
            $options: "i"
          }
        }
      : {};

    const users = await User.find(query)
      .select("_id name")
      .sort({ name: 1 })
      .limit(searchQuery ? 20 : 100);

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
