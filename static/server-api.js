function ServerAPI() {
  var self = {};
  var password = window.localStorage['GWSJ_DINKY_PW'] || null;

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
    req.send(data ? JSON.stringify(data) : null);
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
      cb(null);
    });
  };

  self.unauth = function() {
    delete window.localStorage['GWSJ_DINKY_PW'];
    password = null;
  };

  self.addPost = function(data) {
    self.posts = React.addons.update(self.posts, {
      $push: [data]
    });

    setTimeout(function() {
      self.onPostsChanged(self.posts);
    }, 100);
  };

  self.posts = [];

  return self;
}
