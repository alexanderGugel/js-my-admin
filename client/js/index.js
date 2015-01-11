'use strict';

var reqwest          = require('reqwest');
var Router           = require('ampersand-router');
var React            = require('react');

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
        router.navigate('/', { trigger: true });
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

var ResultTableComponent = React.createClass({
  render: function() {
    var result = this.props.result || {};

    return (
      <table className="rows">
        <thead>
          <tr>
            {(result.fields || []).map(function(field) {
              return (
                <th key={field.name}>
                  {field.name}
                  <span className="format">{field.format}</span>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {(result.rows || []).map(function(row, rowId) {
            return (
              <tr key={rowId}>
                {Object.keys(row).map(function(field, fieldId) {
                  return <td key={fieldId}>{row[field]}</td>
                })}
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  }
});

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
    router.navigate('/repl/' + encodeURIComponent(this.state.sqlQuery), { trigger: true });
  },
  render: function() {
    return (
      <section className="repl">
        <nav className="row">
          <div className="col-md-4 schemas">
            <button>Schemas</button>
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
          <div className="row">
            <div className="col-md-6">
            </div>
            <div className="col-md-6 right">
              <button type="submit">Query!</button>
            </div>
          </div>
        </form>
        <ResultTableComponent result={this.props.result} />
      </section>
    );
  }
});




function query(sqlQuery, connectionString, callback) {
  reqwest({
    url: '/db',
    method: 'post',
    type: 'json',
    contentType: 'application/json',
    data: JSON.stringify({
      connectionString: connectionString,
      sqlQuery: sqlQuery
    }),
    success: callback.bind(null, null),
    error: callback.bind(null)
  });
}


var router = new (Router.extend({
  routes: {
    '': 'index',
    'connect': 'connect',
    'repl/:sqlQuery': 'repl',
    'logout': 'logout'
  },

  index: function() {
    router.navigate(localStorage.getItem('connectionString') ? '/repl/SELECT * FROM information_schema.tables;' : '/connect', { trigger: true });
  },

  connect: function() {
    React.render(<ConnectComponent />, document.body);
  },

  repl: function(sqlQuery) {
    query(sqlQuery, localStorage.getItem('connectionString'), function(error, result) {
      React.render(<REPLComponent sqlQuery={sqlQuery} error={error} result={result} />, document.body);
    }.bind(this));
  },

  logout: function() {
    localStorage.removeItem('connectionString');
    router.navigate('/connect', { trigger: true });
  }
}))();

router.history.start({ pushState: true });



// (function _bindEvents() {
//   var schemasButton = $repl.querySelector('.schemas button');
//   var schemasContainerVisible = false;

//   schemasButton.addEventListener('click', function(event) {
//     if (!schemasContainerVisible) {
//       query('SELECT * FROM information_schema.tables;', localStorage.getItem('connectionString'), function(error, result) {
//         var schemas = {};
//         result.rows.forEach(function(row) {
//           schemas[row.table_schema] = schemas[row.table_schema] || [];
//           schemas[row.table_schema].push(row.table_name);
//         });
//         var html = '';
//         for (var schema in schemas) {
//           html += '<li class="schema">';
//           html += '<strong>' + schema + '</strong>';
//           html += '<ul class="tables">';
//           html += schemas[schema].map(function(table) {
//             return '<li class="table" data-table-name="' + table + '" data-table-schema="' + schema + '">' + table + '</li>';
//           }).join(' ');
//           html += '</ul>';
//           html += '</li>';
//         }
//         schemasContainer.innerHTML = html;
//         // schemasContainer.innerHTML = result.rows.map(function(table) {
//         //   return '<li data-table-name="' + table.table_name + '" data-table-schema="' + table.table_schema + '">' + table.table_schema + ':' + table.table_name + '</li>';
//         // }).join('');
//       });


//       schemasContainer.style.display = 'inline-block';
//       var rect = schemasButton.getBoundingClientRect();
//       schemasContainer.style.top = rect.bottom + 'px';
//       schemasContainer.style.left = rect.left + 'px';
//     } else {
//       schemasContainer.style.display = 'none';
//     }
//     schemasContainerVisible = !schemasContainerVisible;
//   });

//   // });
//   // $repl.querySelector('.tables select').addEventListener('change', function() {
//   //   var selectedIndex = $repl.querySelector('.tables select').selectedIndex;
//   //   var selected = $repl.querySelector('.tables select').options[selectedIndex];
//   //   var tableName = selected.dataset.tableName;
//   //   var tableSchema = selected.dataset.tableSchema;
//   //   router.navigate('/repl/' + encodeURIComponent('SELECT * FROM ' + tableSchema + '.' + tableName + ';'), { trigger: true });
//   // });

//   $repl.querySelector('table.rows thead').addEventListener('click', function(event) {
//     var el = event.srcElement;
//     if (el.dataset.format) {
//       el = el.parentNode;
//     }

//     console.log(el.dataset.field)
//     // var sqlQuery = localStorage.getItem('sqlQuery');
//   });
// }());










// function replQueryCallback(error, result) {
//   $toast.innerHTML = error ? error.response : localStorage.getItem('sqlQuery');
//   $toast.classList.remove('success');
//   $toast.classList.remove('error');
//   $toast.classList.add(error ? 'error' : 'success');
//   $toast.style.opacity = 1;
//   if (error) return;
//   var thead = '<tr>' + result.fields.map(function(field) {
//     return '<th data-field="' + field.name + '">' + field.name + ' <span class="format" data-format="' + field.format + '">' + field.format + '</span></th>';
//   }).join('') + '</tr>';
//   var tbody = result.rows.map(function(row) {
//     return '<tr>' + Object.keys(row).map(function(column) {
//       return '<td>' + row[column] + '</td>';
//     }).join('') + '</tr>';
//   }).join('');
//   $repl.querySelector('table.rows thead').innerHTML = thead;
//   $repl.querySelector('table.rows tbody').innerHTML = tbody;
// }
