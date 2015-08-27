
var LoginUserView = React.createClass({

    propTypes: {
        onLogout:   React.PropTypes.func
    },
    logout: function () {
        Parse.User.logOut();
        if(typeof this.props.onLogout === 'function') {
            this.props.onLogout();
        }
    },
    render: function() {
        var username = Parse.User.current().escape("username");
        return (
            <div id="user-info">
                Signed in as {username} (<a href="#" className="log-out" onClick={this.logout}>Log out</a>)
            </div>
        );
    }
});

// Todo Model
// ----------

// Our basic Todo model has `content`, `order`, and `done` attributes.
var Todo = Parse.Object.extend("Todo", {
    // Default attributes for the todo.
    defaults: {
        content: "empty todo...",
        done: false
    },

    // Ensure that each todo created has `content`.
    initialize: function() {
        if (!this.get("content")) {
            this.set({"content": this.defaults.content});
        }
    },

    // Toggle the `done` state of this todo item.
    toggle: function() {
        this.save({done: !this.get("done")});
    }
});

var TODOView = React.createClass({

    toggle: function () {
        var todo = this.state.todo;
        todo.toggle();
    },
    save: function (e) {
        var todo = this.state.todo;
        todo.save({content: e.target.value});
        this.blur(e);
    },
    focus: function (e) {
        var $node = $(this.getDOMNode());
        $node.addClass("editing");
        var todo = this.state.todo;
        this.refs.edit.getDOMNode().value = todo.get("content");
        this.refs.edit.getDOMNode().focus();
    },
    blur: function (e) {
        var $node = $(this.getDOMNode());
        $node.removeClass("editing");
    },
    onChange: function(e) {
        if(e.charCode == 13)
            this.save(e);
    },
    getInitialState: function() {
        return {
            todo: this.props.todo
        };
    },
    componentDidMount: function() {
        var todo = this.state.todo;
        todo.on('change', function() {
            console.log('model change', todo.get("done"), todo.get("content"));
            this.forceUpdate();
        }.bind(this));//bind setState to todo model change event

        todo.on('destroy', function() {
            console.log('model destroy', todo.get("done"), todo.get("content"));
            this.forceUpdate();
        }.bind(this));
    },
    componentWillUnmount: function() {
        var todo = this.state.todo;
        todo.off();//remove event binding.
    },
    render: function() {

        var done = this.state.todo.get("done");

        return (
            <li className={done ? 'completed': '' } >
                <div className="view">
                    <input className="toggle" type="checkbox" checked={done} onChange={this.toggle} />
                    <label className="todo-content" onDoubleClick={this.focus} >{this.state.todo.get('content')}</label>
                    <button className="todo-destroy" onClick={this.props.destroy}/>
                </div>
                <input  ref="edit" className="edit" defaultValue={this.state.todo.get('content')} onBlur={this.blur} onKeyPress={this.onChange} />
            </li>
        );
    }
});

// Todo Collection
// ---------------

var TodoList = Parse.Collection.extend({

    // Reference to this collection's model.
    model: Todo,

    // Filter down the list of all todo items that are finished.
    done: function() {
        return this.filter(function(todo){ return todo.get('done'); });
    },

    // Filter down the list to only todo items that are still not finished.
    remaining: function() {
        return this.without.apply(this, this.done());
    },

    // We keep the Todos in sequential order, despite being saved by unordered
    // GUID in the database. This generates the next order number for new items.
    nextOrder: function() {
        if (!this.length) return 1;
        return this.last().get('order') + 1;
    },

    // Todos are sorted by their original insertion order.
    comparator: function(todo) {
        return todo.get('order');
    }
});

var TODOListView = React.createClass({

    createOnEnter: function(e) {

        if (e.charCode != 13) return;

        var todos = this.state.todos;
        todos.create({
            done:  false,
            content: e.target.value,
            order: todos.nextOrder(),
            user: Parse.User.current(),
            ACL: new Parse.ACL(Parse.User.current())
        });
        this.refs.newTODO.getDOMNode().value = '';
    },
    remove: function(cid) {
        var todo = this.state.todos.getByCid(cid);
        todo.destroy();//will notify collection to remove
        this.forceUpdate();
    },
    toggleAllComplete: function(e) {
        var done = e.target.checked;
        this.state.todos.each(function (todo) {
            todo.save({done: done});
        });
    },
    getInitialState: function() {
        return {
            todos: new TodoList
        };
    },
    componentDidMount: function() {

        var todos = this.state.todos;
        // Setup the query for the collection to look for todos from the current user
        todos.query = new Parse.Query(Todo);
        todos.query.equalTo("user", Parse.User.current());
        todos.fetch({
            success: function(collection, response, options) {

                collection.on('sync', function() {
                    this.forceUpdate();
                }.bind(this));

                this.setState({todos: collection});
            }.bind(this),
            error: function(collection, response, options) {
                this.setState({todos: collection});
            }.bind(this)
        });
    },
    componentWillUnmount: function() {
            this.state.todos.off();
    },
    render: function() {

        var todos = this.state.todos;

        var items = todos.filter(function(todo) {
            var filter = this.props.filter || "";
            return todo.get("content").match(filter);
        }.bind(this)).map(function (item, i) {
            //MUST using cid in here, using id would cause 'undefined' error while using collection.get(id).
            return( <TODOView key={item.cid} todo={item} destroy={this.remove.bind(this, item.cid)} /> );
        }.bind(this));

        if(items.length <= 0) {
            items = React.createElement('img', {src: "images/spinner.gif", className:"spinner"});
        }
        return (
            <div className="section">
                <header id="header">
                    <input ref="newTODO" id="new-todo" placeholder="What needs to be done?" type="text" onKeyPress={this.createOnEnter} />
                </header>
                <div id="main">
                    <input id="toggle-all" type="checkbox" onChange={this.toggleAllComplete}/>
                    <label htmlFor="toggle-all">Mark all as complete</label>
                    <ul id="todo-list">
                        {items}
                    </ul>
                </div>
                <div id="todo-stats" ></div>
            </div>
        );
    }
});

// This is the transient application state, not persisted on Parse
var AppState = Parse.Object.extend("AppState", {
    defaults: {
        filter: "all"
    }
});
