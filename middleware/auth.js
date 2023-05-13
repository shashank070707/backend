const express = require("express");
const auth = new express.Router();

const jwt = require("jsonwebtoken"); 

const userList = require("../modules/buyerSchema")
const ownerList = require("../modules/ownerSchema")

const cookieParser = require("cookie-parser");
auth.use(cookieParser());

const checkValidUser = async(req,res,next)=>{
    try {
        const token = req.cookies.buyerCookie;
        const verifyUser = await jwt.verify(token, process.env.SECRET_KEY);
        const user = await userList.findOne({ _id: verifyUser._id });
        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        res.status(401).send("Unauthorised User :No token found");
        console.log("User token error : " + error);
    }
}

const checkValidOwner = async (req, res, next) => {
    try {
        const token = req.cookies.ownerCookie;
        const verifyUser = await jwt.verify(token, process.env.SECRET_KEY);
        const user = await ownerList.findOne({ _id: verifyUser._id });
        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        res.status(401).send("Unauthorised User :No token found");
        console.log("Owner token error : " + error);
    }
}


module.exports = {checkValidUser,checkValidOwner}