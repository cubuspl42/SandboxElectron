var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var keyPair = require('./keyPair.json');
var WebTorrent = require('webtorrent');
var ed = require('ed25519-supercop');
var crypto_ = require('crypto');
var Bluebird = require('bluebird');
var electron = require('electron');
var buffPubKey = new Buffer(keyPair.publicKey, 'hex');
var buffSecKey = new Buffer(keyPair.secretKey, 'hex');
var targetID = crypto_.createHash('sha1').update(buffPubKey).digest('hex');
var remote = electron.remote;
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
    var client = new WebTorrent({
        dht: {
            verify: ed.verify
        }
    });
    var dht = client.dht;
    Bluebird.promisifyAll(client);
    Bluebird.promisifyAll(dht);
    dht.onAsync = noErrPromisifier(dht.on);
    return client;
}
// let client = webTorrent();
// let dht = client.dht;
function sleep(ms) {
    return new Promise(function (resolve) { return setTimeout(resolve, ms); });
}
function get(dht) {
    return __awaiter(this, void 0, void 0, function () {
        var res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    console.log('get', {
                        targetID: targetID
                    });
                    return [4 /*yield*/, dht.getAsync(targetID)];
                case 1:
                    res = _a.sent();
                    console.log({
                        res: res,
                        seq: res ? res.seq : null
                    });
                    if (res) {
                        console.log(res.v.hello.toString('utf-8'));
                    }
                    return [2 /*return*/, res];
            }
        });
    });
}
function put(dht, res) {
    return __awaiter(this, void 0, void 0, function () {
        var opts, hash;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    opts = {
                        k: buffPubKey,
                        cas: res ? res.seq : undefined,
                        seq: res ? res.seq + 1 : 0,
                        v: {
                            hello: new Buffer('Hello, world', 'utf-8')
                        },
                        sign: function (buf) {
                            return ed.sign(buf, buffPubKey, buffSecKey);
                        }
                    };
                    console.log('put', {
                        opts: opts,
                        cas: opts.cas ? opts.cas : undefined,
                        seq: opts.seq,
                    });
                    return [4 /*yield*/, dht.putAsync(opts)];
                case 1:
                    hash = _a.sent();
                    console.log({
                        hash: hash.toString('hex')
                    });
                    return [2 /*return*/];
            }
        });
    });
}
function main() {
    return __awaiter(this, void 0, void 0, function () {
        var client, dht, res;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!true) return [3 /*break*/, 8];
                    client = webTorrent();
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, , 5, 7]);
                    dht = client.dht;
                    return [4 /*yield*/, dht.onAsync('ready')];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, get(dht)];
                case 3:
                    res = _a.sent();
                    return [4 /*yield*/, put(dht, res)];
                case 4:
                    _a.sent();
                    return [3 /*break*/, 7];
                case 5: return [4 /*yield*/, client.destroyAsync()];
                case 6:
                    _a.sent();
                    return [7 /*endfinally*/];
                case 7: return [3 /*break*/, 0];
                case 8: return [2 /*return*/];
            }
        });
    });
}
function main2() {
    return __awaiter(this, void 0, void 0, function () {
        var client, dht;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    try {
                    }
                    finally {
                        // await client.destroyAsync();
                    }
                    _a.label = 1;
                case 1:
                    if (!true) return [3 /*break*/, 9];
                    client = webTorrent();
                    _a.label = 2;
                case 2:
                    _a.trys.push([2, , 6, 8]);
                    dht = client.dht;
                    return [4 /*yield*/, dht.onAsync('ready')];
                case 3:
                    _a.sent();
                    return [4 /*yield*/, get(dht)];
                case 4:
                    _a.sent();
                    return [4 /*yield*/, sleep(50)];
                case 5:
                    _a.sent();
                    return [3 /*break*/, 8];
                case 6: return [4 /*yield*/, client.destroyAsync()];
                case 7:
                    _a.sent();
                    return [7 /*endfinally*/];
                case 8: return [3 /*break*/, 1];
                case 9: return [2 /*return*/];
            }
        });
    });
}
var arg = remote.process.argv[2];
switch (arg) {
    case "main":
        main();
        break;
    case "main2":
        main2();
        break;
    default: main();
}
