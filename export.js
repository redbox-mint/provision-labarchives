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


async function getPages(key, uid, nbid, parentId, dataset, dir, rootDir) {
    const tree = await la.getTree(key, uid, nbid, parentId);
    var levelNodes = tree["tree-tools"]["level-nodes"]['level-node']
    if (!Array.isArray(levelNodes)) {
        levelNodes = [levelNodes];
    }
    dataset.hasPart = [];

    for (let node of levelNodes) {
        var page = {};
        page.name = node["display-text"];
        var dirName = toDirName(page.name);
        // TODO IF EXISTS MAKE ANOTHER ONE!!!
        // NewDir is relative
        const newDir = path.join(dir, dirName);
        // dirPath is absolute
        const dirPath = path.join(rootDir, newDir)
        fs.mkdirSync(dirPath);
        dataset.hasPart.push({"@id": newDir});
        page["@id"] = newDir;
        page["@type"] = ["Dataset"];
        page.hasPart = [];

        crate.getGraph().push(page);
        if (node["is-page"]["_"] === 'true') {
            console.log("FOUND A PAGE", page.name);
            //console.log(dataset);
            //console.log(rootDataset);   
            //console.log("CRATE", JSON.stringify(crate.getJson()));
            page.articleBody = "";
            page["@type"].push("Article");                
            const pageEntries = await la.getEntriesForPage(key, uid, nbid, node['tree-id']);
            
            //console.log(util.inspect(pageEntries, false, null));
            var entries = pageEntries["tree-tools"].entries.entry;
            // TODO - make entry dirs?
            if (entries) {
                if (!Array.isArray(entries)) {
                    entries = [entries];         
                }
                var text = "";
                for (let entry of entries) {
                    // This is the ID to use for entries - will prepend # for ones that are not files
                    const entryUrl = path.join(newDir, entry.eid);
                    
                

                    //console.log("Setting outDir", outDir);
                    console.log("Getting entry with ID:", entry.eid);
                    
                    if (entry["entry-data"] && !(entry["entry-data"]["$"] && entry["entry-data"]["$"]['nil']=== 'true')) {
                        // TODO Make separate pages w/ entries
                        text +=  entry["entry-data"]; 
                    } 
                    //const entry = await la.getEntry(key, uid, e.eid);
                    //console.log(util.inspect(entry, false, null));
                    if (entry['part-type'] === "heading") {
                        text += `<h1>${text}</h1>`
                    }
                    
                    if (entry["part-type"] === "Attachment") {
                        // Make a directory for each file
                        // Absolute path
                        // Relative ID/path to file
                        const fileId = path.join(entryUrl, entry['attach-file-name']);
                        // Absolute path to write file into
                        const out = path.join(rootDir, fileId);
                    
                        const file = {"@id": fileId};
                        file["@type"] = "File";
                        crate.getGraph().push(file);
                        page.hasPart.push({"@id": fileId});
                        if (out.match(/\.(jpe?g|png)$/i)) {
                            //console.log(util.inspect(entry, false, null));
                            file.description = entry.caption;
                            text += `<figure><img style='width:50%' src='${fileId}' alt='${entry.caption}'><br/><figcation>${entry.caption}</figcation></figure>`
                        }            
                        text += `<h2>⬇️🏷️ Download: <a href='${fileId}'>${entry['attach-file-name']}</a></h2>\n`;   
                        // Make a directory for the file
                        fs.mkdirpSync(path.join(rootDir, entryUrl));
                        //Get the file
                        await la.getEntryAttachment(key, uid, entry.eid, out);
                    } 

                    if (text.length > 0) {
                        page.articleBody = text;
                    }
                    //const att = await la.getEntryAttachment(key, uid, e.eid);
                    //console.log(util.inspect(att, false, null));
                }
            }
        } else {
            page["@type"] = "Dataset";
            console.log("Recursing into dir", page.name)
                                   // key, uid, nbid, parentId,       dataset, dir,   rootDir
            const done = await getPages(key, uid, nbid, node["tree-id"], page, newDir, rootDir)
        }
        fs.writeFileSync(path.join(rootDir, "ro-crate-metadata.jsonld"), JSON.stringify(crate.getJson(), null, 2))

        //const item = await la.getNode(key, uid, nbid, node['tree-id']);
        //console.log(util.inspect(item, false, null));
    }
    
}

function toDirName(string) {
    return string.replace(/\W+/g, "_").replace(/_+$/,"").toLowerCase()
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
        //console.log(util.inspect(nb, false, null));
        rootDataset.name = nb.notebooks.notebook["name"];
        var directory = toDirName(rootDataset.name.toLowerCase());
        directory = path.resolve(directory);
        fs.removeSync(directory); // get rid of directory
        fs.mkdirSync(directory);
        await getPages(key, uid, nbid, 0, rootDataset, "", directory);
    }
     else {
        console.log('provide username and password');
    }
}



main();


