'use strict';

var reqwest      = require('reqwest');
var $connectForm = document.querySelector('form.connect');
var $dashboard   = document.querySelector('.dashboard');
var $toast       = document.querySelector('.toast');
var Router       = require('ampersand-router');

var router = new (Router.extend({
  routes: {
    '': 'index',
    'connect': 'connect',
    'dashboard/:sqlQuery': 'dashboard',
    'logout': 'logout'
  },

  index: function() {
    router.navigate(localStorage.getItem('connectionString') ? '/dashboard/SELECT * FROM information_schema.tables;' : '/connect', { trigger: true });
  },

  connect: function() {
    $toast.style.opacity = 0;
    $dashboard.style.display = 'none';
    $connectForm.style.display = 'block';
  },

  dashboard: function(sqlQuery) {
    $dashboard.style.display = 'block';
    $connectForm.style.display = 'none';

    if ($dashboard.querySelector('form.sqlQuery textarea').value !== sqlQuery) {
      $dashboard.querySelector('form.sqlQuery textarea').value = sqlQuery;
    }

    localStorage.setItem('sqlQuery', sqlQuery);
    var connectionString = localStorage.getItem('connectionString');
    query(sqlQuery, connectionString, dashboardQueryCallback);
    query('SELECT * FROM information_schema.tables;', connectionString, function(error, result) {
      $dashboard.querySelector('.tables select').innerHTML = result.rows.map(function(table) {
        return '<option data-table-name="' + table.table_name + '" data-table-schema="' + table.table_schema + '">' + table.table_schema + '/' + table.table_name + '</option>';
      });
    });
  },

  logout: function() {
    localStorage.removeItem('connectionString');
    router.navigate('/connect', { trigger: true });
  }
}))();

router.history.start({ pushState: true });



(function _bindEvents() {
  $dashboard.querySelector('.tables select').addEventListener('change', function() {
    var selectedIndex = $dashboard.querySelector('.tables select').selectedIndex;
    var selected = $dashboard.querySelector('.tables select').options[selectedIndex];
    var tableName = selected.dataset.tableName;
    var tableSchema = selected.dataset.tableSchema;
    router.navigate('/dashboard/' + encodeURIComponent('SELECT * FROM ' + tableSchema + '.' + tableName + ';'), { trigger: true });
  });

  $dashboard.querySelector('form.sqlQuery').addEventListener('submit', function(event) {
    event.preventDefault();
    var sqlQuery = $dashboard.querySelector('form.sqlQuery textarea').value;
    router.navigate('/dashboard/' + encodeURIComponent(sqlQuery), { trigger: true });
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

  $dashboard.querySelector('form.sqlQuery textarea').addEventListener('keydown', function(event) {
    if (event.keyCode === 13) {
      if (event.ctrlKey) {
        $dashboard.querySelector('form.sqlQuery textarea').value += '\n';
      } else {
        event.preventDefault();
        $dashboard.querySelector('form.sqlQuery button').click();
      }
    }
  });

  $dashboard.querySelector('table.rows thead').addEventListener('click', function(event) {
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

function dashboardQueryCallback(error, result) {
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
  $dashboard.querySelector('table.rows thead').innerHTML = thead;
  $dashboard.querySelector('table.rows tbody').innerHTML = tbody;
}
