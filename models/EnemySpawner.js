const mongoose = require("mongoose")

const EnemySpawnerSchema = new mongoose.Schema({
    name : String,
    enemy : { type: Array, default: [] },
    spawnPos: {
        x: { type: Number, default: 0 },
        y: { type: Number, default: 0 },
      },
    delay : { type: Number, default: 0 },
    range : { type: Number, default: 0 },
    maxEnemy : { type: Number, default: 0 }
    });
const EnemySpawner = mongoose.model("EnemySpawner", EnemySpawnerSchema);
module.exports = EnemySpawner;