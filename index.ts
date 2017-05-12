let keyPair = require('./keyPair.json')
let WebTorrent = require('webtorrent');
let ed = require('ed25519-supercop');
let crypto_ = require('crypto');
let Bluebird = require('bluebird');
let electron = require('electron');

let buffPubKey = new Buffer(keyPair.publicKey, 'hex');
let buffSecKey = new Buffer(keyPair.secretKey, 'hex');
let targetID = crypto_.createHash('sha1').update(buffPubKey).digest('hex');

let remote = electron.remote;

function noErrPromisifier(originalMethod) {
    return function promisified() {
        var args = [].slice.call(arguments);
        var self = this;
        return new Promise(function (resolve, reject) {
            args.push(resolve);
            originalMethod.apply(self, args);
        });
    };
}

function webTorrent() {
    let client = new WebTorrent({
        dht: {
            verify: ed.verify
        }
    });
    let dht = client.dht;

    Bluebird.promisifyAll(client);
    Bluebird.promisifyAll(dht);

    dht.onAsync = noErrPromisifier(dht.on);

    return client;
}

// let client = webTorrent();
// let dht = client.dht;

function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function get(dht) {
    console.log('get', {
        targetID: targetID
    });

    let res = await dht.getAsync(targetID);

    console.log({
        res: res,
        seq: res ? res.seq : null
    });

    if (res) {
        console.log(res.v.hello.toString('utf-8'));
    }

    return res;
}

async function put(dht, res) {
    let opts = {
        k: buffPubKey,
        cas: res ? res.seq : undefined,
        seq: res ? res.seq + 1 : 0,
        v: {
            hello: new Buffer('Hello, world', 'utf-8')
        },
        sign: function (buf) {
            return ed.sign(buf, buffPubKey, buffSecKey)
        }
    }

    console.log('put', {
        opts: opts,
        cas: opts.cas ? opts.cas : undefined,
        seq: opts.seq,
    });

    let hash = await dht.putAsync(opts);

    console.log({
        hash: hash.toString('hex')
    });
}

async function main() {
    while (true) {
        let client = webTorrent();
        try {
            let dht = client.dht;
            await dht.onAsync('ready');
            let res = await get(dht);
            await put(dht, res);
        } finally {
            await client.destroyAsync();
        }
    }
}

async function main2() {
    try {

    } finally {
            // await client.destroyAsync();
    }

    while (true) {
        let client = webTorrent();
        try {
            let dht = client.dht;
            await dht.onAsync('ready');
            await get(dht);
            await sleep(50);
        } finally {
            await client.destroyAsync();
        }
    }
}

let arg = remote.process.argv[2];
switch (arg) {
    case "main": main(); break;
    case "main2": main2(); break;
    default: main()
}