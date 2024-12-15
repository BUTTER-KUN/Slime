const mongoose = require("mongoose")

const GrindingEventSchema = new mongoose.Schema({
    name : String,
    day : { type: Array, default: [] },
    type: String,
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    multiplier: {type: Number, default: 0}
    });
    
const GrindingEvent = mongoose.model("GrindingEvent", GrindingEventSchema);
module.exports = GrindingEvent;