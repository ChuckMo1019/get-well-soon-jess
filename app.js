var express = require('express');
var bodyParser = require('body-parser');

var PORT = process.env.PORT || 3000;
var PASSWORD = process.env.PASSWORD;
var DB_URL = process.env.MONGOHQ_URL;

var app = express();
var db = require('./db')(DB_URL, 'lovebombs', 'get-well-soon-jess');

function checkPassword(req, res, next) {
  if (req.headers['x-dinky-password'] != PASSWORD)
    return res.sendStatus(403);
  next();
}

app.use(bodyParser.json());
app.use('/api/', checkPassword);

app.get('/api/check', function(req, res, next) {
  res.send({ok: true});
});

app.get('/api/posts', function(req, res, next) {
  db.get(function(err, posts) {
    if (err) return next(err);
    res.send({posts: posts});
  });
});

app.post('/api/posts', function(req, res, next) {
  if (!(req.body &&
        req.body.name && typeof(req.body.name) == 'string' &&
        req.body.text && typeof(req.body.text) == 'string' &&
        (!req.body.url || /^https?:\/\/.+$/.test(req.body.url))))
    return res.status(400).send({error: 'bad request'});
  db.post({
    date: Date.now(),
    name: req.body.name,
    text: req.body.text,
    url: req.body.url
  }, function(err) {
    if (err) return next(err);
    res.send({ok: true});
  });
});

app.use(express.static(__dirname + '/static'));

app.use(function(err, req, res, next) {
  console.error(err.stack);
  res.status(500).send('Alas, something broke.');
});

db.init(function(err) {
  if (err) throw err;

  app.listen(PORT, function() {
    console.log("listening on port", PORT);
  });
});
