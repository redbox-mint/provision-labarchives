### Interface Labarchives API

Install node

Create a key.json file with

```json
{
  "akid": "",
  "password": "",
  "baseurl": "https://test.labarchives.com",
  "api": "/api"
}

```

then run

`npm install`

### To run the test suite:

```bash
USERNAME='USER' PASSWORD='PWD' KEY='{"akid":"AKID", "password":"PWD"}' UID_1='OTHER_USER_ID' NBID_1='NOTEBOOK_ID' npm run test
```

