const mongoose = require("mongoose")

const BossEventSchema = new mongoose.Schema({
    name : String,
    day : { type: Array, default: [] },
    startTime: { type: Date, required: true },
    duration: { type: Number, default: 0 },
    bossSpawner : { type: mongoose.Schema.Types.ObjectId, ref: "EnemySpawner" },
    });
    
const BossEvent = mongoose.model("BossEvent", BossEventSchema);
module.exports = BossEvent;