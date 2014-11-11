var MongoClient = require('mongodb').MongoClient;

module.exports = function(url, collectionName, documentName) {
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
