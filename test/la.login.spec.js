// Test to access your own notebooks and create a new Node
// in environtment variables add
// key as json string {"akid":"","password":""}
// USERNAME, PASSWORD

const assert = require('assert');
const util = require('util');
const xml2js = require('xml2js');
const parser = new xml2js.Parser({explicitArray: false});

const la = require('../la');

let USERNAME = process.env.USERNAME;
let PASSWORD = process.env.PASSWORD;
let keyString = process.env.KEY;

USERNAME = 'moises.sacal@uts.edu.au';
PASSWORD = 'RANDOM_KEY_COPY_PASTED_FROM_LA_WEBSITE';

assert.notEqual(keyString, undefined, 'KEY missing; add environment variable');
assert.notEqual(USERNAME, undefined, 'USERNAME missing; add environment variable');
assert.notEqual(PASSWORD, undefined, 'PASSWORD missing; add environment variable');

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

describe('Login with LA App Authentication', function () {
  /*
  * Password Token for External applications:
  * You are using your institutions credentials to access LabArchives.
  * To use External applications, such as our IOS or Android applications,
  * input the follow into the external application:
  */
  let userInfo = {};
  it('login with copy pasted', function (done) {
    la.accessInfo(key, USERNAME, PASSWORD)
      .then((result) => {
        userInfo = result.users;
        assert(userInfo.email, USERNAME);
        done();
      })
      .catch((error) => {
        console.log(util.inspect(error, {depth: null}));
        done();
      });
  });
});
