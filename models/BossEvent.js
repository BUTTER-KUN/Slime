const mongoose = require("mongoose")

const BossEventSchema = new mongoose.Schema({
    name : String,
    day : { type: Array, default: [] },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    spawner : { type: mongoose.Schema.Types.ObjectId, ref: "EnemySpawner" },
    });
    
const BossEvent = mongoose.model("BossEvent", BossEventSchema);
module.exports = BossEvent;