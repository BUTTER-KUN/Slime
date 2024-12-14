const mongoose = require("mongoose")

const EnemySchema = new mongoose.Schema({
    name : String,
    reward : { type: mongoose.Schema.Types.ObjectId, ref: "Reward" }
    });
const Enemy = mongoose.model("Enemy", EnemySchema);
module.exports = Enemy;