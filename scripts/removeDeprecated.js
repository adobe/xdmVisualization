#!/usr/bin/env node
//This script removes deprecated xdms
'use strict';
const fs = require('fs');
const glob = require("glob");
const schemaFolder = "bower_components/mdjson-schemas"
const deprecatedXdms = "deprecatedXdms.json";

let schemaFiles = glob.sync(schemaFolder + '/**/*.schema.json');
let deprecated = JSON.parse(fs.readFileSync(deprecatedXdms).toString());

function process(o) {
    for (let i in o) {
            if (o[i]["$ref"] && o[i]["$ref"] == "deprecated") {
                delete o[i];
            }

            if (o[i] !== null && typeof(o[i]) == 'object') {
                //going one step down in the object tree!!
                process(o[i]);
            }
    }
}

function removeDeprecated(files) {
    files.forEach(function (file) {
        let originalSchema = JSON.parse(fs.readFileSync(file).toString());
        console.log('Remove Deprecated $ref: '+file);
        if ((originalSchema.$id == undefined) && (originalSchema.id == undefined)) {
            throw('Invalid file for deprecated removal!');
        }
        process(originalSchema);
        fs.writeFileSync(file, JSON.stringify(originalSchema,null, 2), 'utf8');
    });
}

removeDeprecated(schemaFiles);//remove $ref fields to deprecated xdms
for (let i in deprecated) {//remove deprecated xdms
    fs.unlinkSync("bower_components/mdjson-schemas/" + deprecated[i]);
}

