const mongoose = require("mongoose")

const RewardSchema = new mongoose.Schema({
    name : String,
    coin : Number,
    xp : Number,
    item : { type: Array, default: [] }
    });

const Reward = mongoose.model("Reward", RewardSchema);
module.exports = Reward;