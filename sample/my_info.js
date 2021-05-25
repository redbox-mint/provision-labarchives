const util = require('util');
const parseString = require('xml2js').parseString;
const fs = require('fs');

const la = require('../la');

//User login
const username = process.argv[2];
const password = process.argv[3];
const keyPath = '../key.json';
let key = {};

if (fs.existsSync(keyPath)) {
  const keyFile = fs.readFileSync(keyPath);
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
if (username && password) {
  la.accessInfo(key, username, password)
    .then((response) => {
        console.log(util.inspect(response, false, null));
    })
    .catch((error) => {
      console.log(util.inspect(error, {depth: null}));
    });
} else {
  console.log('provide username and password');
}
