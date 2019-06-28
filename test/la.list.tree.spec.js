const assert = require('assert');
const util = require('util');

let keyString = process.env.KEY;
let userId = process.env.USERID;

const la = require('../la');

assert.notEqual(keyString, undefined, 'KEY missing; add environment variable');
assert.notEqual(userId, undefined, 'USERID missing; add environment variable');

let key = {};

try {
  key = JSON.parse(keyString);
} catch (error) {
  process.exit(error);
}

describe('Test Notebook from another user', function () {
  it('should get another person notebook', function (done) {
    if (key && key['akid'] && key['password']) {
      la
        .userInfoViaId(key, userId)
        .then((response) => {
          const notebooks = response['users']['notebooks'];
          console.log(notebooks);
          assert.equals(notebooks.length > 0, true, 'no notebooks for this user');
          done();
        })
        .catch((error) => {
          console.log(util.inspect(error, {depth: null}));
          done();
        });

    } else {
      assert.fail('KEY missing; add environment variable');
      done();
    }
  });
});
