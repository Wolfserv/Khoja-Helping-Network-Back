const router = require("express").Router()
const {client} = require('../database/database')
const JWT = require('../utils/jwt');
const Tools = require('../utils/tools');
const tools = new Tools();
const jwt = new JWT();

//TODO: check label value

async function createThread(user_id, label) {
    return await client.query({
        text: "insert into threads(users_id, label) values ($1, $2) returning id;",
        values: ['{ ' + user_id + ' }', (label || 'GENERAL')]
    }).then(data => { return data.rows[0].id; }).catch(err => console.log(err));
}

async function checkThread(thread_id) {
    return await client.query({
        text: "select * from threads where id = $1",
        values: [thread_id]
    }).then(data => {
        if (data.rows.length != 1)
            return null;
        return data.rows[0];
    });
}

async function updateThread(thread_infos, user_id, message_id) {
    if (!thread_infos.users_id.includes(user_id)) {
        thread_infos.users_id = tools.addValueToArray(thread_infos.users_id, user_id, '{', '}');
    } else {
        thread_infos.users_id = tools.convertArray(thread_infos.users_id, '{', '}');
    }
    thread_infos.history = tools.addValueToArray(thread_infos.history, message_id, '{', '}');
    return await client.query({
        text: 'update threads set users_id = $1, history = $2 where id = $3',
        values: [thread_infos.users_id, thread_infos.history, thread_infos.id]
    }).then(data => {
        return 200
    }).catch(err => { console.log(err); return 500; });
}

function timeConverter(UNIX_timestamp){
  var a = new Date(UNIX_timestamp);
  var year = a.getFullYear();
  var month = a.getMonth() + 1;
  var date = a.getDate();
  var hour = (a.getHours() + 6) % 24;
  var min = a.getMinutes();
  var sec = a.getSeconds();
  var time = year + '-' + month + '-' + date + ' ' + hour + ':' + min + ':' + sec ;
  return time;
}

router.post('/create', async (req, res) => {
    try {
        var split = req.headers.authorization.split(' ');
        if (split[0] != 'Bearer'){
            res.status(401).send({message: 'Invalid Bearer'});
            return;
        }
        var decoded = jwt.decode(split[1]);
    } catch (error) {
        res.status(401).send({message: 'Invalid token'});
        return;
    }
    if (!req.body.body) {
        res.status(400).send({message: "missing properties"});
        return;
    }
    await createThread(decoded.id, req.body.label).then(async (thread_id) =>  {
        var msg = {
            thread_id: thread_id,
            sender_id: decoded.id,
            body: req.body.body,
            create_date: timeConverter(Date.now()),
            vote: 0
        };
        await client.query({
            text: 'insert into messages(thread_id, sender_id, body, create_date, vote) values ($1, $2, $3, $4, $5) returning id;',
            values: [msg.thread_id, msg.sender_id, msg.body, msg.create_date, msg.vote]
        }).then(async (data) => {
            await client.query("update threads set history = '{ " + data.rows[0].id + " }' where id = " + thread_id + ";").then(data =>{
                res.status(200).send({message: 'message created'});
            });
        }).catch(err => console.log(err));
    });
});

router.post("/reply", async (req, res) => {
    try {
        var split = req.headers.authorization.split(' ');
        if (split[0] != 'Bearer'){
            res.status(401).send({message: 'Invalid Bearer'});
            return;
        }
        var decoded = jwt.decode(split[1]);
    } catch (error) {
        res.status(401).send({message: 'Invalid token'});
        return;
    }
    if (!req.body.body || !req.body.thread_id) {
        res.status(400).send({message: "missing properties"});
        return;
    }
    checkThread(req.body.thread_id).then(async thread_infos => {
        if (!thread_infos) {
            res.status(404).send({message: 'Thread does not exist'});
            return;
        }
        var msg = {
            thread_id: req.body.thread_id,
            sender_id: decoded.id,
            body: req.body.body,
            create_date: timeConverter(Date.now()),
            vote: 0
        };
        await client.query({
            text: 'insert into messages(thread_id, sender_id, body, create_date, vote) values ($1, $2, $3, $4, $5) returning id;',
            values: [msg.thread_id, msg.sender_id, msg.body, msg.create_date, msg.vote]
        }).then(async (data) => {
            await updateThread(thread_infos, msg.sender_id, data.rows[0].id)
            .then(value => {
                if (value != 200) {
                    res.status(value).send({message: "Error occured"});
                } else {
                    res.status(200).send({message: "Reply message created"});
                }
            });
        });
    })
});

module.exports = router;