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

const USERNAME = process.env.USERNAME;
const PASSWORD = process.env.PASSWORD;

assert.notEqual(USERNAME, undefined, 'USERNAME missing; add environment variable');
assert.notEqual(PASSWORD, undefined, 'PASSWORD missing; add environment variable');

let key = {};

try {
  const keyFile = fs.readFileSync('key.json');
  key = JSON.parse(keyFile);
} catch (error) {
  process.exit(error);
}

let userInfo = {};
let notebooks = [];

describe('Notebook API', function () {
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
  it('should list users notebooks', function (done) {
    const isAuth = true;
    la.userInfoViaId(key, userInfo.id, isAuth)
      .then((result) => {
        const users = result.users;
        assert(users, 'responds with users');
        assert(users.notebooks, 'notebooks object exists');
        notebooks = users.notebooks.notebook;
        assert(Array.isArray(notebooks), 'Notebooks found');
        done();
      });
  });
  it('should add user to notebook', function (done) {
    const nb = notebooks.find((n) => {
      return n['name'] === 'provision-labarchives-node-api';
    });
    assert(!_.isUndefined(nb), 'notebook not found');
    const email = 'Sharyn.Wise@uts.edu.au';
    const userRole = 'ADMINISTRATOR';

    la.addUserToNotebook(key, userInfo.id, nb['id'], 'Sharyn.Wise@uts.edu.au', 'ADMINISTRATOR')
      .then((result) => {
        const nbu = result.notebooks['notebook-user'];
        assert(nbu['email'].toLowerCase() === email.toLowerCase(), 'Notebook User Not Added');
        assert(nbu['user-role'].toLowerCase() === userRole.toLowerCase(), 'Notebook User Role Not Added');
        done();
      });
  });
});
