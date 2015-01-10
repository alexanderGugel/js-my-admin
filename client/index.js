'use strict';

var reqwest      = require('reqwest');
var page         = require('page');
var $connectForm = document.querySelector('form.connect');
var $dashboard   = document.querySelector('.dashboard');
var $toast       = document.querySelector('.toast');



(function _router() {
  page('/', function() {
    page.redirect(localStorage.getItem('connectionString') ? '/dashboard/SELECT * FROM information_schema.tables;' : '/connect');
  });

  page('/connect', function() {
    $toast.style.opacity = 0;
    $dashboard.style.display = 'none';
    $connectForm.style.display = 'block';
  });

  page('/dashboard/:sqlQuery', function(context) {
    var sqlQuery = context.params.sqlQuery;
    $dashboard.style.display = 'block';
    $connectForm.style.display = 'none';
    $dashboard.querySelector('form.sqlQuery textarea').value = sqlQuery;
    localStorage.setItem('sqlQuery', sqlQuery);
    var connectionString = localStorage.getItem('connectionString');
    query(sqlQuery, connectionString, dashboardQueryCallback);
    query('SELECT * FROM information_schema.tables;', connectionString, function(error, result) {
      $dashboard.querySelector('.tables select').innerHTML = result.rows.map(function(table) {
        return '<option data-table-name="' + table.table_name + '" data-table-schema="' + table.table_schema + '">' + table.table_schema + '/' + table.table_name + '</option>';
      });
    });
  });

  page('/logout', function() {
    localStorage.removeItem('connectionString');
    page.redirect('/connect');
  });

  page('*', function() {
    page.redirect('/');
  });

  page();
}());


(function _bindEvents() {
  $dashboard.querySelector('.tables select').addEventListener('change', function(event) {
    var selectedIndex = $dashboard.querySelector('.tables select').selectedIndex;
    var selected = $dashboard.querySelector('.tables select').options[selectedIndex];
    // TODO
  });

  $dashboard.querySelector('form.sqlQuery').addEventListener('submit', function(event) {
    event.preventDefault();
    var sqlQuery = $dashboard.querySelector('form.sqlQuery textarea').value;
    page.redirect('/dashboard/' + sqlQuery);
  });

  $connectForm.addEventListener('submit', function(event) {
    event.preventDefault();
    var connectionString = $connectForm.querySelector('input').value;
    query('SELECT 1;', connectionString, function(error) {
      if (error) {
        error = JSON.parse(error.response);
        $connectForm.querySelector('.error').innerHTML = 'Couldn\'t connect :(';
      } else {
        localStorage.setItem('connectionString', connectionString);
        page.redirect('/');
      }
    });
  });

  $dashboard.querySelector('table.rows thead').addEventListener('click', function(event) {
    var el = event.srcElement;
    if (el.dataset.format) {
      el = el.parentNode;
    }
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
  $toast.classList.add(error ? 'error' : 'success');
  $toast.style.opacity = 1;
  if (error) return;
  var thead = '<tr>' + result.fields.map(function(field) {
    return '<th data-name="' + field.name + '">' + field.name + ' <span class="format" data-format="' + field.format + '">' + field.format + '</span></th>';
  }).join('') + '</tr>';
  var tbody = result.rows.map(function(row) {
    return '<tr>' + Object.keys(row).map(function(column) {
      return '<td>' + row[column] + '</td>';
    }).join('') + '</tr>';
  }).join('');
  $dashboard.querySelector('table.rows thead').innerHTML = thead;
  $dashboard.querySelector('table.rows tbody').innerHTML = tbody;
}
