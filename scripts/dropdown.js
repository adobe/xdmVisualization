//This script generate the schema location map.
'use strict';
const readline = require('readline');
const fs = require('fs');
const dotProp = require('dot-prop');

async function readLines(stream) {
    const rl = readline.createInterface({
        input: stream,
        crlfDelay: Infinity
    });
    return new Promise(resolve => {
        stream.once('error', _ => resolve(null));
        const lines = [];
        rl.on('line', line => lines.push(line));
        rl.on('close', _ => resolve(lines));
    });
}

readLines(fs.createReadStream("listOfXdms.txt")).then(result => {
    let obj = {};
    for (let i = 0; i < result.length; i++) {
        dotProp.set(obj, result[i], result[i].split(".").pop());
        //console.log(result[i])
    }
    console.log(JSON.stringify(obj, null,2))
})


