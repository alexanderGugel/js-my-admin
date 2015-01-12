var Router = require('./Router');

var router = new Router();
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
