const express = require('express');
const router = new express.Router();
const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
const cookieParser = require("cookie-parser");
router.use(cookieParser());

require("../dbconnection/conn");
const buyerList = require("../modules/buyerSchema");
const ownerList = require("../modules/ownerSchema");
const itemList = require("../modules/itemShema");

// router.get("/", (req, res) => {
//     res.send(req.cookies.buyerCookie);
// })
const {checkValidUser,checkValidOwner} = require('../middleware/auth');


//register the user.................
router.post("/registerbuyer", async (req, res) => {
    const { name, email, phone, address,balance, password, cpassword } = req.body;
    if (!name || !email || !phone || !address || !password || !cpassword) {
        return res.status(422).json({ error: "Fill all please." });
    }

    if (password === cpassword) {
        try {
            const mailExist = await buyerList.findOne({ email: email });
            const phoneExist = await buyerList.findOne({ phone: phone });

            if (mailExist || phoneExist) {
                return res.status(422).json({ error: "Email or Phone already exist." })
            }

            const buyer = new buyerList({ name: name, email: email, phone: phone, address: address,balance:balance, password: password, cpassword: cpassword })

            await buyer.save();
            res.status(201).json({ message: "Registered successfully." })

        } catch (error) {
            console.log(error);
        }
    } else {
        res.status(422).json({ error: "passwords are not matching." });
    }
})

//login the user.................
router.post("/loginbuyer", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(422).json({ message: "Fill details first." });
    }
    try {
        const buyer = await buyerList.findOne({ email: email });
        if (buyer) {
            const isMatch = await bcrypt.compare(password, buyer.password);
            if (isMatch) {
                const token = await buyer.generateAuthToken();
                res.cookie('buyerCookie', token, {
                    expires: new Date(Date.now() + 2592000000),
                    httpOnly: true
                });
                return res.status(200).json({ message: "You logged in." });
            } else if (!isMatch) {
                return res.status(422).json({ message: "Wrong password" });
            }
        } else {
            return res.status(422).json({ error: "No account is there." })
        }
    } catch (error) {
        console.log(error);
    }
})

//register the owner.................
router.post("/registerowner", async (req, res) => {
    const { name, email, organization, phone, address, password, cpassword } = req.body;
    if (!name || !email || !organization || !phone || !address || !password || !cpassword) {
        return res.status(422).json({ error: "Fill all please." });
    }

    if (password === cpassword) {
        try {
            const mailExist = await ownerList.findOne({ email: email });
            const phoneExist = await ownerList.findOne({ phone: phone });

            if (mailExist || phoneExist) {
                return res.status(422).json({ error: "Email or Phone already exist." })
            }

            const owner = new ownerList({ name: name, email: email, organization: organization, phone: phone, address: address, password: password, cpassword: cpassword })

            await owner.save();
            res.status(201).json({ message: "Registered successfully." })

        } catch (error) {
            console.log(error);
        }
    } else {
        res.status(422).json({ error: "passwords are not matching." });
    }
})

//login the owner.................
router.post("/loginowner", async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(422).json({ message: "Fill details first." });
    }
    try {
        const owner = await ownerList.findOne({ email: email });
        if (owner) {
            const isMatch = await bcrypt.compare(password, owner.password);
            if (isMatch) {
                const token = await owner.generateAuthToken();
                res.cookie('ownerCookie', token, {
                    expires: new Date(Date.now() + 2592000000),
                    httpOnly: true
                });
                return res.status(200).json({ message: "You logged in." });
            } else if (!isMatch) {
                return res.status(422).json({ message: "Wrong password" });
            }
        } else {
            return res.status(422).json({ error: "No account is there." })
        }
    } catch (error) {
        console.log(error);
    }
})

router.get("/getuserinformation", checkValidUser,(req,res)=>{
    res.send(req.user);
})

router.get("/getownerinformation", checkValidOwner, (req, res) => {
    res.send(req.user);
})

router.get("/userlogout",(req,res)=>{
    res.clearCookie("buyerCookie", { path: "/" });
    res.status(200).send('User Logout');
})

router.get("/ownerlogout", (req, res) => {
    res.clearCookie("ownerCookie", { path: "/" });
    res.status(200).send('Owner Logout');
})

//add the item.................
router.post("/additem", async (req, res) => {
    const { name, email, category,organization, link,cost } = req.body;
    if (!name || !email || !category || !organization || !link || !cost) {
        return res.status(422).json({ error: "Fill all please." });
    }

    try {

        const item = new itemList({ name: name, email: email, category: category, organization: organization, link:link,cost:cost })

        await item.save();
        res.status(201).json({ message: "Item added successfully." })

    } catch (error) {
        console.log(error);
    }
})

router.get("/getitems",async(req,res)=>{
    const items = await itemList.find();
    res.status(200).send(items);
},[])

router.post("/cateitems",async(req,res)=>{
    const category = req.body.cate;
    const cateItem = await itemList.find({category:category});
    res.status(200).send(cateItem);
})

