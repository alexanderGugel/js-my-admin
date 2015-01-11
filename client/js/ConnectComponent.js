var React = require('react');
var query = require('./query');

var ConnectComponent = React.createClass({
  getInitialState: function() {
    return {connectionString: 'postgres://alexandergugel@localhost'};
  },
  handleChange: function(event) {
    this.setState({connectionString: this.refs.connectionString.getDOMNode().value, error: ''});
  },
  handleSubmit: function(event) {
    event.preventDefault();
    query('SELECT 1;', this.state.connectionString, function(error) {
      if (error) {
        this.setState({error: ':('});
      } else {
        localStorage.setItem('connectionString', this.state.connectionString);
        this.props.router.navigate('/', { trigger: true });
      }
    }.bind(this));
  },
  render: function() {
    return (
      <form className="connect" onSubmit={this.handleSubmit}>
        <h1><i className="icon ion-ios-bolt"></i> jsMyAdmin</h1>
        <input ref="connectionString" placeholder="connection string" defaultValue={this.state.connectionString} onChange={this.handleChange} />
        <button type="submit">Connect!</button>
        <span className="error">{this.state.error}</span>
      </form>
    );
  }
});

module.exports = ConnectComponent;
