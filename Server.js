
const express = require("express")
const app = express()
const dotenv = require("dotenv")
const mongoose = require("mongoose")
const Player = require("./models/Player.js")
const Item = require("./models/Item.js")
const Skill = require("./models/Skill.js")

//http://localhost:4500/createPlayer
app.post("/createPlayer", async (req, res) => {
    try {
        const newUser = await Player.create({});
        const users = await Player.find({});
        res.status(200).json(users);
    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred while adding the user.");
    }
});

//http://localhost:4500/getPlayer?index=0
app.get("/getPlayer", async (req, res) => {
    try {
        const { index } = req.query;
        const players = await Player.find({}); 
        const playerIndex = parseInt(index, 10);
        const player = players[playerIndex];
        res.status(200).json(player);

    } catch (error) {
        console.error(error);
        res.status(500).send("An error occurred while retrieving the player.");
    }
});


app.post("/addItem", async (req, res) => {
    try {
        const { userID, itemName } = req.query;
        let { amount } = req.query;
        amount = amount ? parseInt(amount, 10) : 1;

        const objectId = new mongoose.Types.ObjectId(userID);

        // Find player
        const player = await Player.findOne({ _id: objectId }).select("-__v");
        if (!player) {
            return res.status(404).send("Player not found");
        }

        // Find or create the item
        let item = await Item.findOneAndUpdate(
            { name: itemName },
            { $setOnInsert: { name: itemName } },
            { new: true, upsert: true }
        );

        // Ensure that inventory exists
        if (!player.itemInventory) {
            player.itemInventory = [];
        }

        // Find existing item index
        const existingItemIndex = player.itemInventory.findIndex(invItem => invItem._id.toString() === item._id.toString());

        if (existingItemIndex !== -1) {
            // If the item exists, increment the amount
            await Player.updateOne(
                { _id: objectId, 'itemInventory._id': item._id },
                { $inc: { 'itemInventory.$.amount': amount } }
            );
        } else {
            // If the item doesn't exist, add it to the inventory
            await Player.updateOne(
                { _id: objectId },
                { $push: { 'itemInventory': { _id: item._id, amount: amount } } }
            );
        }

        // Fetch the updated player
        const updatedUser = await Player.findOne({ _id: objectId }).select("-__v");
        res.status(200).json(updatedUser);

    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Error adding item to inventory");
    }
});







const connectDB = async () =>{
    try {
        const con = await mongoose.connect("mongodb+srv://patarananset:Patricia1402@cluster05607.gguiy.mongodb.net/Slime?retrywrites=true&w=majority");
        console.log(`MongoDB connected: ${con.connection.host}`);
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
};
connectDB();

app.listen(4500);