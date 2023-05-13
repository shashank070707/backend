const mongoose = require("mongoose");
const validator = require('validator');

const itemSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        validate(val) {
            if (!validator.isEmail(val)) {
                throw new error("Email is invalid.");
            }
        }
    },
    category:{
        type:String,
        required:true
    },
    organization:{
        type: String,
        required: true
    },
    link:{
        type:String,
        required:true,
    },
    cost:{
        type:Number,
        required:true 
    }
})

const itemList = new mongoose.model("item", itemSchema);
module.exports = itemList;