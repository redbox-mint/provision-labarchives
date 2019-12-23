// Test to access your own notebooks and create a new Node
// in environtment variables add
// key as json string {"akid":"","password":""}
// USERNAME, PASSWORD

const assert = require('assert');
const util = require('util');
const xml2js = require('xml2js');
const parser = new xml2js.Parser({explicitArray: false});
const _ = require('lodash');
const fs = require('fs');

const la = require('../la');

let key = {};

try {
  const keyFile = fs.readFileSync('key.json');
  key = JSON.parse(keyFile);
} catch (error) {
  process.exit(error);
}

let userInfo = {};
const email = 'Moises.Sacal@uts.edu.au';

describe('USER\'S API', function () {
  it('should test if email has account=', function (done) {
    la.emailHasAccount(key, email)
      .then((result) => {
        userInfo = result.users;
        assert(userInfo['account-for-email']['_'], 'Email exists');
        done();
      })
      .catch((error) => {
        console.log(util.inspect(error, {depth: null}));
        done();
      });
  });
});

