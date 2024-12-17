const mongoose = require("mongoose");
const DropRateSchema = require("./DropRate.js"); // Import schema

const RewardSchema = new mongoose.Schema({
    name: String,
    coin: Number,
    xp: Number,
    dropRate: [DropRateSchema] // Use DropRateSchema as a subdocument array
});

const Reward = mongoose.model("Reward", RewardSchema);
module.exports = Reward;
