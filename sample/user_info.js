const util = require('util');
const parseString = require('xml2js').parseString;
const fs = require('fs');

const la = require('../la');

//User login
const userId = process.argv[2];
const keyPath = '../key.json';
let key = {};

(async () => {
  try {
    if (fs.existsSync(keyPath)) {
      const keyFile = fs.readFileSync(keyPath);
      key = JSON.parse(keyFile);
    } else {
      console.log('please include key.json file');
      process.exit(-1);
    }
    if (userId) {
      const response = await la.userInfoViaId(key, userId)
      console.log(util.inspect(response, false, null));
    } else {
      console.log('provide username and password');
    }
  } catch (error) {
    console.log(util.inspect(error, {depth: null}));
  }
})();
