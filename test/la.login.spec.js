// Test to access your own notebooks and create a new Node
// in environtment variables add
// key as json string {"akid":"","password":""}
// USERNAME, PASSWORD

const assert = require('assert');
const util = require('util');
const xml2js = require('xml2js');
const parser = new xml2js.Parser({explicitArray: false});

const la = require('../la');

const USERNAME = process.env.USERNAME;
const PASSWORD = process.env.PASSWORD;
const keyString = process.env.KEY;

assert.notEqual(USERNAME, undefined, 'USERNAME missing; add environment variable');
assert.notEqual(PASSWORD, undefined, 'PASSWORD missing; add environment variable');
assert.notEqual(keyString, undefined, 'KEY missing; add environment variable');

let key = {};

try {
  key = JSON.parse(keyString);
} catch (error) {
  process.exit(error);
}

let userInfo = {};

describe('SSO', function () {
  it('should return institutional login', function (done) {
    la.institutionalLoginUrls(key, USERNAME, PASSWORD)
      .then((result) => {
        const utilities = result.utilities;
        assert(utilities.request, 'utilities');
        done();
      })
      .catch((error) => {
        console.log(util.inspect(error, {depth: null}));
        done();
      });
  });
});
