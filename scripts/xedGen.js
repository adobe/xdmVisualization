#!/usr/bin/env node
//This script generates xeds from registry API on the fly for visulization purpose

const fs = require('fs');
const schemaBase = 'bower_components/mdjson-schemas/schemaregistry/';
const superagent = require('superagent');
const imsOrg = '2398391F5B4E0B150A494124@AdobeOrg';
const baseUrl = 'https://platform-int.adobe.io/data/foundation/schemaregistry/global/';
const err = 'Wrong parameters!' + '\n' +
    'Usage example: node profileGen.js bearer=eyabc123456789';

if ((process.argv.length !=3) || !process.argv[2].startsWith('bearer=')) {
    throw err;
}
const token = process.argv[2].replace('bearer=','');
const xdmTypes = ["schemas", "classes", "mixins", "datatypes"];

(async () => {
    let url;
    let metaAltid;
    let res1;
    for (let h in xdmTypes) {
        url = baseUrl + xdmTypes[h] + "/";
        const res = await superagent.get(url)
            .set('x-api-key','acp_foundation_schemaregistry')
            .set('Authorization','bearer '+token)
            .set('x-gw-ims-org-id',imsOrg)
            .set('Content-Type','application/json')
            .set('Accept','application/vnd.adobe.xdm-id+json');

        for (let i in res.body.results) {
            try {
                metaAltId = res.body.results[i]["meta:altId"];
                console.log('Generate XED: global.'+xdmTypes[h]+'.'+metaAltId);
                res1 = await superagent.get(url + metaAltId)
                    .set('x-api-key','acp_foundation_schemaregistry')
                    .set('Authorization','bearer '+token)
                    .set('x-gw-ims-org-id',imsOrg)
                    .set('Content-Type','application/json')
                    .set('Accept','application/vnd.adobe.xed-full+json;version=1');

                //console.log(JSON.stringify(res.body,null,2));
                fs.writeFileSync(schemaBase+'global.'+xdmTypes[h]+'.'+metaAltId+'.schema.json', JSON.stringify(res1.body,null,2));

            } catch (err) {
                console.log("Error in xed conversion:"+metaAltId);
            }
        }
    }
})();


