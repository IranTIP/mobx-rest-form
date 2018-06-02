import React from 'react';
import createControlledField from './controlled-field.jsx';

export function Select(properties) {
  const childs = properties.options.map(({ label, value }, i) => {
    return <option key={i} value={value}>{label}</option>;
  });
  
  var selectOptions = Object.create(properties);

  return createControlledField('select', selectOptions, childs);
}
