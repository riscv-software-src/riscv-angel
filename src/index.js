import React from 'react';
import ReactDOM from 'react-dom';
import useCPU from './hooks/use-cpu';

const App = () => {
  const cpu = useCPU();

  if (!cpu) {
    return <h1>Loading...</h1>;
  }

  console.log(cpu);

  const rs = cpu.registers.map((reg) => <li>{reg.low_}</li>);

  return (
    <>
      <h1>hello world</h1>
      <ul>
        {rs}
      </ul>
    </>
  );
};

ReactDOM.render(<App />, document.querySelector('#root'));
