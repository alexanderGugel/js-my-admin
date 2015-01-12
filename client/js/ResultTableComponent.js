var React = require('react');

var ResultTableComponent = React.createClass({
  componentDidMount: function() {
    window.addEventListener('resize', this.resize);
    this.resize();
  },
  componentWillUnmount: function() {
    window.removeEventListener('resize', this.resize);
  },
  resize: function() {
    var element = this.getDOMNode();
    var rect = element.getBoundingClientRect();
    var height = window.innerHeight - rect.top;
    if (height < 500) {
      height = 500;
      document.body.style.overflow = 'auto';
    } else {
      document.body.style.overflow = 'hidden';
    }
    this.setState({style: {height: height}});
  },
  getInitialState: function() {
    return {style: {height: 0}};
  },
  render: function() {
    var result = this.props.result || {
      fields: [],
      rows: []
    };

    return (
      <table className="rows" style={this.state.style}>
        <thead>
          <tr>
            {result.fields.map(function(field) {
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
