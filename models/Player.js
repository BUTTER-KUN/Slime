const mongoose = require("mongoose")

const PlayerSchema = new mongoose.Schema({

          coin: { type: Number, default: 0 } ,
          skillInventory: { type: Array, default: [] },
          itemInventory: { type: Array, default: [] },
          stats : {
            level: {type: Number,default: 1},
            xp: {type: Number, default: 0},
            currentHp: {type: Number, default: 100},
          },
          lastPos: {
            x: { type: Number, default: 0 },
            y: { type: Number, default: 0 },
          },
          lastScene: {type: Number,default: 1}
    });

const Player = mongoose.model("Player", PlayerSchema);
module.exports = Player;