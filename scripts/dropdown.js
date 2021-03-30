#!/usr/bin/env node
//This script generates the index.md with dropdowns.
'use strict';
const readline = require('readline');
const fs = require('fs');
const dotProp = require('dot-prop');

const err = 'Wrong parameters!' + '\n' +
    'Usage: node ./scripts/dropdown.js branchName' + '\n';

if (process.argv.length !=3) {
    throw err;
}
const branch = process.argv[2];
const filename = "prod/"+branch+"/index.md";

async function readLines(stream) {
    const rl = readline.createInterface({
        input: stream,
        crlfDelay: Infinity
    });
    return new Promise(resolve => {
        stream.once('error', _ => resolve(null));
        const lines = [];
        rl.on('line', line => lines.push(line.replace(",","")));
        rl.on('close', _ => resolve(lines.sort()));
    });
}

readLines(fs.createReadStream("listOfXdms.txt")).then(result => {
    let obj = {};
    for (let i = 0; i < result.length; i++) {
        if ((result[i].indexOf("adobe.") == 0) || (result[i].indexOf("airship.") == 0) || (result[i].indexOf("facebook.") == 0)) {
            //special handling to put these xdms under extension folder
            dotProp.set(obj, "extensions." + result[i], result[i]);
        } else {
            dotProp.set(obj, result[i], result[i]);
        }
        //console.log(result[i])
    }
    fs.appendFileSync(filename, "# XDM Visualization\n", 'utf8');
    fs.appendFileSync(filename, "## Git Repo Branch: " + branch + "\n", 'utf8');
    dropDownGen(obj)
})

function dropDownGen(o) {
    //console.log(JSON.stringify(o, null,2))
    for (let i in o) {
        if (o[i] !== null && typeof(o[i]) == "object") {
            fs.appendFileSync(filename, "<details>\n", 'utf8');
            fs.appendFileSync(filename, "<summary>" + i + "</summary>\n", 'utf8');
            fs.appendFileSync(filename, "<ul>\n", 'utf8');
            dropDownGen(o[i]);
            fs.appendFileSync(filename, "</ul>\n", 'utf8');
            fs.appendFileSync(filename, "</details>\n", 'utf8');
        }
        else {//leaf
            fs.appendFileSync(filename, "<li><a href=\"http://opensource.adobe.com/xdmVisualization/prod/"+branch+"/"+o[i]+".html\">"+i+"</a></li>\n", 'utf8');
        }
    }
}
