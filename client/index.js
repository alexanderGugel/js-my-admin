'use strict';

var reqwest         = require('reqwest');
var AmpersandRouter = require('ampersand-router');
var $connectForm    = document.querySelector('form.connect');
var $dashboard      = document.querySelector('.dashboard');
var $logout         = $dashboard.querySelector('.logout');
var $table          = $dashboard.querySelector('table');
var $sqlQueryForm   = $dashboard.querySelector('form.sqlQuery');
var $error          = $dashboard.querySelector('.error');
var $toast          = $dashboard.querySelector('.toast');

var router = new (AmpersandRouter.extend({
  routes: {
    '': 'index',
    'connect': 'connect',
    'dashboard/:query': 'dashboard',
    'dashboard': 'dashboard'
  },

  index: function() {
    if (!getConnectionString()) {
      this.redirectTo('connect');
    } else {
      this.redirectTo('dashboard');
    }
  },

  connect: function() {
    var self = this;
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
          self.redirectTo('dashboard');
        }
      });
    });
  },

  dashboard: function(sqlQuery) {
    var self = this;
    $dashboard.style.display = 'block';
    $connectForm.style.display = 'none';
    $logout.addEventListener('click', function(event) {
      event.preventDefault();
      removeConnectionString();
      self.redirectTo('connect');
    });
    $sqlQueryForm.addEventListener('submit', function(event) {
      event.preventDefault();
      var sqlQuery = $sqlQueryForm.querySelector('input').value;
      notify(sqlQuery);
      self.navigate('dashboard/' + sqlQuery);
      query(sqlQuery, getConnectionString(), dashboardQueryCallback);
    });
    
    $sqlQueryForm.querySelector('input').value = sqlQuery || 'SELECT * FROM information_schema.tables;';
    $sqlQueryForm.dispatchEvent(new Event('submit'));
  }
}))();

router.history.start();



function getConnectionString() {
  return localStorage.getItem('connectionString');
}

function setConnectionString(connectionString) {
  localStorage.setItem('connectionString', connectionString);
}

function removeConnectionString() {
  localStorage.removeItem('connectionString');
}

function notify(message) {
  $toast.innerHTML = message;
  $toast.style.opacity = 1;
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
