
// #region imaport
const express = require("express")
const app = express()
const dotenv = require("dotenv")
const mongoose = require("mongoose")
const Player = require("./models/Player.js")
const Item = require("./models/Item.js")
const Skill = require("./models/Skill.js")
const QuestObjective = require("./models/QuestObjective.js")
const Reward = require("./models/Reward.js")
const Quest = require("./models/Quest.js")
const Enemy = require("./models/Enemy.js")
const EnemySpawner = require("./models/EnemySpawner.js")
const BossEvent = require("./models/BossEvent.js")
const GrindingEvent = require("./models/GrindingEvent.js")
// #endregion

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

//http://localhost:4500/addItem?playerID={}&itemID={}&amount={}
app.post("/addItem", async (req, res) => {
    try {
        const { playerID, itemID } = req.query;
        let { amount } = req.query;
        amount = amount ? parseInt(amount, 10) : 1;

        const playerObjectId = new mongoose.Types.ObjectId(playerID);
        const itemObjectId = new mongoose.Types.ObjectId(itemID);

        // Find player
        const player = await Player.findOne({ _id: playerObjectId }).select("-__v");
        if (!player) {
            return res.status(404).send("Player not found");
        }

        const item = await Item.findOne({ _id: itemObjectId });
        if (!item) {
            return res.status(404).send("Item not found");
        }


        // Ensure that inventory exists
        if (!player.itemInventory) {
            player.itemInventory = [];
        }

        // Find existing item index
        const existingItemIndex = player.itemInventory.findIndex(invItem => invItem._id.toString() === item._id.toString());

        if (existingItemIndex !== -1) {
            // If the item exists, increment the amount
            await Player.updateOne(
                { _id: playerObjectId, 'itemInventory._id': item._id },
                { $inc: { 'itemInventory.$.amount': amount } }
            );
        } else {
            // If the item doesn't exist, add it to the inventory
            await Player.updateOne(
                { _id: playerObjectId },
                { $push: { 'itemInventory': { _id: item._id, amount: amount } } }
            );
        }

        // Fetch the updated player
        const updatedPlayer = await Player.findOne({ _id: playerObjectId }).select("-__v");
        res.status(200).json(updatedPlayer);

    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Error adding item to inventory");
    }
});

//http://localhost:4500/deleteItem?playerID={}&itemID={}&amount={}
app.post("/deleteItem", async (req, res) => {
    try {
        const { playerID, itemID } = req.query; // Use itemID instead of itemName
        let { amount } = req.query;
        amount = amount ? parseInt(amount, 10) : 1;

        const playerObjectId = new mongoose.Types.ObjectId(playerID);
        const itemObjectId = new mongoose.Types.ObjectId(itemID);

        // Find player
        const player = await Player.findOne({ _id: playerObjectId }).select("-__v");
        if (!player) {
            return res.status(404).send("Player not found");
        }

        // Ensure that inventory exists
        if (!player.itemInventory || player.itemInventory.length === 0) {
            return res.status(404).send("Player's inventory is empty");
        }

        // Find existing item index in the player's inventory
        const existingItemIndex = player.itemInventory.findIndex(
            invItem => invItem._id.toString() === itemObjectId.toString()
        );

        if (existingItemIndex === -1) {
            return res.status(404).send("Item not found in user's inventory");
        }

        const currentAmount = player.itemInventory[existingItemIndex].amount;

        if (currentAmount > amount) {
            // If the current amount is greater than the amount to delete, decrement the amount
            await Player.updateOne(
                { _id: playerObjectId, 'itemInventory._id': itemObjectId },
                { $inc: { 'itemInventory.$.amount': -amount } }
            );
        } else {
            // If the current amount is less than or equal to the amount to delete, remove the item
            await Player.updateOne(
                { _id: playerObjectId },
                { $pull: { 'itemInventory': { _id: itemObjectId } } }
            );
        }

        // Fetch the updated player
        const updatedPlayer = await Player.findOne({ _id: playerObjectId }).select("-__v");
        res.status(200).json(updatedPlayer);

    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Error deleting item from inventory");
    }
});


