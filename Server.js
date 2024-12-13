
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
        const newPlayer = await Player.create({});
        const players = await Player.find({});
        res.status(200).json(players);
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

//http://localhost:4500/addItem?playerID={}&itemName={}&amount={}
app.post("/addItem", async (req, res) => {
    try {
        const { playerID, itemName } = req.query;
        let { amount } = req.query;
        amount = amount ? parseInt(amount, 10) : 1;

        const objectId = new mongoose.Types.ObjectId(playerID);

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
        const updatedPlayer = await Player.findOne({ _id: objectId }).select("-__v");
        res.status(200).json(updatedPlayer);

    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Error adding item to inventory");
    }
});

//http://localhost:4500/addItem?playerID={}&itemName={}
app.post("/addSkill", async (req, res) => {
    try {
        const { playerID, skillName } = req.query;
        let { level } = req.query;
        level = level ? parseInt(level, 10) : 1;
        
        const objectId = new mongoose.Types.ObjectId(playerID);

        const player = await Player.findOne({ _id: objectId}).select("-__v");
        if (!player) {
            return res.status(404).send("Player not found");
        }

        let skill = await Skill.findOneAndUpdate(
            { name: skillName},
            { $setOnInsert: { name: skillName }},
            { new: true, upsert: true}
        );

        if (!player.skillInventory) {
            player.itemInventory = [];
        }

        const existingSkillIndex = player.skillInventory.findIndex(invSkill => invSkill._id.toString() === skill._id.toString());

        if (existingSkillIndex !== -1) {
            await Player.updateOne(
                { _id: objectId, 'skillInventory._id' : skill._id },
                { $inc: { 'skillInventory.$.level' : level} }
            );
        } else {
            await Player.updateOne(
                { _id : objectId},
                { $push: { 'skillInventory': {_id: skill._id, level: level } } }
            );
        }

        const updatedPlayer = await Player.findOne({ _id: objectId })
        res.status(200).json(updatedPlayer);



    } catch (error) {
        console.error("Error:" , error);
        res.status(500).send("Error adding skill to inventory");
    }
});

//http://localhost:4500/getItem?playerID={}
app.get("/getItem", async (req, res) => {
    try {
        const { playerID } = req.query;

        const objectId = new mongoose.Types.ObjectId(playerID);

        const player = await Player.findOne({ _id: objectId}).select("-__v");
        if (!player) {
            return res.status(404).send("Player not found");
        }

        // Initialize inventory if it doesn't exist
        const itemInventory = player.itemInventory || [];

        if (itemInventory.length === 0) {
            return res.json([]);
        }

        // Extract item IDs from the inventory
        const itemIds = itemInventory.map(item => item._id);

        // Fetch item details based on item IDs
        const items = await Item.find({ _id: { $in: itemIds } });

        // Create a map of item IDs to item details for quick lookup
        const itemMap = items.reduce((map, item) => {
            map[item._id.toString()] = item;
            return map;
        }, {});

        // Transform the inventory data to the desired format
        const formattedInventory = itemInventory.map(item => ({
            _id: item._id,
            name: itemMap[item._id.toString()] ? itemMap[item._id.toString()].name : 'Unknown Item',
            amount: skill.amount
        }));

        res.json(formattedInventory);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving inventory");
    }
});

//http://localhost:4500/getSkill?playerID={}
app.get("/getSkill", async (req, res) => {
    try {
        const { playerID } = req.query;

        const objectId = new mongoose.Types.ObjectId(playerID);

        const player = await Player.findOne({ _id: objectId}).select("-__v");
        if (!player) {
            return res.status(404).send("Player not found");
        }

        // Initialize inventory if it doesn't exist
        const skillInventory = player.skillInventory || [];

        if (skillInventory.length === 0) {
            return res.json([]);
        }

        // Extract skill IDs from the inventory
        const skillIds = skillInventory.map(skill => skill._id);

        // Fetch skill details based on skill IDs
        const skills = await Skill.find({ _id: { $in: skillIds } });

        // Create a map of skill IDs to skill details for quick lookup
        const skillMap = skills.reduce((map, skill) => {
            map[skill._id.toString()] = skill;
            return map;
        }, {});

        // Transform the inventory data to the desired format
        const formattedInventory = skillInventory.map(skill => ({
            _id: skill._id,
            name: skillMap[skill._id.toString()] ? skillMap[skill._id.toString()].name : 'Unknown skill',
            amount: skill.amount
        }));

        res.json(formattedInventory);
    } catch (error) {
        console.error(error);
        res.status(500).send("Error retrieving inventory");
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