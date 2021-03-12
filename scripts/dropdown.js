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
        rl.on('line', line => lines.push(line.replace(",","")));
        rl.on('close', _ => resolve(lines));
    });
}

readLines(fs.createReadStream("listOfXdms.txt")).then(result => {
    let obj = {};
    for (let i = 0; i < result.length; i++) {
        dotProp.set(obj, result[i], result[i]);
        //console.log(result[i])
    }
    fs.unlinkSync("prod/master/dropdowntest.md");
    fs.appendFileSync("prod/master/dropdowntest.md", "# XDM Visualization\n", 'utf8');
    fs.appendFileSync("prod/master/dropdowntest.md", "## Git Repo Branch: master\n", 'utf8');
    dropDownGen(obj)
})

function dropDownGen(o) {
    //console.log(JSON.stringify(o, null,2))
    for (let i in o) {
        if (o[i] !== null && typeof(o[i]) == "object") {
            fs.appendFileSync("prod/master/dropdowntest.md", "<details>\n", 'utf8');
            fs.appendFileSync("prod/master/dropdowntest.md", "<summary>" + i + "</summary>\n", 'utf8');
            fs.appendFileSync("prod/master/dropdowntest.md", "<ul>\n", 'utf8');
            dropDownGen(o[i]);
            fs.appendFileSync("prod/master/dropdowntest.md", "</ul>\n", 'utf8');
            fs.appendFileSync("prod/master/dropdowntest.md", "</details>\n", 'utf8');
        }
        else {//leaf
            fs.appendFileSync("prod/master/dropdowntest.md", "<li>"+o[i]+"</li>\n", 'utf8');
        }
    }

}