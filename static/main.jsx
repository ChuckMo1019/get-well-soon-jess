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
      if (!this.isValid()) return;
      var post = {
        name: this.state.name,
        url: this.state.url,
        text: this.state.text
      };
      this.setState(this.getInitialState());
      this.props.onSubmit(post, function(err) {
        if (err) {
          this.setState(post);
          window.alert('An error occurred :(');
        }
      }.bind(this));
    },
    isValid: function() {
      return (this.state.name && this.state.text &&
              (!this.state.url || /^https?:\/\//.test(this.state.url)));
    },
    render: function() {
      return (
        <form onSubmit={this.handleSubmit}>
          <p><small>
            You can sign the card below. Your name and message will only be seen by Jess and her good friends and coworkers.
          </small></p>
          <input valueLink={this.linkState('name')} type="text" className="form-control" placeholder="Your name" required/>
          <input valueLink={this.linkState('url')} type="url" className="form-control" placeholder="Your avatar or animated GIF URL (optional)"/>
          <textarea valueLink={this.linkState('text')} className="form-control" rows="10" placeholder="Your message" required></textarea>
          {!this.isValid() ? null
           : <div className="preview">
               <div className="preview-header">Here is a preview of your message:</div>
               <ul className="posts">
                 <Post post={this.state}/>
               </ul>
             </div>}
          <button>Sign The Card!</button>
        </form>
      );
    }
  });

  var Post = React.createClass({
    render: function() {
      var post = this.props.post;

      return (
        <li className="media">
          {post.url
           ? <a href={post.url} target="_blank"><img src={post.url} className="img" style={{width: 64}}/></a>
           : <div className="img" style={{width: 64, height: 64}}></div>}
          <div className="bd">
            {post.text}
            <cite>{post.name}</cite>
          </div>
        </li>
      );
    }
  });

  var PostList = React.createClass({
    render: function() {
      var ReactCSSTransitionGroup = React.addons.CSSTransitionGroup;

      return (
        <ul className="posts">
          <ReactCSSTransitionGroup transitionName="post-effect" transitionLeave={false}>
          {this.props.posts.map(function(post, i) {
            return <Post key={i} post={post}/>
          })}
          </ReactCSSTransitionGroup>
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
    render: function() {
      var contents;

      if (this.state.isLoggedIn) {
        contents = (
          <div>
            <PostList posts={this.state.posts}/>
            <CreateForm onSubmit={this.props.serverAPI.addPost} />
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
            <div className="container">
              {contents}
            </div>
            <aside>
              This mega love bomb was lovingly handcrafted with HTML, CSS, and JS in November 2014.
            </aside>
          </section>
        </div>
      );
    }
  });

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
