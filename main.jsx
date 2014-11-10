(function() {
  var LoginForm = React.createClass({
    mixins: [React.addons.LinkedStateMixin],
    getInitialState: function() {
      return {
        email: '',
        password: ''
      };
    },
    handleSubmit: function(e) {
      e.preventDefault();
      this.props.firebaseRef.authWithPassword({
        email: this.state.email,
        password: this.state.password
      }, function(error, authData) {
        if (error) {
          alert("Invalid credentials!");
        } else {
          this.props.onLogin(authData);
        }
      }.bind(this));
    },
    render: function() {
      return (
        <form onSubmit={this.handleSubmit}>
          <input type="text" className="form-control" valueLink={this.linkState('email')} placeholder="email"/>
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
      var auth = this.props.firebaseRef.getAuth();
      this.props.firebaseRef.push({
        from: auth.uid,
        fromEmail: auth.password.email,
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
        authData: this.props.firebaseRef.getAuth()
      };
    },
    handleLogout: function() {
      this.props.firebaseRef.unauth();
      this.setState({authData: null});
    },
    handleLogin: function(authData) {
      this.setState({authData: authData});
    },
    render: function() {
      var contents;

      if (this.state.authData) {
        contents = (
          <div>
            <CreateForm firebaseRef={this.props.firebaseRef.child('posts')}/>
            <button style={{fontSize: 12, marginTop: 10}} onClick={this.handleLogout}>Log out {this.state.authData.password.email}</button>
          </div>
        );
      } else {
        contents = <LoginForm firebaseRef={this.props.firebaseRef} onLogin={this.handleLogin} />;
      }
      return <div className="container">{contents}</div>;
    }
  });

  function start() {
    var firebaseRef = new Firebase("https://get-well-soon-jess.firebaseio.com/");

    var app = React.render(
      <App firebaseRef={firebaseRef}/>,
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
