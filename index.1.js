let keyPair = require('./keyPair.json')
let WebTorrent = require('webtorrent');
let ed = require('ed25519-supercop');
let crypto = require('crypto');

let buffPubKey = new Buffer(keyPair.publicKey, 'hex');
let buffSecKey = new Buffer(keyPair.secretKey, 'hex');
let targetID = crypto.createHash('sha1').update(buffPubKey).digest('hex');

let client = new WebTorrent();
let dht = client.dht;

dht.on('ready', function () {
    console.log('get', {
        targetID: targetID
    });
    dht.get(targetID, function (err, res) {
        if (err) {
            console.log({
                err: err
            });
        } else {
            console.log({
                res: res
            });
            if (res) {
                console.log(res.v.hello.toString('utf-8'));
            }
        }
    });
});
