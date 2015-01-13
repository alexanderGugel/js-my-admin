var ResultTableComponent = require('./ResultTableComponent');
var React                = require('react');
var query                = require('./query');

var REPLComponent = React.createClass({
  getInitialState: function() {
    return {
      sqlQuery: this.props.sqlQuery,
      terminalVisible: false,
      schemaSelectionVisible: false,
      schemaSelectionRect: {},
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
    this.setState({
      schemaSelectionVisible: !this.state.schemaSelectionVisible,
      schemaSelectionRect: event.target.getBoundingClientRect()
    });

    if (!this.state.schemasLoaded) {
      query('SELECT * FROM information_schema.tables;', localStorage.getItem('connectionString'), function(error, result) {
        console.log(result.rows[0]);
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
  handleTerminalClick: function(event) {
    this.setState({
      terminalVisible: !this.state.terminalVisible
    });
  },
  handleLogoutClick: function(event) {
    this.props.router.navigate('logout', {trigger: true});
  },
  render: function() {
    var terminalStyle = {
      display: this.state.terminalVisible ? 'block' : 'none'
    };
    var schemaSelectionStyle = {
      top: this.state.schemaSelectionRect.bottom + 'px',
      left: this.state.schemaSelectionRect.left + 'px',
      display: this.state.schemaSelectionVisible ? 'block' : 'none'
    };
    var terminalButtonStyle = {
      opacity: this.state.terminalVisible ? 0.5 : 1
    };
    var schemaSelectionButtonStyle = {
      opacity: this.state.schemaSelectionVisible ? 0.5 : 1
    };
    return (
      <section className="repl">
        <ul className="schema-selection" style={schemaSelectionStyle}>
          <li className="section"><strong>Schemas</strong></li>
          {this.state.schemasList.map(function(schema) {
            return <li key={schema}>{schema}</li>;
          })}
        </ul>
        <nav className="row">
          <div className="col-md-4 schemas">
            <button onClick={this.handleSchemasClick} style={schemaSelectionButtonStyle}>Schemas</button>
          </div>
          <div className="col-md-4 logo">
            <a href="/"><i className="icon ion-ios-bolt"></i> jsMyAdmin</a>
          </div>
          <div className="col-md-4">
            <button style={terminalButtonStyle} onClick={this.handleTerminalClick}>SQL Terminal</button>
            <button onClick={this.handleLogoutClick}>Logout</button>
          </div>
        </nav>
        <form style={terminalStyle} className="terminal" onSubmit={this.handleSubmit}>
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
