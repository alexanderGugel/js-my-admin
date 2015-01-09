'use strict';

var reqwest       = require('reqwest');
var $connectForm  = document.querySelector('form.connect');
var $dashboard    = document.querySelector('.dashboard');
var $logout       = $dashboard.querySelector('.logout');
var $table        = $dashboard.querySelector('table');
var $sqlQueryForm = $dashboard.querySelector('form.sqlQuery');
var $error        = $dashboard.querySelector('.error');
var $toast        = $dashboard.querySelector('.toast');

if (!getConnectionString()) {
  renderConnect();
} else {
  renderDashboard();
}

function getConnectionString() {
  return localStorage.getItem('connectionString');
}

function setConnectionString(connectionString) {
  localStorage.setItem('connectionString', connectionString);
}

function removeConnectionString() {
  localStorage.removeItem('connectionString');
}

function updateUrl(sqlQuery) {
  window.location.hash = sqlQuery;
}

function notify(message) {
  $toast.innerHTML = message;
  $toast.style.opacity = 1;
}

function renderConnect() {
  $dashboard.style.display = 'none';
  $connectForm.style.display = 'block';
  $connectForm.addEventListener('submit', function(event) {
    event.preventDefault();
    var connectionString = $connectForm.querySelector('input').value;
    query('SELECT 1;', connectionString, function(error, rows) {
      if (error) {
        error = JSON.parse(error.response);
        console.error(error);
        $connectForm.querySelector('.error').innerHTML = 'Couldn\'t connect :(';
      } else {
        setConnectionString(connectionString);
        renderDashboard();
      }
    });
  });
}

function renderDashboard() {
  $dashboard.style.display = 'block';
  $connectForm.style.display = 'none';
  $logout.addEventListener('click', function(event) {
    event.preventDefault();
    removeConnectionString();
    renderConnect();
  });
  $sqlQueryForm.addEventListener('submit', function(event) {
    event.preventDefault();
    var sqlQuery = $sqlQueryForm.querySelector('input').value;
    updateUrl(sqlQuery);
    notify(sqlQuery);
    query(sqlQuery, getConnectionString(), dashboardQueryCallback);
  });
  
  var sqlQueryInit;
  if (window.location.hash) {
    sqlQueryInit = window.location.hash.substr(1);
  } else {
    sqlQueryInit = 'SELECT * FROM information_schema.tables;';
  }
  $sqlQueryForm.querySelector('input').value = sqlQueryInit;
  $sqlQueryForm.dispatchEvent(new Event('submit'));
}

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
    success: callback.bind(this, null),
    error: callback.bind(this)
  });
}

function dashboardQueryCallback(error, result) {
  if (error) {
    $error.innerHTML = error.response;
    $error.style.display = 'block';
    console.error(error);
    return;
  }
  $error.innerHTML = '';
  $error.style.display = 'none';
  var thead = '<thead><tr>' + Object.keys(result.rows[0]).map(function (column) {
    return '<th>' + column + '</th>';
  }).join('') + '</tr></thead>';
  var tbody = result.rows.map(function (row) {
    return '<tr>' + Object.keys(row).map(function (column) {
      return '<td>' + row[column] + '</td>';
    }).join('') + '</tr>';
  }).join('');
  $table.innerHTML = thead + tbody;
}
