const jwt = require('jsonwebtoken');
const fs = require('fs');

class JWT {

    constructor() {
        this._privateKey = fs.readFileSync('private.pem');
        this._publicKey = fs.readFileSync('public.pem');
    }

    encode(obj) {
        return jwt.sign(obj, this._privateKey, { algorithm: 'RS256', expiresIn: 60 * 60 });
    }

    decode(token) {
        return jwt.verify(token, this._publicKey, { algorithms: ['RS256'] }, function (err, decoded) {
            if (!err) {
                return decoded
            }
            throw new Error("Token expired");
        });
    }
};

module.exports = JWT;