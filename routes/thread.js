const router = require("express").Router()
const {client} = require('../database/database')
const JWT = require('../utils/jwt');
const Tools = require('../utils/tools');
const jwt = new JWT();
const tools = new Tools();

//TODO: check label

async function getMessage(id) {
    return await client.query({
        text: 'select * from messages where id = $1',
        values: [id]
    }).then(data => {
        return data.rows[0];
    }).catch(err => {
        console.log(err);
    });
}

async function getPreview(data) {
    async function a(data) {
        for (let i = 0; data[i]; i++) {
            var msg_id = data[i].history[0];
            await getMessage(msg_id).then(res => { data[i].preview = res.body; });
        }
        return data;
    }
    return await a(data).then(output => { return output; });
}

async function getMessagesById(id_list) {
    return await client.query({
        text: 'select * from messages where id in ' + id_list + ' order by id asc'
    }).then(data => {
        return data.rows;
    });
}

async function getThreads(label) {
    var data;
    if (label) {
        return await client.query({
            text: 'select * from threads where label = $1 order by id desc limit 15',
            values: [label]
        }).then(async res => {
            data = res.rows;
            return await getPreview(data).then(result => {return result;});
        }).catch(err => console.log(err));
    } else {
        return await client.query("select * from threads order by id desc limit 15")
        .then(async res => {
            data = res.rows;
            return await getPreview(data).then(result => {return result;});
        }).catch(err => console.log(err));
    }
}

router.get('/', async (req, res) => {
    try {
        var split = req.headers.authorization.split(' ');
        if (split[0] != 'Bearer') {
            res.status(401).send({message: 'Invalid Bearer'});
            return;
        }
        var decoded = jwt.decode(split[1]);
    } catch (error) {
        res.status(401).send({message: 'Invalid token'});
        return;
    }
    await getThreads(req.query.label).then(data => {
        res.status(200).send(data);
    }).catch(err => console.log(err));
});

router.get('/:id', async (req,res) => {
    try {
        var split = req.headers.authorization.split(' ');
        if (split[0] != 'Bearer') {
            res.status(401).send({message: 'Invalid Bearer'});
            return;
        }
        var decoded = jwt.decode(split[1]);
    } catch (error) {
        res.status(401).send({message: 'Invalid token'});
        return;
    }
    await client.query({
        text: 'select * from threads where id = $1;',
        values: [req.params.id]
    }).then(async data => {
        var id_list = tools.convertArray(data.rows[0].history, '(', ')');
        await getMessagesById(id_list).then(result => {
            res.status(200).send(result);
        });
    });
}); // TODO: format data when getting all messages on thread;

module.exports = router;