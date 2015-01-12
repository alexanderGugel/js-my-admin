var ResultTableComponent = require('./ResultTableComponent');
var React                = require('react');

var REPLComponent = React.createClass({
  getInitialState: function() {
    return {
      sqlQuery: this.props.sqlQuery
    };
  },
  handleChange: function(event) {
    this.setState({sqlQuery: this.refs.newSqlQuery.getDOMNode().value});
  },
  handleKeyDown: function(event) {
    if (event.keyCode === 13) {
      if (event.ctrlKey) {
        this.setState({sqlQuery: this.state.newSqlQuery + '\n'});
      } else {
        event.preventDefault();
        this.handleSubmit();
      }
    }
  },
  handleSubmit: function(event) {
    if (event) event.preventDefault();
    this.props.router.navigate('/repl/' + encodeURIComponent(this.state.sqlQuery), { trigger: true });
  },
  handleSchemasClick: function(event) {
    
  },
  render: function() {
    return (
      <section className="repl">
        <nav className="row">
          <div className="col-md-4 schemas">
            <button onClick={this.handleSchemasClick}>Schemas</button>
          </div>
          <div className="col-md-4 logo">
            <a href="/"><i className="icon ion-ios-bolt"></i> jsMyAdmin</a>
          </div>
          <div className="col-md-4 logout">
            <a href="/logout"><button>Logout</button></a>
          </div>
        </nav>
        <form className="sqlQuery" onSubmit={this.handleSubmit}>
          <textarea ref="newSqlQuery" autofocus defaultValue={this.state.sqlQuery} onKeyDown={this.handleKeyDown} onChange={this.handleChange}></textarea>
          <div className="right">
            <button type="submit">Query!</button>
          </div>
        </form>
        <ResultTableComponent result={this.props.result} />
      </section>
    );
  }
});

module.exports = REPLComponent;
