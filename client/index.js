'use strict';

var reqwest      = require('reqwest');
var $connectForm = document.querySelector('form.connect');
var $repl   = document.querySelector('.repl');
var $toast       = document.querySelector('.toast');
var Router       = require('ampersand-router');
var schemasContainer = document.querySelector('.schemas-container');

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
    $toast.style.opacity = 0;
    $repl.style.display = 'none';
    $connectForm.style.display = 'block';
  },

  repl: function(sqlQuery) {
    $repl.style.display = 'block';
    $connectForm.style.display = 'none';

    if ($repl.querySelector('form.sqlQuery textarea').value !== sqlQuery) {
      $repl.querySelector('form.sqlQuery textarea').value = sqlQuery;
    }

    localStorage.setItem('sqlQuery', sqlQuery);
    query(sqlQuery, localStorage.getItem('connectionString'), replQueryCallback);
  },

  logout: function() {
    localStorage.removeItem('connectionString');
    router.navigate('/connect', { trigger: true });
  }
}))();

router.history.start({ pushState: true });



(function _bindEvents() {
  var schemasButton = $repl.querySelector('.schemas button');
  var schemasContainerVisible = false;

  schemasButton.addEventListener('click', function(event) {
    if (!schemasContainerVisible) {
      query('SELECT * FROM information_schema.tables;', localStorage.getItem('connectionString'), function(error, result) {
        var schemas = {};
        result.rows.forEach(function(row) {
          schemas[row.table_schema] = schemas[row.table_schema] || [];
          schemas[row.table_schema].push(row.table_name);
        });
        var html = '';
        for (var schema in schemas) {
          html += '<li class="schema">';
          html += '<strong>' + schema + '</strong>';
          html += '<ul class="tables">';
          html += schemas[schema].map(function(table) {
            return '<li class="table" data-table-name="' + table + '" data-table-schema="' + schema + '">' + table + '</li>';
          }).join(' ');
          html += '</ul>';
          html += '</li>';
        }
        schemasContainer.innerHTML = html;
        // schemasContainer.innerHTML = result.rows.map(function(table) {
        //   return '<li data-table-name="' + table.table_name + '" data-table-schema="' + table.table_schema + '">' + table.table_schema + ':' + table.table_name + '</li>';
        // }).join('');
      });


      schemasContainer.style.display = 'inline-block';
      var rect = schemasButton.getBoundingClientRect();
      schemasContainer.style.top = rect.bottom + 'px';
      schemasContainer.style.left = rect.left + 'px';
    } else {
      schemasContainer.style.display = 'none';
    }
    schemasContainerVisible = !schemasContainerVisible;
  });

  // });
  // $repl.querySelector('.tables select').addEventListener('change', function() {
  //   var selectedIndex = $repl.querySelector('.tables select').selectedIndex;
  //   var selected = $repl.querySelector('.tables select').options[selectedIndex];
  //   var tableName = selected.dataset.tableName;
  //   var tableSchema = selected.dataset.tableSchema;
  //   router.navigate('/repl/' + encodeURIComponent('SELECT * FROM ' + tableSchema + '.' + tableName + ';'), { trigger: true });
  // });

  $repl.querySelector('form.sqlQuery').addEventListener('submit', function(event) {
    event.preventDefault();
    var sqlQuery = $repl.querySelector('form.sqlQuery textarea').value;
    router.navigate('/repl/' + encodeURIComponent(sqlQuery), { trigger: true });
  });

  $connectForm.addEventListener('submit', function (event) {
    event.preventDefault();
    var connectionString = $connectForm.querySelector('input').value;
    query('SELECT 1;', connectionString, function(error) {
      if (error) {
        error = JSON.parse(error.response);
        $connectForm.querySelector('.error').innerHTML = 'Couldn\'t connect :(';
      } else {
        localStorage.setItem('connectionString', connectionString);
        router.navigate('/', { trigger: true });
      }
    });
  });

  $repl.querySelector('form.sqlQuery textarea').addEventListener('keydown', function(event) {
    if (event.keyCode === 13) {
      if (event.ctrlKey) {
        $repl.querySelector('form.sqlQuery textarea').value += '\n';
      } else {
        event.preventDefault();
        $repl.querySelector('form.sqlQuery button').click();
      }
    }
  });

  $repl.querySelector('table.rows thead').addEventListener('click', function(event) {
    var el = event.srcElement;
    if (el.dataset.format) {
      el = el.parentNode;
    }

    console.log(el.dataset.field)
    // var sqlQuery = localStorage.getItem('sqlQuery');
  });
}());










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

function replQueryCallback(error, result) {
  $toast.innerHTML = error ? error.response : localStorage.getItem('sqlQuery');
  $toast.classList.remove('success');
  $toast.classList.remove('error');
  $toast.classList.add(error ? 'error' : 'success');
  $toast.style.opacity = 1;
  if (error) return;
  var thead = '<tr>' + result.fields.map(function(field) {
    return '<th data-field="' + field.name + '">' + field.name + ' <span class="format" data-format="' + field.format + '">' + field.format + '</span></th>';
  }).join('') + '</tr>';
  var tbody = result.rows.map(function(row) {
    return '<tr>' + Object.keys(row).map(function(column) {
      return '<td>' + row[column] + '</td>';
    }).join('') + '</tr>';
  }).join('');
  $repl.querySelector('table.rows thead').innerHTML = thead;
  $repl.querySelector('table.rows tbody').innerHTML = tbody;
}
