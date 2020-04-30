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
    return (
      <div>
        <RegisterCategory regName={name} />
      </div>
    );
  }
  return (
    <div>
      <RegisterCategory regName={name} />
      {registers}
    </div>
  );
};

Category.propTypes = {
  registers: PropTypes.arrayOf(PropTypes.object).isRequired,
  name: PropTypes.string.isRequired,
};

export default Category;
