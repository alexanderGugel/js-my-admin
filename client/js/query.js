var reqwest = require('reqwest');

var query = function(sqlQuery, connectionString, callback) {
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
};

module.exports = query;
