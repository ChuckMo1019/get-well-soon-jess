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
            <p><em>More stuff will be here soon!</em></p>
            <button onClick={this.handleLogout}>Log out {this.state.authData.password.email}</button>
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

    React.render(
      <App firebaseRef={firebaseRef}/>,
      document.getElementById('app')
    );
  }

  if (document.readyState == 'loading')
    document.addEventListener('DOMContentLoaded', start, false);
  else
    start();
})();
