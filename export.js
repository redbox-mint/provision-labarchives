const util = require('util');
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

function addTextItem(page, text, entry, crate) {
    page.hasPart.push(
        {
            "@id": `#${entry.eid}`
        }

    );
    crate.getGraph().push({
        "@id": `#${entry.eid}`,
        "@type": ["Article"],
        "articleBody": text,
        "dateCreated": entry["created-at"]["_"],
        "contributor": entry["last-modified-by"],
        "version": entry["version"]["_"],
        "description": `${entry["last-modified-verb"]} by ${entry["last-modified-by"]} at ${entry["created-at"]["_"]}`
    });


}
var count= 0;

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
            console.log("Page:", page.name);
            //console.log(dataset);
            //console.log(rootDataset);   
            //console.log("CRATE", JSON.stringify(crate.getJson()));
            page.articleBody = "";
            page["@type"].push("Article"); 
                           
            const pageEntries = await la.getEntriesForPage(key, uid, nbid, node['tree-id']);
            page.text = [];
            //console.log(util.inspect(pageEntries, false, null));
            var entries = pageEntries["tree-tools"].entries.entry;
            // TODO - make entry dirs?
            if (entries) {
                if (!Array.isArray(entries)) {
                    entries = [entries];         
                }
                
                for (let entry of entries) {
                    // This is the ID to use for entries - will prepend # for ones that are not files
                    const entryUrl = path.join(newDir, entry.eid);
                    fs.mkdirpSync(path.join(rootDir, entryUrl));
                    // Write a copy of the JSON metafdata
                    apiFileName = `api${count++}.json`
                    jsonId = path.join(entryUrl, apiFileName);
                    const json = {"@id": jsonId};
                    json["@type"] = "File";
                    json.name = apiFileName;
                    json["description"] = "JSON Metadata from the LabArchives API as retrieved"
                    json.url = entry["entry-url"]
                    crate.getGraph().push(json);
                    page.hasPart.push({"@id": jsonId});
                    const jsonPath = path.join(rootDir, jsonId);
                    fs.writeFileSync(jsonPath, JSON.stringify(entry, null, 2));

                    //console.log("Setting outDir", outDir);
                    //console.log("Getting entry with ID:", entry.eid);
                    var text = "";
                    if (entry['part-type'] === "heading") {
                        text += `<h1>${entry["entry-data"]}</h1>`
                    } else if (entry["entry-data"] && !(entry["entry-data"]["$"] && entry["entry-data"]["$"]['nil']=== 'true')) {
                        // TODO Make separate pages w/ entries
                       text += entry["entry-data"]; 
                    } 
                    //const entry = await la.getEntry(key, uid, e.eid);
                    //console.log(util.inspect(entry, false, null));
                    
                    if (entry["part-type"] === "widget entry" && entry["snapshot"] === "snapshot_exists") {
                        //https://<baseurl>/api/entries/entry_snapshot?uid=285489257Ho's9^Lt4116011183268315271&eid=sdfjkshdfkjshdfkjhskdjfhskjdfh&<Call Authentication Parameters>
                        const filename = await la.getSnapshot(key, uid, entry.eid, path.join(rootDir, entryUrl));

                        const fileId = path.join(entryUrl, filename);
                        const file = {"@id": fileId};
                        // Absolute path to write file into
                        // Todo - move the file
                        file["@type"] = "File";
                        crate.getGraph().push(file);
                        page.hasPart.push({"@id": fileId}); 
                        text += `<figure><img style='width:50%' src='${fileId}' alt='Widget snapshot'><br/></figure>`;
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
                           text += `<figure><img style='width:50%' src='${fileId}' alt='${entry.caption}'><br/><figcation>${entry.caption}</figcation></figure>`;
                        }
                        if (out.match(/\.pdf$/i)) {
                             text += `<embed src="./${fileId}" type="application/pdf" width="60%" height="600px" />`;
                        }        
                        
                        text += `<p>⬇️🏷️ Download: <a href='${fileId}'>${entry['attach-file-name']}</a></p>\n`; 

                        //Get the file
                        await la.getEntryAttachment(key, uid, entry.eid, out);
                    } 

                    addTextItem(page, text, entry, crate);  

                    //const att = await la.getEntryAttachment(key, uid, e.eid);
                    //console.log(util.inspect(att, false, null));
                }
            }
        } else {
            page["@type"] = "Dataset";
            //console.log("Recursing into dir", page.name)
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


