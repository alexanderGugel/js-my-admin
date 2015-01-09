var pg         = require('pg');
var express    = require('express');
var bodyParser = require('body-parser');

var query = function (connectionString, sqlQuery, callback) {
  pg.connect(connectionString, function (error, client, done) {
    if (error) return callback(error);
    client.query(sqlQuery, function (error, result) {
      // call `done()` to release the client back to the pool
      done();
      if (error) return callback(error);
      callback(null, result.rows);
    });
  });
};


var router = new express.Router();
router.use(bodyParser.json());
router.post('/', function(req, res) {
  if (!req.body.connectionString) {
    return res.status(400).send({ error: 'Missing connectionString', sqlQuery: req.body.sqlQuery });
  }
  if (!req.body.sqlQuery) {
    return res.status(400).send({ error: 'Missing sqlQuery', sqlQuery: req.body.sqlQuery });
  }
  query(req.body.connectionString, req.body.sqlQuery, function (error, rows) {
    if (error) {
      return res.status(400).send({ error: error });
    }
    res.json({ rows: rows, sqlQuery: req.body.sqlQuery });
  });
});

module.exports = router;
