const mongoose = require("mongoose")

const QuestSchema = new mongoose.Schema({
    name : String,
    description : String,
    reward : { type: mongoose.Schema.Types.ObjectId, ref: "Reward" },
    Objective : [QuestObjectiveSchema]
    });

const Quest = mongoose.model("Quest", QuestSchema);
module.exports = Quest;