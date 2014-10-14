var express = require('express'),
  app = new express(),
  users = {},
  bodyParser = require('body-parser'),
  fs = require('fs');

function getDB(name) {
  var db;
  try {
    db = fs.readFileSync('data/'+ name + '.json', 'utf8');
  } catch (e) {
    db = false;
  }
  return db;
}

function createDB(name) {
  var success;
  try {
    fs.openSync('data/'+ name + '.json', 'wx+');
    fs.writeFileSync('data/'+ name + '.json', '{"users": []}');
    success = true;
  } catch (e) {
    success = false;
  }
  return success;
}

function deleteDB(name) {
  var success;
  try {
    fs.unlinkSync('data/'+ name + '.json')
    success = true;
  } catch (e) {
    success = false;
  }
  return success;
}

function saveDB(name, db) {
  var success;
  try {
    fs.writeFileSync('data/' + name + '.json', JSON.stringify(db));
    success = true;
  } catch (e) {
    success = false;
  }
  return success;
}

app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  res.type('application/json');
  // intercept OPTIONS method
  if ('OPTIONS' == req.method) {
    res.send(200);
  }
  else {
    next();
  }
});

app.use(bodyParser.json({ type: 'application/json' }));

app.get('/', function (req, res) {
  var dbs;
  try {
    dbs =fs.readdirSync('data/');
  } catch (e) {
    dbs = [];
  }
  res.send('Basic User API: \n ' +
    'To create a new user DB: POST    /:dbName \n ' +
    'To remove a user DB:     DELETE  /:dbName \n ' +
    'To get all users:        GET     /:dbName/users \n ' +
    'To get a specific user:  GET     /:dbName/users/:userId \n ' +
    'To create a new user:    POST    /:dbName/users | {"name": "name": "age": age} \n ' +
    'To update a user:        PUT     /:dbName/users/:userId | {"name": "name"} || {"age": age} || {"name": "name": "age": age} \n ' +
    'To delete a user:        DELETE  /:dbName/users/:userId \n\n ' +
    'This is crappy JS object based DB \n\n\n' +
    'Current DBs : \n' +
    dbs.map(function (db) {
      return db.substring(0, db.indexOf('.'))
    }).join('\n'));
});
// Chaos Actions
app.delete('/', function (req, res) {
  var files, i;
  try {
    files =fs.readdirSync('data/');
    for (i = 0; i < files.length; i += 1) {
      deleteDB(files[i].substring(0, files[i].indexOf('.')));
    }
    res.status(200).end();
  } catch (e) {
    res.status(500).end('something went terribly wrong');
  }
});

// DB Actions
app.delete('/:dbName', function (req, res) {
  if (deleteDB(req.params.dbName)) {
    res.status(200).end('db deleted');
  } else {
    res.status(404).end('wrong db');
  }
});

app.post('/:dbName', function (req, res) {
  var dbName = req.params.dbName;
  if (dbName.match(/^[a-z0-9]+$/i)) {
    if (dbName.length > 3 && dbName.length < 20) {
      if (createDB(dbName)) {
        res.status(200).end('db created');
      } else {
        res.status(400).end('db name already taken');
      }
    } else {
      res.status(400).end('db name should contain between 4 and 20 characters');
    }
  } else {
    res.status(400).end('4 to 20 alphanumeric db name');
  }
});

app.get('/:dbName/users', function (req, res) {
  var db = getDB(req.params.dbName);
  if (!db) {
    res.status(404).end('wrong db, create one by POST /:dbName');
  } else {
    res.send({users: JSON.parse(db)});
  }
});

app.get('/:dbName/users/:userId', function (req, res) {
  var db = getDB(req.params.dbName), users, user, index;
  if (!db) {
    res.status(400).end('wrong database, create one by POST /:dbName');
  } else {
    db = JSON.parse(db);
    for (index = 0; index < db.users.length; index += 1) {
      if (db.users[index].id == req.params.userId) {
        user = db.users[index];
        break;
      }
    }
    if (user) {
      res.send({user: user});
    } else {
      res.status(404).end('user not found');
    }
  }
});

app.delete('/:dbName/users/:userId', function (req, res) {
  var db = getDB(req.params.dbName), user, index;
  if (!db) {
    res.status(400).end('wrong database, create one by POST /:dbName');
  } else {
    db = JSON.parse(db);
    for (index = 0; index < db.users.length; index += 1) {
      if (db.users[index].id == req.params.userId) {
        user = db.users[index];
        break;
      }
    }
    if (user) {
      db.users.splice(index, 1);
      if (saveDB(req.params.dbName, db)) {
        res.status(200).end('user deleted');
      } else {
        res.status(500).end('something went wrong');
      }
    } else {
      res.status(404).end('user not found');
    }
  }
});
app.put('/:dbName/users/:userId', function (req, res) {
  var db = getDB(req.params.dbName), user, index, name = req.param('name'), age = req.param('age');
    if (!db) {
    res.status(400).end('wrong database, create one by POST /:dbName');
  } else {
    if (name || age) {
      db = JSON.parse(db);
      for (index = 0; index < db.users.length; index += 1) {
        if (db.users[index].id == req.params.userId) {
          user = db.users[index];
          break;
        }
      }
      if (user) {
        if (name) {
          user.name = name;
        }
        if (age) {
          user.age = age;
        }
        if (saveDB(req.params.dbName, db)) {
          res.status(200).end('user edited');
        } else {
          res.status(500).end('something went wrong');
        }
      } else {
        res.status(404).end('user not found');
      }
    } else {
      res.status(400).send({reason: 'missing params: at least one param name or age'})
    }
  }
});

app.post('/:dbName/users', function (req, res) {
  var name = req.param('name'), age = req.param('age'), db = getDB(req.params.dbName);
  if (db) {
    if (name && age) {
      db = JSON.parse(db);
      db.users.push({id: Date.now(), name: name, age: age});
      if (saveDB(req.params.dbName, db)) {
        res.send(db.users[db.users.length - 1]);
      } else {
        res.status(500).end('failed saving user');
      }

    } else {
      res.status(400).end({reason: 'missing params: should be like {"name": "john", "age": 53}'})
    }
  } else {
    res.status(400).end('wrong database, create one by POST /:dbName');
  }
});

app.listen(process.env.PORT || 4730);