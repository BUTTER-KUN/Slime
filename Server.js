
const express = require("express")
const app = express()
const dotenv = require("dotenv")
const mongoose = require("mongoose")

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