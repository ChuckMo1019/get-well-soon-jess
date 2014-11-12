var fs = require('fs');
var MongoClient = require('mongodb').MongoClient;

exports.FileSystem = function(filename) {
  var self = {};

  function readfile() {
    if (!fs.existsSync(filename))
      writefile({posts: []});

    return JSON.parse(fs.readFileSync(filename, 'utf-8'));
  }

  function writefile(doc) {
    fs.writeFileSync(filename, JSON.stringify(doc, null, 2));
  }

  self.get = function(cb) {
    var posts = readfile().posts;
    process.nextTick(function() { cb(null, posts); });
  };

  self.post = function(post, cb) {
    var doc = readfile();

    doc.posts.push(post);
    writefile(doc);
    process.nextTick(function() { cb(null); });
  };

  self.init = function(cb) {
    readfile();
    process.nextTick(function() { cb(null); });
  }

  return self;
};

exports.Mongo = function(url, collectionName, documentName) {
  var self = {};
  var db;
  var collection;

  self.get = function(cb) {
    collection.findOne({
      name: documentName
    }, function(err, doc) {
      if (err) return cb(err);
      if (doc && Array.isArray(doc.posts))
        return cb(null, doc.posts);
      cb(null, []);
    });
  };

  self.post = function(post, cb) {
    collection.update({
      name: documentName
    }, {
      $push: {posts: post}
    }, {
      upsert: true
    }, function(err) {
      cb(err);
    });
  };

  self.init = function(cb) {
    MongoClient.connect(url, function(err, database) {
      if (err) return cb(err);
      db = database;
      collection = db.collection(collectionName);
      cb(null);
    });
  };

  return self;
};
