var express = require('express'),
  app = new express(),
  users = [],
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

app.get('/users', function (req, res) {
  res.send({users: users});
});

app.get('/clean', function (req, res) {
  users.length = 0;
  res.status(200).end();
});

app.get('/users/:userId', function (req, res) {
  var user = users[req.params.userId];
  if (user) {
    res.send({user: user});
  } else {
    res.status(403).end();
  }
});

app.post('/users', function (req, res) {
  var name = req.param('name'), age = req.param('age');
  console.log(req.body);
  if (name && age) {
    users.push({id: users.length, name: name, age: age});
    res.status(200).send(users[users.length - 1]);
  } else {
    res.status(400).send({reason: 'missing params: should be like {"name": "john", "age": 53}'})
  }
});

app.listen(process.env.PORT || 4730);