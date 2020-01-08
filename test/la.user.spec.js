// This tests is about accessing notebooks from another
// In environment variables
// Add USERNAME, PASSWORD, UID_1 (of another user), NBID_1 of notebook of this user to test.
// key as json string {"akid":"","password":""}

const assert = require('assert');
const fs = require('fs');
const util = require('util');
const xml2js = require('xml2js');
const parser = new xml2js.Parser({explicitArray: false});

const la = require('../la');

const USERNAME = process.env.USERNAME;
const PASSWORD = process.env.PASSWORD;
const createUser = process.env.CREATEUSER; //write `yes` to create user.

assert.notEqual(USERNAME, undefined, 'USERNAME missing; add environment variable');
assert.notEqual(PASSWORD, undefined, 'PASSWORD missing; add environment variable');

let key = fs.readFileSync('key.json', 'utf8');

try {
  key = JSON.parse(key);
  assert.notEqual(key, undefined, 'KEY missing; add environment variable');
} catch (error) {
  process.exit(error);
}

let userInfo = {};

if (createUser === 'yes') {
  describe('createUser', function () {
    it('should create user', function (done) {
      la.createUser(key, USERNAME, 'Moises Sacal', PASSWORD)
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
}

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

let defaultNb;
let treeNodes;

describe('Test Notebook from user', function () {
  it('should get the default notebook', function (done) {
    if (Array.isArray(userInfo.notebooks)) {
      defaultNb = la.getDefaultNoteBook(userInfo.notebooks);
    } else {
      defaultNb = userInfo.notebooks.notebook;
    }
    assert(defaultNb !== undefined, 'No notebook default found');
    done();
  });
  it('should get another person notebook', function (done) {
    la
      .getTree(key, userInfo.id, defaultNb.id, '0')
      .then((result) => {
        const tree = result['tree-tools'];
        assert(tree);
        assert(tree['level-nodes']);
        treeNodes = tree['level-nodes'];
        done();
      })
      .catch((error) => {
        console.log(util.inspect(error, {depth: null}));
        assert.fail('tree not found');
        done();
      });
  });
  let node = {};
  it('should insert node', function (done) {
    const displayText = 'Testing a inserting a node';
    la
      .insertNode(key, userInfo.id, defaultNb.id, 0, displayText, false)
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
    const workspaceId = 'https://google.com?search=WORKSPACES';
    const partType = 'plain text entry';
    la
      .addEntry(key, userInfo.id, defaultNb.id, node['tree-id'], partType, workspaceId)
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
