const mongoose = require("mongoose")

const EnemySpawnerSchema = new mongoose.Schema({
    name : String,
    enemyIDs : { type: Array, default: [] },
    spawnPos: {
        x: { type: Number, default: 0 },
        y: { type: Number, default: 0 },
      },
    delay : { type: Number, default: 0 },
    range : { type: Number, default: 0 },
    maxEnemy : { type: Number, default: 0 },
    map : { type: Number, default: 1 },
    });
const EnemySpawner = mongoose.model("EnemySpawner", EnemySpawnerSchema);
module.exports = EnemySpawner;