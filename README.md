### Project to Test Labarchives API

Create a key.json file with

```json
{
  "akid": "",
  "password": ""
}
```

then run 

`npm install`

and test index with

```
node index.js 'username' 'password'
```

it should return a json; example:

```js
{ users: 
   { id: [ 'XXXXXX' ],
     fullname: [ 'Moises Sacal' ],
     'first-name': [ 'Moises' ],
     'last-name': [ 'Sacal' ],
     email: [ 'moises.sacal@uts.edu.au' ],
     notebooks: 
      [ { '$': { type: 'array' },
          notebook: 
           [ { id: [ 'XXXXXX' ],
               name: [ 'moises' ],
               'is-default': [ { _: 'false', '$': { type: 'boolean' } } ] },
             { id: [ 'XXXXXX=' ],
               name: [ 'newNotebook' ],
               'is-default': [ { _: 'false', '$': { type: 'boolean' } } ] },
             { id: [ 'XXXXXX==' ],
               name: [ 'UTS Rollout materials - use this to collaborate!' ],
               'is-default': [ { _: 'true', '$': { type: 'boolean' } } ] } ] } ],
     request: 
      [ { class: [ 'users' ],
          method: [ 'user_access_info' ],
          'login-or-email': [ 'moises.sacal@uts.edu.au' ],
          akid: [ 'XXXXXX' ],
          expires: [ 'XXXXXX' ],
          sig: [ 'XXXXXX' ] } ] } }

```

if the password is incorrect or the configuration file is incorrect it returns `400`.

