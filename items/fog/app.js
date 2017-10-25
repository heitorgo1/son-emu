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

const sensor_port = 5000;
const sensors = [];

let idx = 1;

while (process.env[`SENSOR_ADDRESS_${idx}`] != null) {
    sensors.push(process.env[`SENSOR_ADDRESS_${idx}`]);
    idx++;
}

app.use(bodyParser.json());

app.get('/temps', function (req, res) {
    let tmp = [];
    async.each(sensors, function(sensor, cb) {
        if (sensor == null) return cb(null);
        request('http://'+sensor+':'+sensor_port+'/temps', (err, res, body) => {
            if (err) return cb(err);
            tmp = tmp.concat(JSON.parse(body)['temps']);
            cb(null);
        });
    }, function(err) {
        if (err) {
            logger.error(err);
            return res.send(500);
        }

        res.send(200, { temps: topk(tmp, 10) });
    });

})

app.listen(4000, function () {
    logger.info('Fog listening on port 4000!');
    console.log('Fog listening on port 4000!');
})