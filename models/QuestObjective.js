const mongoose = require("mongoose")

const QuestObjetiveSchema = new mongoose.Schema({
    name : String,
    enemyID : { type: mongoose.Schema.Types.ObjectId, ref: "Enemy" },
    requiredAmount :{type: Number, default: 10},
    currentAmount :{type: Number, default: 0},
    });

const QuestObjective = mongoose.model("QuestObjective", QuestObjetiveSchema);
module.exports = QuestObjective;