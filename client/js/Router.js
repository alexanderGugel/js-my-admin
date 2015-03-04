var Router           = require('ampersand-router');
var React            = require('react');
var REPLComponent    = require('./REPLComponent');
var ConnectComponent = require('./ConnectComponent');
var query            = require('./query');

var Router = Router.extend({
  routes: {
    '': 'index',
    'connect': 'connect',
    'repl/:sqlQuery': 'repl',
    'logout': 'logout'
  },

  index: function() {
    this.navigate(localStorage.getItem('connectionString') ? '/repl/SELECT * FROM information_schema.tables;' : '/connect', { trigger: true });
  },

  connect: function() {
    React.render(<ConnectComponent router={this} />, document.body);
  },

  repl: function(sqlQuery) {
    var router = this;
    query(sqlQuery, localStorage.getItem('connectionString'), function(error, result) {
      React.render(<REPLComponent router={router} sqlQuery={sqlQuery} error={error} result={result} />, document.body);
    });
  },

  logout: function() {
    localStorage.removeItem('connectionString');
    this.navigate('/connect', { trigger: true });
  }
});

module.exports = Router;
