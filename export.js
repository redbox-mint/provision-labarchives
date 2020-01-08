const util = require('util');
const parseString = require('xml2js').parseString;
const fs = require('fs-extra');
const la = require('./la');
const ROCrate = require("ro-crate").ROCrate;
const crate = new ROCrate();
const path = require('path');
crate.index();
const rootDataset = crate.getRootDataset();

//User login
const nbid  = process.argv[2];
const uuidFile = process.argv[3];
const username = process.argv[4];
const password = process.argv[5];

const keyPath = './key.json';
let key = {};


async function getPages(key, uid, nbid, parentId, dataset, dir) {
    const tree = await la.getTree(key, uid, nbid, parentId);
    levelNodes = tree["tree-tools"]["level-nodes"]['level-node']
    if (!Array.isArray(levelNodes)) {
        levelNodes = [levelNodes];
    }
    dataset.hasPart = [];

    fs.mkdirp(dir);

    for (let node of levelNodes) {
        const pageId = `#${node['tree-id']}`
        var page = {"@id": pageId};
        page.name = node["display-text"];
        dataset.hasPart.push({"@id": pageId});
        crate.getGraph().push(page);
        if (node["is-page"]["_"] === 'true') {
            console.log("FOUND A PAGE", node['tree-id']);
            //console.log(dataset);
            //console.log(rootDataset);   
            //console.log("CRATE", JSON.stringify(crate.getJson()));
            page["@type"] = ["Article"];
            page.articleBody = "";

            const pageEntries = await la.getEntriesForPage(key, uid, nbid, node['tree-id']);
            
            //console.log(util.inspect(pageEntries, false, null));
            var entries = pageEntries["tree-tools"].entries.entry;
            // TODO - make entry dirs?
            if (entries) {
                if (!Array.isArray(entries)) {
                    entries = [entries];         
                }
                for (let entry of entries) {
                    console.log("Getting entry with ID:", entry.eid);
                    //const entry = await la.getEntry(key, uid, e.eid);
                    console.log(util.inspect(entry, false, null));

                    if (entry["entry-data"] && !(entry["entry-data"]["$"] && entry["entry-data"]["$"]['nil']=== 'true')) {
                        // TODO Make separate pages w/ entries
                        var text =  entry["entry-data"];
                        if (entry['part-type'] === "heading") {
                            text = `<h1>${text}</h1>`
                        }
                        page.articleBody += `${text}\n`;
                    }
                    if (entry["entry-type"]) {

                    }
                    //const att = await la.getEntryAttachment(key, uid, e.eid);
                    //console.log(util.inspect(att, false, null));
                }
            }

        } else {
            page["@type"] = "Dataset";
            await getPages(key, uid, nbid, node["tree-id"], page, path.join(dir, node["tree-id"]))
        }
        fs.writeFileSync("ro-crate-metadata.jsonld", JSON.stringify(crate.getJson(), null, 2))

        //const item = await la.getNode(key, uid, nbid, node['tree-id']);
        //console.log(util.inspect(item, false, null));
    }
    
}

async function main(){
    var uuid;
    if (fs.existsSync(keyPath)) {
        const  keyFile = fs.readFileSync(keyPath);
    try {
        key = JSON.parse(keyFile);
    } catch (error) {
        console.log('key not found please make sure key.json is complete');
        process.exit(-1);
    }
    } else {
        console.log('please include key.json file');
        process.exit(-1);
    }
    if (fs.existsSync(uuidFile)) {
        console.log("Reading uid file")
        uid = fs.readFileSync(uuidFile);
    } else if (username && password) {
        response = await la.accessInfo(key, username, password);
        var uid = response.users.id;
        console.log("Writing uid file")
        fs.writeFileSync(uuidFile, uid);
    }
    if (uid) {
        const nb = await la.getNotebookInfo(key, uid, nbid);
        console.log(util.inspect(nb, false, null));
        rootDataset.name = nb.notebooks.notebook["name"];
        dir = rootDataset.name.toLowerCase().replace(/ +/g, "_").replace(/_+$/,"");
        fs.removeSync(dir); // get rid of directory
        await getPages(key, uid, nbid, 0, rootDataset, dir);
    }
     else {
        console.log('provide username and password');
    }
}



main();


