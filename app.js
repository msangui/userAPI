var express = require('express'),
  app = new express(),
  users = {},
  bodyParser = require('body-parser');

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
  res.send('Basic User API: \n ' +
    'To create a new user DB: POST /:dbName \n ' +
    'To clean DB:             DELETE /:dbName \n ' +
    'To get all users:        GET /:dbName/users \n ' +
    'To get a specific user:  GET /:dbName/users/:userId \n ' +
    'To create a new user:    POST /:dbName/users | {"name": "name": "age": age} \n ' +
    'To update a user:        PUT /:dbName/users/:userId | {"name": "name"} || {"age": age} || {"name": "name": "age": age} \n ' +
    'To delete a user:        DELETE /:dbName/users/:userId \n\n ' +
    'This is crappy JS object based DB');
});

app.delete('/:dbName', function (req, res) {
  if (!users[req.params.dbName]) {
    res.status(404).end('wrong db');
  } else {
    delete users[req.params.dbName];
    res.status(200).end('db cleaned');
  }
});

app.delete('/', function (req, res) {
  users = {};
  res.status(200).end();
});

app.post('/:dbName', function (req, res) {
  var dbName = req.params.dbName;
  if (dbName.match(/^[a-z0-9]+$/i)) {
    if (dbName.length > 3 && dbName.length < 20) {
      if (!users[dbName]) {
        users[dbName] = [];
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
  if (!users[req.params.dbName]) {
    res.status(404).end('wrong db, create one by GET /:dbName/create');
  } else {
    res.send({users: users[req.params.dbName]});
  }
});

app.get('/:dbName/users/:userId', function (req, res) {
  var db = users[req.params.dbName], user, index;
  if (!db) {
    res.status(400).end('wrong database, create one by GET /:dbName/create');
  } else {
    for (index = 0; index < db.length; index += 1) {
      if (db[index].id === req.params.userId) {
        user = req.params.userId;
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
  var db = users[req.params.dbName], user, index;
  if (!db) {
    res.status(400).end('wrong database, create one by GET /:dbName/create');
  } else {
    for (index = 0; index < db.length; index += 1) {
      if (db[index].id == req.params.userId) {
        user = req.params.userId;
        break;
      }
    }
    if (user) {
      db.splice(index, 1);
      res.status(200).end('user deleted');
    } else {
      res.status(404).end('user not found');
    }
  }
});
app.put('/:dbName/users/:userId', function (req, res) {
  var db = users[req.params.dbName], user, index, name = req.param('name'), age = req.param('age');
    if (!db) {
    res.status(400).end('wrong database, create one by GET /:dbName/create');
  } else {
    if (name || age) {
      for (index = 0; index < db.length; index += 1) {
        if (db[index].id == req.params.userId) {
          user = db[index];
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
        res.status(200).end('user edited');
      } else {
        res.status(404).end('user not found');
      }
    } else {
      res.status(400).send({reason: 'missing params: at least one param name or age'})
    }
  }
});

app.post('/:dbName/users', function (req, res) {
  var name = req.param('name'), age = req.param('age'), db = users[req.params.dbName];
  if (db) {
    if (name && age) {
      db.push({id: Date.now(), name: name, age: age});
      res.send(db[db.length - 1]);
    } else {
      res.status(400).send({reason: 'missing params: should be like {"name": "john", "age": 53}'})
    }
  } else {
    res.status(400).end('wrong database, create one by GET /:dbName/create');
  }
});

app.listen(process.env.PORT || 4730);