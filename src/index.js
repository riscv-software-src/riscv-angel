import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import useCPU from './hooks/use-cpu';

class Category extends React.Component {
  constructor({ registers, name }) {
    super({ registers, name });
    this.state = {
      showComponent: false,
    };
    this._onButtonClick = this._onButtonClick.bind(this);
    this.name = name;
    this.registers = registers;
  }

  _onButtonClick() {
    this.setState((prevState) => ({ showComponent: !prevState.showComponent }));
  }

  render() {
    const { showComponent } = this.state;
    return (
      <div>
        <button type="submit" onClick={this._onButtonClick}>{this.name}</button>
        {showComponent
          ? <Registers registers={this.registers} />
          : null}
      </div>
    );
  }
}

Category.propTypes = {
  registers: PropTypes.arrayOf.isRequired,
  name: PropTypes.string,
};

Category.defaultProps = {
  name: undefined,
};

const RegisterPanel = ({ registers }) => {
  const rs = registers.map((reg, i) => (
    <li>
      x
      { i }
      :
      { reg.low_}
    </li>
  ));
  return (
    <div>
      <Category registers={rs.slice(0, 5)} name="Pointers" />
      <Category registers={rs.slice(5, 8).concat(rs.slice(28, 32))} name="Temporary" />
      <Category registers={rs.slice(8, 10).concat(rs.slice(18, 28))} name="Callee-saved" />
      <Category registers={rs.slice(10, 18)} name="Arguments" />
    </div>
  );
};

RegisterPanel.propTypes = {
  registers: PropTypes.arrayOf.isRequired,
};

const Registers = ({ registers }) => (
  <div>
    {registers}
  </div>
);

Registers.propTypes = {
  registers: PropTypes.arrayOf.isRequired,
};


const App = () => {
  const cpu = useCPU();

  if (!cpu) {
    return <h1>Loading...</h1>;
  }

  console.log(cpu);

  return (
    <>
      <h1>hello world</h1>
      <RegisterPanel registers={cpu.registers} />
    </>
  );
};

ReactDOM.render(<App />, document.querySelector('#root'));
