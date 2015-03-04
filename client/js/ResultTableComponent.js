var React = require('react');

var ResultTableComponent = React.createClass({
  getInitialState: function() {
    return {
      scrollTop: 0
    };
  },
  handleFieldClick: function(field, event) {
    console.log(field.name);
    this.props.router.navigate('/repl/' + encodeURIComponent(this.props.sqlQuery + 'test'), { trigger: true });
  },
  componentDidMount: function() {
    this.getDOMNode().addEventListener('scroll', this.handleScroll);
  },
  componentWillUnmount: function() {
    this.getDOMNode().removeEventListener('scroll', this.handleScroll);
  },
  handleScroll: function(event) {
    this.setState({
      scrollTop: this.getDOMNode().scrollTop
    });
  },
  render: function() {
    var result = this.props.result || {
      fields: [],
      rows: []
    };
    var theadStyle = {
      transform: 'translateY(' + this.state.scrollTop + 'px)'
    };
    return (
      <table className="rows">
        <thead style={theadStyle}>
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
