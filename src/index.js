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
  const rs = props.registers.map((reg) => <li>{reg.low_}</li>);
  return <div>
    <Category registers={rs} name={"Pointers"}/>
    <Category> Temporary</Category>
    <Category> Callee-saved</Category>
    <Category> Arguments </Category>
  </div>
}

const Registers = (props) => {
  return <div>
    {props.registers}
  </div>
}

const showRegisters = (registers) => {
  console.log("in showRegisters");
  return <div>
    <p> does this work?</p>
  </div>
}

const RegisterMenu = (props) => {
  return <div>
    <button onClick={() => showRegisters(props.registers[0])}> Pointers </button>
    <button>Temporary Registers</button>
    <button>Callee-saved Registers</button>
    <button>Argument Registers</button>
  </div>
}


const RegisterBoard = (props) => {
  //.map((reg) => <li>{reg.low_}</li>);

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

  const rs = cpu.registers.map((reg) => <li>{reg.low_}</li>);
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

ReactDOM.render(<App />, document.querySelector('#root'));
