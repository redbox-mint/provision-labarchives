##Sample dir


```
node my_info.js 'username' 'password'
```

it should return a json; example:

```js
{ users:
   { id: [ 'XXXXXX' ],
     fullname: [ 'John Smith' ],
     'first-name': [ 'John' ],
     'last-name': [ 'Smith' ],
     email: [ 'john.smithl@org.edu.au' ],
     notebooks:
      [ { '$': { type: 'array' },
          notebook:
           [ { id: [ 'XXXXXX' ],
               name: [ 'john' ],
               'is-default':  { _: 'false', '$': { type: 'boolean' } }  },
             { id: [ 'XXXXXX=' ],
               name: [ 'new notebook' ],
               'is-default':  { _: 'false', '$': { type: 'boolean' } }  },
             { id: [ 'XXXXXX==' ],
               name: [ 'new notebook 2' ],
               'is-default':  { _: 'true', '$': { type: 'boolean' } }  }
           ] } ],
     request:
      [ { class: [ 'users' ],
          method: [ 'user_access_info' ],
          'login-or-email': [ 'john.smith@org.edu.au' ],
          akid: [ 'XXXXXX' ],
          expires: [ 'XXXXXX' ],
          sig: [ 'XXXXXX' ] } ] } }

```

```
node user_info.js 'userId'
```

```js
{
  users: {
    id: 'XXXXXX',
    fullname: 'John Smith',
    'first-name': 'John',
    'last-name': 'Smith',
    email: 'john.smith@org.edu.au',
    'sso-id': '',
    orcid: '',
    'can-own-notebooks': { _: 'true', '$': { type: 'boolean' } },
    'is-a-teacher': { _: 'false', '$': { type: 'boolean' } },
    'is-a-student': { _: 'false', '$': { type: 'boolean' } },
    'is-a-researcher': { _: 'true', '$': { type: 'boolean' } },
    notebooks: {
      '$': { type: 'array' },
      notebook: [
        {
          id: 'XXXXXX',
          name: 'new notebook',
          'is-default': { _: 'false', '$': { type: 'boolean' } }
        },
        { id: [ 'XXXXXX==' ],
          name: [ 'new notebook 2' ],
          'is-default': { _: 'true', '$': { type: 'boolean' } }
        }
      ]
    },
    request: {
      class: 'users',
      method: 'user_info_via_id',
      uid: 'XXXXXX',
      akid: 'XXXXXX',
      expires: 'XXXXXX',
      sig: 'XXXXXX'
    }
  }
}
```

If the password is incorrect or the configuration file is incorrect it returns `400`.
