const cors = require('cors')
const express = require("express")
const bodyParser = require("body-parser")
const app = express()
const http = require("http").createServer(app)
const { Client } = require('pg')
require('dotenv')

const authRouter = require("./routes/auth");
const messageRouter = require('./routes/message');
const threadRouter = require('./routes/thread');

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

//app.use("/v1/api/test", testRouter);

app.get("/", (req, res) => {
    res.status(200).send("hello khoja")
});

app.use("/api/v1/khojaAccess/auth", authRouter);
app.use("/api/v1/khojaAccess/message", messageRouter);
app.use("/api/v1/khojaAccess/thread", threadRouter);

app.use(function  (req, res) {
    res.status(404).send("Not found");
});

http.listen(8080, '0.0.0.0', () => {
    console.log("listening on port 8080");
});