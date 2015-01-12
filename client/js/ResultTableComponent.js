var React = require('react');

var ResultTableComponent = React.createClass({
  handleFieldClick: function(field, event) {
    console.log(field.name);
    this.props.router.navigate('/repl/' + encodeURIComponent(this.props.sqlQuery + 'test'), { trigger: true });
  },
  render: function() {
    var result = this.props.result || {
      fields: [],
      rows: []
    };

    return (
      <table className="rows">
        <thead>
          <tr>
            {result.fields.map(function(field) {
              return (
                <th key={field.name} onClick={this.handleFieldClick.bind(this, field)}>
                  {field.name}
                  <span className="format">{field.format}</span>
                </th>
              );
            }.bind(this))}
          </tr>
        </thead>
        <tbody>
          {result.rows.map(function(row, rowId) {
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

module.exports = ResultTableComponent;
