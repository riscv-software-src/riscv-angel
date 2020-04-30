import React from 'react';
import PropTypes from 'prop-types';
import Category from './Category';
import {
  Pointers,
  Temporary,
  CalleeSaved,
  Arguments,
} from '../utils/constants';

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
      <Category registers={rs.slice(Pointers.start, Pointers.end)} name="Pointers" />
      <Category registers={rs.slice(Temporary[0].start, Temporary[0].end).concat(rs.slice(Temporary[1].start, Temporary[1].end))} name="Temporary" />
      <Category registers={rs.slice(CalleeSaved[0].start, CalleeSaved[0].end).concat(rs.slice(CalleeSaved[1].start, CalleeSaved[1].end))} name="Callee-saved" />
      <Category registers={rs.slice(Arguments.start, Arguments.end)} name="Arguments" />
    </div>
  );
};

RegisterPanel.propTypes = {
  registers: PropTypes.arrayOf(PropTypes.shape({
    low_: PropTypes.number,
    high_: PropTypes.number,
  })).isRequired,
};

const Registers = ({ registers }) => (
  <div>
    {registers}
  </div>
);

Registers.propTypes = {
  registers: PropTypes.arrayOf(PropTypes.shape({
    low_: PropTypes.number,
    high_: PropTypes.number,
  })).isRequired,
};

export default RegisterPanel;
