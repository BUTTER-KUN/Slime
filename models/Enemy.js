const mongoose = require("mongoose")

const EnemySchema = new mongoose.Schema({
    name : String
    });
const Enemy = mongoose.model("Enemy", EnemySchema);
module.exports = Enemy;