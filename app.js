//dotenv.............
const dotenv = require("dotenv");
dotenv.config({path:"./config.env"});

//express...............
const express = require("express");
const app = express();

app.use(express.json());

//assigning port number...........
const PORT = process.env.PORT || 5000

//database connection...........
require("./dbconnection/conn"); 

//router.................
app.use(require("./router/router"));
// app.use(require("./middleware/auth"));

// const cookieParser = require("cookie-parser");
// app.use(cookieParser());

//handeling different requests..............
// app.get('/',(req,res)=>{
//     res.send("Hi bro.")
// })
// app.get("/", (req, res) => {
//     res.send(req.cookies.buyerCookie);
// })

//listening to the port...............
app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`)
})