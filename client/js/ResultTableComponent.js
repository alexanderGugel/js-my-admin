var React = require('react');

var ResultTableComponent = React.createClass({
  render: function() {
    var result = this.props.result || {};

    return (
      <table className="rows">
        <thead>
          <tr>
            {(result.fields || []).map(function(field) {
              return (
                <th key={field.name}>
                  {field.name}
                  <span className="format">{field.format}</span>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {(result.rows || []).map(function(row, rowId) {
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