//http://localhost:4500/addSkill?playerID={}&skillID={}
app.post("/addSkill", async (req, res) => {
    try {
        const { playerID, skillID } = req.query; // Use skillID instead of skillName
        let { level } = req.query;

        // Validate inputs
        if (!skillID || skillID.trim() === "") {
            return res.status(400).send("Invalid skill ID");
        }

        level = level ? parseInt(level, 10) : 1;
        const playerObjectId = new mongoose.Types.ObjectId(playerID);
        const skillObjectId = new mongoose.Types.ObjectId(skillID);

        // Find player
        const player = await Player.findOne({ _id: playerObjectId }).select("-__v");
        if (!player) {
            return res.status(404).send("Player not found");
        }

        // Find the skill
        const skill = await Skill.findById(skillObjectId);
        if (!skill) {
            return res.status(404).send("Skill not found");
        }

        // Ensure that skillInventory exists
        if (!player.skillInventory) {
            player.skillInventory = [];
        }

        // Find existing skill index in the player's skill inventory
        const existingSkillIndex = player.skillInventory.findIndex(
            invSkill => invSkill._id.toString() === skillObjectId.toString()
        );

        if (existingSkillIndex !== -1) {
            // Increment level if skill already exists
            await Player.updateOne(
                { _id: playerObjectId, "skillInventory._id": skillObjectId },
                { $inc: { "skillInventory.$.level": level } }
            );
        } else {
            // Add the skill to inventory if not already present
            await Player.updateOne(
                { _id: playerObjectId },
                { $push: { skillInventory: { _id: skillObjectId, level: level } } }
            );
        }

        // Fetch updated player data
        const updatedPlayer = await Player.findOne({ _id: playerObjectId }).select("-__v");
        res.status(200).json(updatedPlayer);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Error adding skill to inventory");
    }
});


