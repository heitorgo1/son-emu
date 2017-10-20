const express = require('express')
const bodyParser = require('body-parser')
const log4js = require('log4js')
const request = require('request')
const async = require('async')
const app = express()

log4js.configure({
  appenders: { log: { type: 'file', filename: 'info.log' } },
  categories: { default: { appenders: ['log'], level: 'info' } }
});

const logger = log4js.getLogger('log');

const topk = function(arr, k) {
    const new_arr = [];
    if (arr.length <= k) return arr;

    arr = arr.sort();

    for (var i = 0 ; i < k; i++) {
        new_arr.push(arr[arr.length-1-i]);
    }

    return new_arr;
}

const fog_port = 4000;
const fogs = [process.env.FOG_ADDRESS_1, process.env.FOG_ADDRESS_2]

app.use(bodyParser.json());

app.get('/temps', function (req, res) {
    let tmp = [];
    
    async.each(fogs, function(fog, cb) {
        if (fog == null) return cb(null);
        request('http://'+fog+':'+fog_port+'/temps', (err, res, body) => {
            if (err) return cb(err);
            logger.info(JSON.parse(body));
            tmp = tmp.concat(JSON.parse(body)['temps']);
            cb(null);
        });
    }, function(err) {
        if (err) {
            logger.error(err);
            return res.send(500);
        }

        logger.info(tmp);
        return res.send(200, { temps: topk(tmp, 2)});
    });
})

app.listen(3000, function () {
    logger.info('Cloud listening on port 3000!');
    console.log('Cloud listening on port 3000!');
})