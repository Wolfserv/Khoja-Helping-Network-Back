const router = require("express").Router()
const {client} = require('../database/database')
const JWT = require('../utils/jwt');
const jwt = new JWT();

async function checkRegister(req, res) {
    if (!req.body.email || !req.body.password || !req.body.username) {
        res.status(400).send({message: "missing required parameters"})
        return false;
    }
    // TODO: complete with check on params using regex or other
    let a = true;
    await client.query({
        text: "select * from users where email = $1",
        values: [req.body.email]
    }).then(data => {
        if (data.rows.length != 0) {
            res.status(401).send({message: "Already have an account"})
            a = false;
        }
    }).catch(err => console.log(err));
    return a;
}

router.post("/register", async (req, res) => {
    let a = await checkRegister(req, res);
    if (!a)
        return;
    await client.query({
        text: "insert into users(email, password, username, number) values ($1, $2, $3, $4);",
        values: [req.body.email, req.body.password, req.body.username, req.body.number]
    }).then(data => {
        res.status(200).send({message: "registered"})
    }).catch(err => console.log(err));  
});

router.post("/login", async (req, res) => {
    if (!req.body.password || !req.body.email) {
        res.status(400).send({message: "missing required parameters"});
        return;
    }
    await client.query({
        text: 'select * from users where email = $1',
        values: [req.body.email]
    }).then(data => {
        if (data.rows.length == 0) {
            res.status(404).send({message: 'No account found'});
            return;
        }
        if (data.rows[0].password != req.body.password) {
            res.status(403).send({message: 'Invalid password'});
            return;
        }
        var token = jwt.encode({id: data.rows[0].id});
        res.status(200).send({token: token});
    }).catch(err => console.log(err));
});

module.exports = router;