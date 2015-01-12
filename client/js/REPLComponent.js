var ResultTableComponent = require('./ResultTableComponent');
var React                = require('react');
var query                = require('./query');

var REPLComponent = React.createClass({
  getInitialState: function() {
    return {
      sqlQuery: this.props.sqlQuery,
      schemasSelection: {
        display: 'none'
      },
      schemasList: [],
      schemasMap: {},
      schemasLoaded: false
    };
  },
  handleChange: function(event) {
    this.setState({
      sqlQuery: this.refs.sqlQuery.getDOMNode().value
    });
  },
  handleKeyDown: function(event) {
    if (event.keyCode === 13) {
      if (event.ctrlKey) {
        this.setState({sqlQuery: this.state.sqlQuery + '\n'});
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
    var rect = event.target.getBoundingClientRect();
    this.setState({
      schemasSelection: {
        display: this.state.schemasSelection.display === 'none' ? 'inline-block' : 'none',
        top: rect.bottom + 'px',
        left: rect.left + 'px'
      }
    });

    if (!this.state.schemasLoaded) {
      query('SELECT * FROM information_schema.tables;', localStorage.getItem('connectionString'), function(error, result) {
        console.log(result.rows[0])
        var schemasMap = {};
        result.rows.forEach(function(row) {
          schemasMap[row.table_schema] = schemasMap[row.table_schema] || [];
          schemasMap[row.table_schema].push(row.table_name);
        });
        var schemasList = Object.keys(schemasMap);
        this.setState({schemasList: schemasList, schemasMap: schemasMap});
      }.bind(this));
    }
  },
  render: function() {
    return (
      <section className="repl">
        <ul className="schema-selection" style={this.state.schemasSelection}>
          <li className="section"><strong>Schemas</strong></li>
          {this.state.schemasList.map(function(schema) {
            return <li key={schema}>{schema}</li>;
          })}
        </ul>
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
          <textarea ref="sqlQuery" autofocus defaultValue={this.props.sqlQuery} onKeyDown={this.handleKeyDown} onChange={this.handleChange}></textarea>
          <div className="right">
            <button type="submit">Query!</button>
          </div>
        </form>
        <ResultTableComponent result={this.props.result} router={this.props.router} sqlQuery={this.props.sqlQuery} />
      </section>
    );
  }
});

module.exports = REPLComponent;
