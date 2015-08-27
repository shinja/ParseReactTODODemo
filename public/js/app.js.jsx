
var APPView = React.createClass({

    onChange: function(e) {
            this.setState({filter: e.target.value});
    },
    onLogout: function() {
        this.setState({login: null});
    },
    onLogin: function (user, err) {
        this.setState({login: user});
    },
    getInitialState: function() {
        return {
            login: Parse.User.current(),
            filter: ""
        };
    },
    render: function() {

        var mainView;
        if(this.state.login) {
            mainView = <div>
            <SearchBar onChange={this.onChange} />
            <LoginUserView onLogout={this.onLogout} />
            <TODOListView  filter={this.state.filter}/>
            </div>;
        } else {
            mainView = <LoginForm onLogin={this.onLogin} />;
        }
        return (
                <div>{mainView}</div>
            );
        }
    });

    $(function () {

        // Initialize Parse with your Parse application javascript keys
        Parse.initialize("y5AltzZ4wwropQLB3QJ95YrWsRcuAloyiBEkhja6",
        "GaVCAhiQhpWW1NLDtqlaY4uUMKa2pc9M8ScRqNY8");

        React.render(<APPView />, document.getElementById('content'));
    });
