// This tests is about accessing notebooks from another
// In environment variables
// Add USERNAME, PASSWORD, UID_1 (of another user), NBID_1 of notebook of this user to test.
// key as json string {"akid":"","password":""}

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

describe('Login', function () {
  it('should return access info', function (done) {
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


const nnbid = process.env.NBID_1;
const nuid = process.env.UID_1;

describe('Test Notebook from another user', function () {
  it('should get another person notebook', function (done) {
    la
      .getTree(key, nuid, nnbid, '0')
      .then((result) => {
          const tree = result['tree-tools'];
          assert(tree);
          assert(tree['level-nodes']);
          treeNodes = tree['level-nodes'];
          done();
      })
      .catch((error) => {
        console.log(util.inspect(error, {depth: null}));
        done();
      });
  });
  let node = {};
  it('should insert node', function (done) {
    const displayText = 'Testing a inserting a node';
    la
      .insertNode(key, nuid, nnbid, 0, displayText, false)
      .then((result) => {
          const tree = result['tree-tools'];
          node = tree['node'];
          assert(node['display-text'], displayText);
          done();
      })
      .catch((error) => {
        console.log(util.inspect(error, {depth: null}));
      });
  });
  let entry = {};
  it('should add entry into node', function (done) {
    const workspaceId = 'Moises has hacked you... ';
    const partType = 'plain text entry';
    la
      .addEntry(key, nuid, nnbid, node['tree-id'], partType, workspaceId)
      .then((result) => {
          const entries = result['entries'];
          entry = entries['entry'];
          assert(entry['part-type'], partType);
          done();
      })
      .catch((error) => {
        console.log(util.inspect(error, {depth: null}));
      });
  });

});
