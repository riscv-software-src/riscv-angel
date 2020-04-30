import React from 'react';
import PropTypes from 'prop-types';
import Category from './Category';

const RegisterPanel = ({ registers }) => {
  const rs = registers.map((reg, i) => (
    <li key={`{register-${i.toString()}}`}>
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
  registers: PropTypes.arrayOf(PropTypes.object).isRequired,
};

const Registers = ({ registers }) => (
  <div>
    {registers}
  </div>
);

Registers.propTypes = {
  registers: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default RegisterPanel;
