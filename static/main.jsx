(function() {
  var LoginForm = React.createClass({
    mixins: [React.addons.LinkedStateMixin],
    getInitialState: function() {
      return {
        password: ''
      };
    },
    handleSubmit: function(e) {
      e.preventDefault();
      this.props.serverAPI.auth({
        password: this.state.password
      }, function(error) {
        if (error) {
          alert("Invalid credentials!");
        } else {
          this.props.onLogin();
        }
      }.bind(this));
    },
    render: function() {
      return (
        <form onSubmit={this.handleSubmit}>
          <input type="password" className="form-control" valueLink={this.linkState('password')} placeholder="password"/>
          <button>Log in to see more</button>
        </form>
      );
    }
  });

  var CreateForm = React.createClass({
    mixins: [React.addons.LinkedStateMixin],
    getInitialState: function() {
      return {
        name: '',
        url: '',
        text: ''
      };
    },
    handleSubmit: function(e) {
      e.preventDefault();
      if (!this.state.name || !this.state.text) return;
      this.props.onSubmit({
        name: this.state.name,
        url: this.state.url,
        text: this.state.text
      });
      this.setState(this.getInitialState());
    },
    render: function() {
      return (
        <form onSubmit={this.handleSubmit}>
          <p><small>
            You can sign the card below. Your name and message will be seen by Jess and her good friends and coworkers.
          </small></p>
          <input valueLink={this.linkState('name')} type="text" className="form-control" placeholder="Your name" required/>
          <input valueLink={this.linkState('url')} type="text" className="form-control" placeholder="Your animated GIF URL (optional)"/>
          <textarea valueLink={this.linkState('text')} className="form-control" rows="10" placeholder="Your message" required></textarea>
          <button>Sign The Card!</button>
        </form>
      );
    }
  });

  var PostList = React.createClass({
    render: function() {
      return (
        <ul className="post-list">
          {this.props.posts.map(function(post) {
            return <li>{post.text}</li>
          })}
        </ul>
      );
    }
  });

  var App = React.createClass({
    getInitialState: function() {
      return {
        isLoggedIn: this.props.serverAPI.getAuth(),
        posts: this.props.serverAPI.posts
      };
    },
    componentWillMount: function() {
      this.props.serverAPI.onPostsChanged = function(posts) {
        this.setState({posts: posts});
      }.bind(this);
    },
    componentWillUnmount: function() {
      this.props.serverAPI.onPostsChanged = null;
    },
    handleLogout: function() {
      this.props.serverAPI.unauth();
      this.setState({isLoggedIn: false});
    },
    handleLogin: function() {
      this.setState({isLoggedIn: true});
    },
    handleCreateFormSubmit: function(data) {
      this.props.serverAPI.addPost(data);
    },
    render: function() {
      var contents;

      if (this.state.isLoggedIn) {
        contents = (
          <div>
            <CreateForm onSubmit={this.handleCreateFormSubmit} />
            <button style={{fontSize: 12, marginTop: 10}} onClick={this.handleLogout}>Log out</button>
          </div>
        );
      } else {
        contents = <LoginForm serverAPI={this.props.serverAPI} onLogin={this.handleLogin} />;
      }
      return (
        <div className="content">
          <header>Get Well Soon, Jess!!</header>
          <section>
            <img src="lovebomb.svg" className="lovebomb" alt="Love Bomb"/>
            <p className="big">
              We're sorry to hear you aren't
              feeling well and hope you get better soon.
            </p>
            <div className="container">{contents}</div>
            <PostList posts={this.state.posts}/>
            <aside>
              This bomb was lovingly handcrafted with HTML and CSS in November 2014.
            </aside>
          </section>
        </div>
      );
    }
  });

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

  function start() {
    var app = React.render(
      <App serverAPI={ServerAPI()}/>,
      document.getElementById('app')
    );

    // For console debugging only!
    window.app = app;
  }

  if (document.readyState == 'loading')
    document.addEventListener('DOMContentLoaded', start, false);
  else
    start();
})();
