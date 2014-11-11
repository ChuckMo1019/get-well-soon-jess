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
        text: ''
      };
    },
    handleSubmit: function(e) {
      e.preventDefault();
      if (!this.state.text) return;
      this.props.serverAPI.push({
        text: this.state.text
      });
      this.setState({text: ''});
      alert("Thanks for your submission!");
    },
    render: function() {
      return (
        <form onSubmit={this.handleSubmit}>
          <p><small>
            You can sign the card below!
            And you can sign it multiple times!
            Heck, you can even use unsanitized HTML, go nuts.
          </small></p>
          <textarea valueLink={this.linkState('text')} className="form-control" rows="10"></textarea>
          <button>Sign The Card!</button>
        </form>
      );
    }
  });

  var App = React.createClass({
    getInitialState: function() {
      return {
        isLoggedIn: this.props.serverAPI.getAuth()
      };
    },
    handleLogout: function() {
      this.props.serverAPI.unauth();
      this.setState({isLoggedIn: false});
    },
    handleLogin: function() {
      this.setState({isLoggedIn: true});
    },
    render: function() {
      var contents;

      if (this.state.isLoggedIn) {
        contents = (
          <div>
            <CreateForm serverAPI={this.props.serverAPI}/>
            <button style={{fontSize: 12, marginTop: 10}} onClick={this.handleLogout}>Log out</button>
          </div>
        );
      } else {
        contents = <LoginForm serverAPI={this.props.serverAPI} onLogin={this.handleLogin} />;
      }
      return <div className="container">{contents}</div>;
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
