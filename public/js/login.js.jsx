
var  LoginForm = React.createClass({

    propTypes: {
        onLogin:   React.PropTypes.func
    },
    logIn: function(e) {

        e.preventDefault();
        var $node = $(this.getDOMNode());

        $node.find(".login-form input[type='submit']").attr("disabled", "disabled");

        var self = this.getDOMNode();
        var username = React.findDOMNode(this.refs.loginUsername).value.trim();
        var password = React.findDOMNode(this.refs.loginPassword).value.trim();

        Parse.User.logIn(username, password, {
            success: function(user) {
                if(typeof this.props.onLogin === 'function') {
                    this.props.onLogin(user);
                }
            }.bind(this),
            error: function(user, error) {
                if(typeof this.props.onLogin === 'function') {
                    this.props.onLogin(null, error);
                }
                $node.find(".login-form .error").html("Invalid username or password. Please try again.").show();
                $node.find(".login-form input[type='submit']").removeAttr("disabled");
            }.bind(this)
        });

        return;
    },

    signUp: function(e) {

        e.preventDefault();
        var $node = $(this.getDOMNode());
        $node.find(".signup-form input[type='submit']").attr("disabled", "disabled");

        var self = this.getDOMNode();
        var username = React.findDOMNode(this.refs.signupUsername).value.trim();
        var password = React.findDOMNode(this.refs.signupPassword).value.trim();

        Parse.User.signUp(username, password, { ACL: new Parse.ACL() }, {
            success: function(user) {
                if(typeof this.props.onLogin === 'function') {
                    this.props.onLogin(user);
                }
            }.bind(this),
            error: function(user, error) {
                if(typeof this.props.onLogin === 'function') {
                    this.props.onLogin(null, error);
                }
                $node.find(".signup-form .error").html(_.escape(error.message)).show();
                $node.find(".signup-form input[type='submit']").removeAttr("disabled");
            }.bind(this)
        });
        return;
    },

    render: function() {
        return (
            <div>
                <header id="header" />
                <div className="login" onSubmit={this.logIn}>
                    <form className="login-form">
                        <h2>Log In</h2>
                        <div className="error" style={{display: 'none'}} ></div>
                        <input type="text" ref="loginUsername" id="login-username" placeholder="Username" />
                        <input type="password" ref="loginPassword" id="login-password" placeholder="Password" />
                        <input type="submit" value="Log In" />
                    </form>
                    <form className="signup-form" onSubmit={this.signUp}>
                        <h2>Sign Up</h2>
                        <div className="error" style={{display: 'none'}} ></div>
                        <input type="text" ref="signupUsername" id="signup-username" placeholder="Username" />
                        <input type="password" ref="signupPassword" id="signup-password" placeholder="Create a Password" />
                        <input type="submit" value="Sign Up" />
                    </form>
                </div>
            </div>
        );
    }
});
