function ServerAPI() {
  var self = {};
  var password = window.localStorage['GWSJ_DINKY_PW'] || null;

  var POLL_INTERVAL = 10000;

  function request(method, url, data, cb) {
    if (typeof(data) == 'function') {
      cb = data;
      data = null;
    }

    var req = new XMLHttpRequest();

    req.open(method, url);
    req.onload = function() {
      if (req.status == 403)
        return cb(new Error('Invalid password'));
      if (req.status != 200)
        return cb(new Error('Got ' + req.status));
      cb(null, JSON.parse(req.responseText));
    };
    req.onerror = function() {
      cb(new Error('Network error'));
    };
    req.setRequestHeader('X-Dinky-Password', password);
    if (data)
      req.setRequestHeader('Content-Type', 'application/json');
    req.send(data ? JSON.stringify(data) : null);
  }

  function checkForPostUpdates() {
    if (!password) return;

    request('GET', '/api/posts', function(err, data) {
      if (err)
        return console.log('error fetching posts', err);
      updatePosts({$set: data.posts});
    });
  }

  function updatePosts(updates) {
    self.posts = React.addons.update(self.posts, updates);

    setTimeout(function() {
      self.onPostsChanged(self.posts);
    }, 100);
  }

  self.getAuth = function() {
    return !!password;
  };

  self.auth = function(options, cb) {
    password = options.password;
    request('GET', '/api/check', function(err, data) {
      if (err) {
        self.unauth();
        return cb(err);
      }
      window.localStorage['GWSJ_DINKY_PW'] = password;
      checkForPostUpdates();
      cb(null);
    });
  };

  self.unauth = function() {
    delete window.localStorage['GWSJ_DINKY_PW'];
    password = null;
  };

  self.addPost = function(data, cb) {
    var lastPosts = self.posts;
    request('POST', '/api/posts', data, function(err) {
      if (err) {
        console.log('error adding post', err);
        updatePosts({$set: lastPosts});
      }
      cb(err);
    });
    updatePosts({$push: [data]});
  };

  self.posts = [];

  setInterval(checkForPostUpdates, POLL_INTERVAL);
  checkForPostUpdates();

  return self;
}
