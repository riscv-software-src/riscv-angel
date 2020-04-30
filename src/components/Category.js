import React, { useState } from 'react';
import PropTypes from 'prop-types';

const Category = ({ registers, name }) => {
  const [showButton, setShowButton] = useState(false);

  const RegisterCategory = ({ regName }) => (
    <button type="submit" onClick={() => setShowButton(!showButton)}>
      {regName}
    </button>
  );

  RegisterCategory.propTypes = {
    regName: PropTypes.string.isRequired,
  };

  if (!showButton) {
    return (<RegisterCategory regName={name} />);
  }
  return (
    <>
      <RegisterCategory regName={name} />
      {registers}
    </>
  );
};

Category.propTypes = {
  registers: PropTypes.arrayOf(PropTypes.object).isRequired,
  name: PropTypes.string.isRequired,
};

export default Category;
