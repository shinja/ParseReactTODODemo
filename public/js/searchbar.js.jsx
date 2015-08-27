
var SearchBar = React.createClass({

    getInitialState: function() {
        return {
            value: ""
        };
    },
    render: function() {
        return (
            <div id="new-todo">
                <input type="text" className="edit" defaultValue={this.state.value} placeholder="search todos..." onChange={this.props.onChange}/>
            </div>
        );
    }
});
