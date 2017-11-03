const express = require('express')
const bodyParser = require('body-parser')
const log4js = require('log4js')
const request = require('request')
const async = require('async')
const moment = require('moment')
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
const fogs = [];

let idx = 1;

while (process.env[`FOG_ADDRESS_${idx}`] != null) {
    logger.info(`FOG_ADDRESS_${idx}: ` + process.env[`FOG_ADDRESS_${idx}`]);
    fogs.push(process.env[`FOG_ADDRESS_${idx}`]);
    idx++;
}

const sensor_port = 5000;
const sensors = [];

idx = 1;

while (process.env[`SENSOR_ADDRESS_${idx}`] != null) {
    logger.info(`SENSOR_ADDRESS_${idx}: ` + process.env[`SENSOR_ADDRESS_${idx}`]);
    sensors.push(process.env[`SENSOR_ADDRESS_${idx}`]);
    idx++;
}

app.use(bodyParser.json());

app.get('/tempsSensor', function (req, res) {
    let tmp = [];
    
    const start = moment();
    async.each(sensors, function(sensor, cb) {
        if (sensor == null) return cb(null);
        request('http://'+sensor+':'+sensor_port+'/temps', (err, res, body) => {
            if (err) return cb(err);
            const temps = JSON.parse(body)['temps'];
            logger.info(`SENSOR: ${sensor} TEMPS: ${temps.length} `);
            tmp = tmp.concat(temps);
            cb(null);
        });
    }, function(err) {
        if (err) {
            logger.error(err);
            return res.send(500);
        }

        const resTemps = { temps: topk(tmp, 10)};
        const end = moment();
        const diff = end.diff(start);
        logger.info(`START: ${start} END: ${end} DIFF: ${diff}`);
        return res.send(200, resTemps);
    });
})


app.get('/temps', function (req, res) {
    let tmp = [];
    
    const start = moment();
    async.each(fogs, function(fog, cb) {
        if (fog == null) return cb(null);
        request('http://'+fog+':'+fog_port+'/temps', (err, res, body) => {
            if (err) return cb(err);
            const temps = JSON.parse(body)['temps'];
            logger.info(`FOG: ${fog} TEMPS: ${temps.length} `);
            tmp = tmp.concat(temps);
            cb(null);
        });
    }, function(err) {
        if (err) {
            logger.error(err);
            return res.send(500);
        }

        const resTemps = { temps: topk(tmp, 10)};
        const end = moment();
        const diff = end.diff(start);
        logger.info(`START: ${start} END: ${end} DIFF: ${diff}`);
        return res.send(200, resTemps);
    });
})

app.listen(3000, function () {
    logger.info('Cloud listening on port 3000!');
    console.log('Cloud listening on port 3000!');
})
