const mongoose = require("mongoose")

const ItemSchema = new mongoose.Schema({
    name : String,
    amount : Number
    });

const Item = mongoose.model("Item", ItemSchema);
module.exports = Item;