//http://localhost:4500/deleteSkill?playerID={}&skillID={}
app.post("/deleteSkill", async (req, res) => {
    try {
        const { playerID, skillID } = req.query;

        // Validate inputs
        if (!skillID || skillID.trim() === "") {
            return res.status(400).send("Invalid skill ID");
        }

        const playerObjectId = new mongoose.Types.ObjectId(playerID);
        const skillObjectId = new mongoose.Types.ObjectId(skillID);

        // Find player
        const player = await Player.findOne({ _id: playerObjectId }).select("-__v");
        if (!player) {
            return res.status(404).send("Player not found");
        }

        // Find the skill
        const skill = await Skill.findById(skillObjectId);
        if (!skill) {
            return res.status(404).send("Skill not found in global skill list");
        }

        // Ensure that skillInventory exists
        if (!player.skillInventory) {
            player.skillInventory = [];
        }

        // Find existing skill in the player's inventory
        const existingSkillIndex = player.skillInventory.findIndex(
            invSkill => invSkill._id.toString() === skillObjectId.toString()
        );

        if (existingSkillIndex === -1) {
            return res.status(404).send("Skill not found in user's inventory");
        }

        // Remove the skill from the inventory
        await Player.updateOne(
            { _id: playerObjectId },
            { $pull: { skillInventory: { _id: skillObjectId } } }
        );

        // Fetch and return the updated player
        const updatedPlayer = await Player.findOne({ _id: playerObjectId }).select("-__v");
        res.status(200).json(updatedPlayer);
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Error deleting skill from inventory");
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

//http://localhost:4500/addCurrentQuest?playerID={}&questID
app.post("/addCurrentQuest", async (req, res) => {
    try {
        const { playerID, questID } = req.query;

        const playerObjectId = new mongoose.Types.ObjectId(playerID);
        const questObjectId = new mongoose.Types.ObjectId(questID);

        // Find player
        const player = await Player.findOne({ _id: playerObjectId }).select("-__v");
        if (!player) {
            return res.status(404).send("Player not found");
        }

        const quest = await Quest.findOne({ _id: questObjectId });
        if (!quest) {
            return res.status(404).send("Item not found");
        }

        const updatedPlayer = await Player.findByIdAndUpdate(
            playerObjectId,
            { currentQuest: questObjectId },
            { new: true, select: "-__v" } // Return the updated player document
        );

        res.status(200).json({
            message: "Current quest updated successfully.",
            updatedPlayer,
        });


    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Error adding item to inventory");
    }
});
//http://localhost:4500/updateObjective?playerID={}
app.post("/updateObjective", async (req, res) => {
    try {
        const { playerID } = req.query;

        // Fetch player and populate currentQuest and objectives
        const player = await Player.findById(playerID)
            .populate({
                path: "currentQuest",
                populate: { path: "objective" },
            })
            .exec();

        if (!player) {
            return res.status(404).send("Player not found");
        }

        if (!player.currentQuest || !Array.isArray(player.currentQuest.objective) || player.currentQuest.objective.length === 0) {
            return res.status(400).send("Current quest has no objectives.");
        }

        // Update quest progress
        const updatedProgress = player.currentQuest.objective.map((objective) => ({
            _id: objective._id,
            name: objective.name,
            enemyID: objective.enemyID,
            requiredAmount: objective.requiredAmount,
            currentAmount: 0,
        }));

        // Manually update the questProgress
        player.questProgress = updatedProgress;

        // Return the updated player or quest information
        res.status(200).json(player); // You can modify this to return only necessary fields

    } catch (error) {
        console.error("Error updating quest progress:", error);
        res.status(500).send("Error updating quest progress.");
    }
});

//http://localhost:4500/getQuestProgress?playerID={}&objectiveID={}
app.get("/getQuestProgress", async (req, res) => { 
    try {
        const { playerID, objectiveID } = req.query;

        // Validate playerID
        if (!mongoose.Types.ObjectId.isValid(playerID)) {
            return res.status(400).send("Invalid player ID");
        }

        const objectId = new mongoose.Types.ObjectId(playerID);

        // Fetch the player by ID and retrieve questProgress field
        const player = await Player.findOne({ _id: objectId }).select("questProgress");
        if (!player) {
            return res.status(404).send("Player not found");
        }

        const questProgress = player.questProgress || [];

        // Return empty array if no quest progress exists
        if (questProgress.length === 0) {
            return res.json([]);
        }

        // Filter by objectiveID if provided
        let filteredQuestProgress = questProgress;
        if (objectiveID) {
            if (!mongoose.Types.ObjectId.isValid(objectiveID)) {
                return res.status(400).send("Invalid objective ID");
            }
            filteredQuestProgress = questProgress.filter(progress => progress._id.toString() === objectiveID);
            if (filteredQuestProgress.length === 0) {
                return res.status(404).send("Objective not found in quest progress.");
            }
        }

        // Extract objective IDs from the filtered quest progress
        const objectiveIds = filteredQuestProgress.map(progress => progress._id);

        // Fetch the full details of each objective
        const objectives = await QuestObjective.find({ _id: { $in: objectiveIds } });

        // Create a map of objective IDs to objective details
        const objectiveMap = objectives.reduce((map, objective) => {
            map[objective._id.toString()] = objective;
            return map;
        }, {});

        // Format the quest progress data
        const formattedQuestProgress = filteredQuestProgress.map(progress => ({
            _id: progress._id,
            name: objectiveMap[progress._id.toString()] ? objectiveMap[progress._id.toString()].name : 'Unknown Objective',
            enemyID: progress.enemyID,
            requiredAmount: progress.requiredAmount,
            currentAmount: progress.currentAmount
        }));

        res.json(formattedQuestProgress);
    } catch (error) {
        console.error("Error retrieving quest progress:", error);
        res.status(500).send("Error retrieving quest progress.");
    }
});

//http://localhost:4500/getRewards?questID={}
app.get("/getRewards", async (req, res) => { 
    try {
        const { questID } = req.query;

        // Fetch the quest and populate the reward field
        const quest = await Quest.findById(questID).populate("reward");
        if (!quest) {
            return res.status(404).send("Quest not found.");
        }

        // If no reward is associated, return an empty response
        if (!quest.reward) {
            return res.json({ message: "No rewards associated with this quest." });
        }

        // Format the reward data
        const rewardDetails = {
            name: quest.reward.name,
            coin: quest.reward.coin,
            xp: quest.reward.xp,
            items: quest.reward.item 
        };

        res.json(rewardDetails);
    } catch (error) {
        console.error("Error retrieving rewards:", error);
        res.status(500).send("Error retrieving rewards.");
    }
});

//http://localhost:4500/addProgress?playerID={}&objectiveID={}
app.post("/addProgress", async (req, res) => {
    try {
        const { playerID, objectiveID } = req.query;

        // Fetch player and check for existence
        const player = await Player.findById(playerID);
        if (!player) {
            return res.status(404).send("Player not found.");
        }

        // Check if questProgress exists and contains the objective
        const objectiveIndex = player.questProgress.findIndex(
            (progress) => progress._id.toString() === objectiveID
        );

        if (objectiveIndex === -1) {
            return res.status(404).send("Objective not found in quest progress.");
        }

        // Update questProgress atomically
        const updatedPlayer = await Player.findByIdAndUpdate(
            playerID,
            { $inc: { [`questProgress.${objectiveIndex}.currentAmount`]: 1 } },
            { new: true, select: "questProgress" }
        );

        res.status(200).json(updatedPlayer.questProgress);
    } catch (error) {
        console.error("Error adding progress:", error);
        res.status(500).send("Error adding progress.");
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