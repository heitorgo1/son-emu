const express = require('express')
const bodyParser = require('body-parser')
const log4js = require('log4js')
const http = require('http')
const app = express()

log4js.configure({
  appenders: { log: { type: 'file', filename: 'info.log' } },
  categories: { default: { appenders: ['log'], level: 'info' } }
});

const logger = log4js.getLogger('log');

app.use(bodyParser.json());

const samples = process.env.TEMP_SAMPLES;

const randVal = function(max, min) {
    return Math.floor(Math.random()*(max-min+1)+min);
}


app.get('/temps', function (req, res) {
    const tmp = [];

    for (var i = 0; i < samples; i++) {
        tmp.push(randVal(100, 35));
    }

    
    logger.info(tmp);
    res.send(200, { temps: tmp })
})

app.listen(5000, function () {
    logger.info('Sensor listening on port 5000!');
    console.log('Sensor listening on port 5000!')
})