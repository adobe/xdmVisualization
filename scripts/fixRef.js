#!/usr/bin/env node
//This script fixes the $ref issue where $id is not aligned with folder structure anymore.
'use strict';
const fs = require('fs');
const path = require('path');
const glob = require("glob");
const schemaFolder = "bower_components/mdjson-schemas"
const deprecatedXdms = "deprecatedXdms.json";
const schemaLoc = "schemaLoc.json"

//build id-file map
let idLoc = {};
let schemaFiles = glob.sync(schemaFolder + '/**/*.schema.json');
let deprecated = JSON.parse(fs.readFileSync(deprecatedXdms)).toString();

function buildMap(files) {
    files.forEach(function(file) {
        try {
            let schema = JSON.parse(fs.readFileSync(file));
            idLoc[schema["id"].replace("_xdm.", "").replace("_experience.", "")] = file.replace("bower_components/mdjson-schemas/", "");
        } catch(error) {
            console.log(file.replace(schemaFolder,"") +": JSON " + error);
        }
    });
}

function process(o, from) {
    for (let i in o) {
        if (o.hasOwnProperty(i)) {
            if (i == "$ref") {
                let toKey = o[i].split("../").join("").split("/").join(".")
                    .replace(".schema.json","")
                    .replace("adobe.experience.", "")

                if (idLoc[toKey] !== undefined) {
                    //console.log("key:"+toKey+ "   value:"+idLoc[toKey]);
                    o[i] = path.relative(from, idLoc[toKey]);
                }

                let refLoc = o[i].split("../").join("");
                if (deprecated.indexOf(refLoc) != -1) {//tag deprecated $ref for removal
                    o[i] = "deprecated";
                }

            }
            if (o[i] !== null && typeof(o[i]) == 'object') {
                //going one step down in the object tree!!
                process(o[i], from);
            }
        }
    }
}

function fixRef(files) {//fix $ref by calling process()
    files.forEach(function (file) {
        let originalSchema = JSON.parse(fs.readFileSync(file).toString());
        let fromKey = originalSchema["id"].replace("_xdm.", "").replace("_experience.", "");
        let fromArray = idLoc[fromKey].split("/");
        let from = fromArray.slice(0,fromArray.length-1).join("/")
        console.log('Fix $ref: '+file+" from="+from);
        if ((originalSchema.$id == undefined) && (originalSchema.id == undefined)) {
            //console.log(JSON.stringify(originalSchema,null,2));
            throw('Invalid file for convertion!');
        }
        process(originalSchema, from);
        fs.writeFileSync(file, JSON.stringify(originalSchema,null, 2), 'utf8');
    });
}

buildMap(schemaFiles);
fs.writeFileSync(schemaLoc, JSON.stringify(idLoc,null,2));
fixRef(schemaFiles);
fs.unlinkSync(schemaLoc);

