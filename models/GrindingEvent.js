const mongoose = require("mongoose")

const GrindingEventSchema = new mongoose.Schema({
    name : String,
    day : { type: Array, default: [] },
    startTime: { type: Date, required: true },
    duration: {type: Number, default: 0},
    coinMultiplier: {type: Number, default: 0},
    expMultiplier: {type: Number, default: 0},
    itemDropRateMultiplier : {type: Number, default: 0}
    });
    
const GrindingEvent = mongoose.model("GrindingEvent", GrindingEventSchema);
module.exports = GrindingEvent;