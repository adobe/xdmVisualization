#!/usr/bin/env node
//This script fixes those can not be displayed in the visualization due to the open source code limitation such as array items and map objects.

const fs = require('fs');
const glob = require('glob');
const masterSchemaFolder = 'bower_components/mdjson-schemas';
const deprecatedXdms = "deprecatedXdms.json";

let schemaFiles = glob.sync(masterSchemaFolder + '/**/*.schema.json');
let deprecated = [];

function process(o, file) {
    for (let i in o) {
        if (o.hasOwnProperty(i)) {
            if (o['meta:altId'] != undefined) {
                o.id = o['meta:altId'];
                o.$id = o['meta:altId'];//it is ok ending up two same ids after conversion
            }

            if (o[i]["meta:status"] && (o[i]["meta:status"] == "deprecated") && !o[i].hasOwnProperty("$schema")) {
                delete o[i];//remove deprecated fields
            }

            if (o[i] !== null && typeof(o[i]) == 'object') {
                //going one step down in the object tree!!
                process(o[i], file);
            }

            if (o[i] && o[i].type && (o[i].type == 'array') && (o[i].items.type == 'object')) {//generate a json file by using $ref for array object
                let newSchema = o[i].items;
                newSchema.$schema = 'http://json-schema.org/draft-06/schema#';
                newSchema.id = Math.random().toString().replace('0.','obj') + '.schema.json';
                let newFile = file.split('/');
                newFile.pop();
                delete o[i].items;
                o[i].items = {};
                o[i].items.$ref = newSchema.id;
                fs.writeFileSync(newFile.join('/')+'/'+newSchema.id, JSON.stringify(newSchema,null, 2), 'utf8');
            }

            if ((i == "additionalProperties") && o["meta:xdmType"] == "map") {//convert map fields by generating a map object
                if (!o.hasOwnProperty("properties")) {
                    o.properties = {};
                }
                o.properties.mapObj = o[i];
                process(o.properties.mapObj, file)
                delete(o[i]);
            }

        }
    }
}

function convertArrayItems(files) {
    files.forEach(function (file) {
        var originalSchema = JSON.parse(fs.readFileSync(file).toString());
        console.log('Convert: '+file);
        if ((originalSchema.$id == undefined) && (originalSchema.id == undefined)) {
            //console.log(JSON.stringify(originalSchema,null,2));
            throw('Invalid file for convertion!');
        }
        process(originalSchema, file);
        if (originalSchema["meta:status"] && originalSchema["meta:status"] == "deprecated") {
            deprecated.push(file)
        }
        fs.writeFileSync(file, JSON.stringify(originalSchema,null, 2), 'utf8');
    });
}

function saveDeprecated() {
    for (let i in deprecated) {//Generate list of deprecated xdms
        deprecated[i] = deprecated[i].replace("bower_components/mdjson-schemas/","")
    }
    if (fs.existsSync(deprecatedXdms)) {
        fs.unlinkSync(deprecatedXdms);
    }
    fs.writeFileSync(deprecatedXdms, JSON.stringify(deprecated,null,2));

}

convertArrayItems(schemaFiles);
saveDeprecated();


