
var CommentBox = React.createClass({
    render: function() {
        return (
            <div className="commentBox">
                Hello, world! I am a CommentBox.<br/>
            {this.props.date.toTimeString()}, {this.props.author}
        </div>
    );
}
});

var author = "finley";
React.render(
    <CommentBox date={new Date()} author={author}/>,
    document.getElementById('content')
);
