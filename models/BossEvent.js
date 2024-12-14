const mongoose = require("mongoose")

const EnemySpawnerSchema = new mongoose.Schema({
    name : String,
    enemy : { type: Array, default: [] },
    spawnPos: {
        x: { type: Number, default: 0 },
        y: { type: Number, default: 0 },
      }
    });
const EnemySpawner = mongoose.model("EnemySpawner", EnemySpawnerSchema);
module.exports = EnemySpawner;