router.post("/addtocart",async(req,res)=>{
    const {email,itemId,name,link,cost,organization} = req.body;
    const user = await buyerList.findOne({email:email});
    const cart2 = user.cart;
    let tmp = false;
    cart2.map((curr, idx) => {
        if (cart2[idx].itemid === itemId) {
            tmp = true;
        }
    })
    if(tmp === true){
        res.status(422).send({message:"already present"});
    }else{
        user.cart = await user.cart.concat({ itemid: itemId,name:name,link:link,cost:cost,organization:organization });
        await user.save();
        res.status(200).send({ message: "Added to cart" });
    }
})

router.post("/getcartdata", async (req, res) => {
    const { email } = req.body;
    try {
        const user = await buyerList.findOne({ email: email });
        res.status(200).send(user.cart);
    } catch (error) {
        console.log(error);
    }   
})

router.post("/getowneremail",async(req,res)=>{
    const {itemid} = req.body;
    try {
        const item = await itemList.findOne({ _id: itemid });
        res.status(200).send(item);
    } catch (error) {
        console.log(error);
    }
})

router.post("/incuser",async(req,res)=>{
    const {email,cost}=req.body;
    try{
        const user = await buyerList.findOne({email:email});
        user.balance = user.balance + cost;
        user.save();
        res.status(200).send(user);
    }catch(err){
        console.log(err);
    }
})

router.post("/buyoperation", async (req, res) => {
    const { email,email2, cost } = req.body;
    try {
        const user = await buyerList.findOne({ email: email });
        const owner = await ownerList.findOne({ email: email2 });
        user.balance = user.balance - cost;
        if(user.balance < 0){
            res.status(200).send({message:"You have no enough money."});
        }else{
            owner.balance = owner.balance + cost;
            user.save();
            owner.save();
            res.status(200).send({message:"Your order is placed. Thank you!!"});
        }
    } catch (err) {
        console.log(err);
    }
})

router.post("/incowner", async (req, res) => {
    const { email2, cost } = req.body;
    try {
        const owner = await ownerList.findOne({ email: email2 });
        owner.balance = owner.balance + cost;
        owner.save();
        res.status(200).send(owner);
    } catch (err) {
        console.log(err);
    }
})

router.post("/decowner", async (req, res) => {
    const { email, cost } = req.body;
    try {
        const owner = await ownerList.findOne({ email: email });
        owner.balance = owner.balance - cost;
        owner.save();
        res.status(200).send(owner);
    } catch (err) {
        console.log(err);
    }
})

router.post("/delitem",async(req,res)=>{
    const {email,id} = req.body;
    try {
        const user = await buyerList.findOne({ email: email });
        // const cart2 = user.cart;
        // let tmp = false;
        user.cart = user.cart.filter((curr, idx) => {
            return curr.itemid !== id;
        })
        user.save();
        res.status(200).send({message:"Item deleted successfully!!"});
    } catch (err) {
        console.log(err);
    }
})

router.post("/getowneritems",async(req,res)=>{
    const {email} = req.body;
    try {
        const item = await itemList.find({email:email});
        res.status(200).send(item);
    } catch (error) {
        console.log(error);
    }
})

router.post("/updateuser",async(req,res)=>{
    const {email,password,cpassword} = req.body;
    try {
        if(!password || !cpassword){
            res.status(422).send({ msg: "Enter Password Please. " });
        }else{
            if (password === cpassword) {
                const user = await buyerList.findOne({ email: email });
                if (user) {
                    const pass = await bcrypt.hash(password, 10);
                    const cpass = await bcrypt.hash(cpassword, 10);	
                    const _id = user._id;
                    const user2 = await buyerList.findByIdAndUpdate({ _id }, {
                        $set: {
                            password: pass,
                            cpassword: cpass
                        }
                    }, {
                        useFindAndModify: false
                    });
                    res.status(200).send({ msg: "Password Updated Successfully!! " });
                } else {
                    res.status(422).send({ msg: "Email Not Found. " });
                }
            } else {
                res.status(422).send({ msg: "Password are not matching. " });
            }
        }       
    } catch (error) {
        console.log(error);
    }
})

router.post("/updateowner", async (req, res) => {
    const { email, password, cpassword } = req.body;
    try {
        if (!password || !cpassword) {
            res.status(422).send({ msg: "Enter Password Please. " });
        } else {
            if (password === cpassword) {
                const user = await ownerList.findOne({ email: email });
                if (user) {
                    const pass = await bcrypt.hash(password, 10);
                    const cpass = await bcrypt.hash(cpassword, 10);
                    const _id = user._id;
                    const user2 = await ownerList.findByIdAndUpdate({ _id }, {
                        $set: {
                            password: pass,
                            cpassword: cpass
                        }
                    }, {
                        useFindAndModify: false
                    });
                    res.status(200).send({ msg: "Password Updated Successfully!! " });
                } else {
                    res.status(422).send({ msg: "Email Not Found. " });
                }
            } else {
                res.status(422).send({ msg: "Password are not matching. " });
            }
        }
    } catch (error) {
        console.log(error);
    }
})

router.post("/addmoneyinuser",async(req,res)=>{
    try {
        let {email,balance} = req.body;
        balance = Number(balance);
        const user = await buyerList.findOne({email:email});
        user.balance = user.balance + balance;
        await user.save();
        res.status(200).send({ msg: "Money added successfully !!" })
    } catch (error) {
        console.log(error);
        res.status(200).send({ msg: "Can't add money due to some issue. " })
    }
})

module.exports = router;