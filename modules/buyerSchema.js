const mongoose = require("mongoose");
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const buyerSchema = mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique: true,
        validate(val) {
            if (!validator.isEmail(val)) {
                throw new error("Email is invalid.");
            }
        }
    },
    phone:{
        type: String,
        required: true,
        unique:true
    },
    address:{
        type:String,
        require:true
    },
    password:{
        type:String,
        required:true,
    },
    cpassword:{
        type:String,
        required:true,
    },
    balance:{
        type:Number,
        default:0
    },
    cart:[
        {
            itemid: {
                type: String,
                require: true
            },
            name:{
                type:String,
                required:true
            },
            link:{
                type:String,
                required:true
            },
            cost:{
                type: Number,
                required: true
            },
            organization:{
                type: String,
                required: true
            }
        }
    ],
    tokens:[
        {
            token: {
                type: String,
                require: true
            }
        }
    ]
})

// hashing passwords before saving it

buyerSchema.pre('save', async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
        this.cpassword = await bcrypt.hash(this.cpassword, 10);
    }
    next();
})

// generating jwt token for user after login

buyerSchema.methods.generateAuthToken = async function () {
    try {
        const token = await jwt.sign({ _id: this._id.toString() }, process.env.SECRET_KEY);
        this.tokens = await this.tokens.concat({ token: token });
        await this.save();
        return token;
    } catch (error) {
        console.log(error);
    }
}

const buyerList = new mongoose.model("buyer", buyerSchema);
module.exports = buyerList;