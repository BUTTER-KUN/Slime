const mongoose = require("mongoose");

const DropRateSchema = new mongoose.Schema({
    rate: { type: Number, required: true },
    description: { type: String, required: true }
});

module.exports = DropRateSchema; // Export schema (not model)
