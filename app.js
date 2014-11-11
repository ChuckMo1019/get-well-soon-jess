var express = require('express');

var PORT = process.env.PORT || 3000;
var PASSWORD = process.env.PASSWORD;

var app = express();

function checkPassword(req, res, next) {
  if (req.headers['x-dinky-password'] != PASSWORD)
    return res.sendStatus(403);
  next();
}

app.use('/api/', checkPassword);

app.get('/api/check', function(req, res, next) {
  res.send({ok: true});
});

app.use(express.static(__dirname + '/static'));

app.listen(PORT, function() {
  console.log("listening on port", PORT);
});
