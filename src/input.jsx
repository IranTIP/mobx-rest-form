import createControlledField from './controlled-field.jsx';
import createControllableField from './controllable-field.jsx';

/**
 * Create MobxRestForm field with given properties.
 * @export
 * @param {any} inputType 
 * @returns 
 */
export default function Input(inputType = 'text') {
  return function (properties) {
    const inputProperties = Object.assign(
      {
        elementAttributes: {}
      },
      properties
    );

    if(inputType !== 'textarea') {
      Object.assign(
        inputProperties.elementAttributes,
        { type: inputType }
      );
    }

    const element = inputType == 'textarea' ? 'textarea' : 'input';

    let fieldFactory

    if(inputProperties.isControllable)
      fieldFactory = createControllableField
    else
      fieldFactory = createControlledField
      
    return fieldFactory(properties.element || element, inputProperties);
  }
}
