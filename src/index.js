import React from 'react';
import ReactDOM from 'react-dom';
import useCPU from './hooks/use-cpu';

class Category extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showComponent: false,
    };
    this._onButtonClick = this._onButtonClick.bind(this);
    this.name = props.name;
    this.registers = props.registers
  }

  _onButtonClick() {
    this.setState({
      showComponent: !this.state.showComponent,
    });
  }

  render() {
    return (
      <div>
        <button onClick={this._onButtonClick}>{this.name}</button>
        {this.state.showComponent ?
           <Registers registers={this.registers}/> :
           null
        }
      </div>
    );
  }
}

const RegisterPanel = (props) => {
  const rs = props.registers.map((reg, i) => <li>{"x" + i + ": "+ reg.low_}</li>);
  return <div>
    <Category registers={rs.slice(0, 5)} name={"Pointers"}/>
    <Category registers={rs.slice(5, 8).concat(rs.slice(28, 32))} name={"Temporary"}> Temporary</Category>
    <Category registers={rs.slice(8, 10).concat(rs.slice(18, 28))} name={"Callee-saved"}> Callee-saved</Category>
    <Category registers={rs.slice(10, 18)} name={"Arguments"}> Arguments </Category>
  </div>
}

const Registers = (props) => {
  return <div>
    {props.registers}
  </div>
}


const App = () => {
  const cpu = useCPU();

  if (!cpu) {
    return <h1>Loading...</h1>;
  }

  console.log(cpu);

  const rs = cpu.registers.map((reg, i) => <li>{"x" + i + ": "+ reg.low_}</li>);
  console.log(rs);

  return (
    <>
      <h1>hello world</h1>
      <RegisterPanel registers={cpu.registers}/>
      {/* <RegisterMenu registers={rs}/>
      <RegisterBoard registers={rs} /> */}
    </>
  );
};

//test

ReactDOM.render(<App />, document.querySelector('#root'));
