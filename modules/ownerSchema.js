const mongoose = require("mongoose");
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const ownerSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate(val) {
            if (!validator.isEmail(val)) {
                throw new error("Email is invalid.");
            }
        }
    },
    organization:{
        type:String,
        required:true
    },
    phone: {
        type: String,
        required: true,
        unique: true
    },
    address: {
        type: String,
        require: true
    },
    password: {
        type: String,
        required: true,
    },
    cpassword: {
        type: String,
        required: true,
    },
    balance: {
        type: Number,
        default: 0
    },
    tokens: [
        {
            token: {
                type: String,
                require: true
            }
        }
    ]
})

// hashing passwords before saving it

ownerSchema.pre('save', async function (next) {
    if (this.isModified("password")) {
        this.password = await bcrypt.hash(this.password, 10);
        this.cpassword = await bcrypt.hash(this.cpassword, 10);
    }
    next();
})

// generating jwt token for user after login

ownerSchema.methods.generateAuthToken = async function () {
    try {
        const token = await jwt.sign({ _id: this._id.toString() }, process.env.SECRET_KEY);
        this.tokens = await this.tokens.concat({ token: token });
        await this.save();
        return token;
    } catch (error) {
        console.log(error); 
    }
}

const ownerList = new mongoose.model("owner", ownerSchema);
module.exports = ownerList;