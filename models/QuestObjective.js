const mongoose = require("mongoose")

const QuestObjetiveSchema = new mongoose.Schema({
    name : String,
    enemyID : { type: mongoose.Schema.Types.ObjectId, ref: "Enemy" },
    requiredAmount : Number,
    currentAmount : Number
    });

const QuestObjective = mongoose.model("QuestObjective", QuestObjetiveSchema);
module.exports = QuestObjective;