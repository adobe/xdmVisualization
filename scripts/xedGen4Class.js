#!/usr/bin/env node
//This script generates xeds from registry API on the fly for visulization purpose

const fs = require('fs');
const schemaBase = 'bower_components/mdjson-schemas/schemaregistry/';
const superagent = require('superagent');
const imsOrg = '2398391F5B4E0B150A494124@AdobeOrg'; //hard-coded for int env as of now
const baseUrl = 'https://platform-int.adobe.io/data/foundation/schemaregistry/'; //hard-coded for int env as of now
const classesUrl = baseUrl + 'global/classes/';
const mixinsUrl = baseUrl + 'global/mixins/';
const schemasUrl = baseUrl + 'tenant/schemas/';
const err = 'Wrong parameters!' + '\n' +
    'Usage example: node xedGen4Class.js bearer=eyabc123456789';

if ((process.argv.length !=3) || !process.argv[2].startsWith('bearer=')) {
    throw err;
}
const token = process.argv[2].replace('bearer=','');

(async () => {
    let metaAltId4Class, resClass, resMixin, res, title, classId;

        resClass = await superagent.get(classesUrl) //list all classes
            .set('x-api-key','acp_foundation_schemaregistry')
            .set('Authorization','bearer '+token)
            .set('x-gw-ims-org-id',imsOrg)
            .set('Content-Type','application/json')
            .set('Accept','application/vnd.adobe.xdm-id+json');

        resMixin = await superagent.get(mixinsUrl) //list all mixins
            .set('x-api-key','acp_foundation_schemaregistry')
            .set('Authorization','bearer '+token)
            .set('x-gw-ims-org-id',imsOrg)
            .set('Content-Type','application/json')
            .set('Accept','application/vnd.adobe.xdm-full+json');


        for (let h in resClass.body.results) {
            try {
                metaAltId4Class = resClass.body.results[h]["meta:altId"];
                if (metaAltId4Class.indexOf("_xdm.") != -1) {
                    console.log("Query XDM global class with extension mixins: " + metaAltId4Class);
                    res = await superagent.get(classesUrl + metaAltId4Class) //get class by id
                        .set('x-api-key','acp_foundation_schemaregistry')
                        .set('Authorization','bearer '+token)
                        .set('x-gw-ims-org-id',imsOrg)
                        .set('Content-Type','application/json')
                        .set('Accept','application/vnd.adobe.xed-full+json;version=1');

                    title = res.body.title.replace(/ /g, '_'); //used as filename
                    classId = res.body.$id;//used for query mixins

                    let xdmObj = {};
                    xdmObj.$id = 'https://ns.adobe.com/ddgxdmint/' + metaAltId4Class.replace(/\./g, '');
                    xdmObj.title = res.body.title;
                    xdmObj.description = res.body.description;
                    xdmObj.type = 'object';
                    xdmObj['meta:extends'] = [];
                    xdmObj['meta:extends'].push(classId)
                    xdmObj.allOf = [];
                    xdmObj.allOf.push({'$ref': classId});

                    for (let i in resMixin.body.results) { //add related mixins to schema definition
                        try {
                            if ((resMixin.body.results[i]['meta:intendedToExtend'] != undefined) &&
                                (resMixin.body.results[i]['meta:intendedToExtend'].indexOf(classId) != -1) &&
                                (resMixin.body.results[i]['meta:altId'].indexOf('_xdm.') != -1)) {
                                xdmObj['meta:extends'].push(resMixin.body.results[i]['$id'])
                                let obj = {};
                                obj.$ref = resMixin.body.results[i]['$id'];
                                xdmObj.allOf.push(obj);
                            }
                        } catch (err) {
                            console.log("Error in adding mixin:" + resMixin.body.results[i]["$id"]);
                        }
                    }

                    //console.log("xdm to be posted: "+JSON.stringify(xdmObj,null,2))
                    res = await superagent.post(schemasUrl) //post schema
                        .set('x-api-key','acp_foundation_schemaregistry')
                        .set('Authorization','bearer '+token)
                        .set('x-gw-ims-org-id',imsOrg)
                        .set('Content-Type','application/json')
                        .send(xdmObj);
                    //console.log("xdm post response: "+JSON.stringify(res.body,null,2))

                    let metaAltId4Schema = res.body['meta:altId'];
                    console.log("Generate Tenant XED Schema: " + metaAltId4Schema)

                    res = await superagent.get(schemasUrl + metaAltId4Schema) //get schema in xed
                        .set('x-api-key','acp_foundation_schemaregistry')
                        .set('Authorization','bearer '+token)
                        .set('x-gw-ims-org-id',imsOrg)
                        .set('Content-Type','application/json')
                        .set('Accept','application/vnd.adobe.xed-full+json;version=1');

                    //console.log("xed result: "+JSON.stringify(res.body,null,2));
                    fs.writeFileSync(schemaBase + title + '.schema.json', JSON.stringify(res.body,null,2));

                    try {
                        let resDel= await superagent.delete(schemasUrl + metaAltId4Schema) //delete schema
                            .set('x-api-key','acp_foundation_schemaregistry')
                            .set('Authorization','bearer '+token)
                            .set('x-gw-ims-org-id',imsOrg)
                            .set('Content-Type','application/json')
                            .set('Accept','application/vnd.adobe.xed-full+json;version=1');
                    } catch (err) {
                        console.log("Error deleting schema!")
                    }
                }

            } catch (err) {
                console.log("Error in xed conversion:" + metaAltId4Class);
            }
        }

})();


