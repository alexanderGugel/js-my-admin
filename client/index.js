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
    query(sqlQuery, localStorage.getItem('connectionString'), dashboardQueryCallback);
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
        page('/');
      }
    });
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
  var thead = '<thead><tr>' + Object.keys(result.rows[0]).map(function(column) {
    return '<th>' + column + '</th>';
  }).join('') + '</tr></thead>';
  var tbody = result.rows.map(function(row) {
    return '<tr>' + Object.keys(row).map(function(column) {
      return '<td>' + row[column] + '</td>';
    }).join('') + '</tr>';
  }).join('');
  $dashboard.querySelector('table.rows').innerHTML = thead + tbody;
}
