import React, { PureComponent } from 'react'

import { observe, when } from 'mobx'
import { observer, inject } from 'mobx-react'

import createControllableField from './controllable-field.jsx'

/**
 * Create controlled field using createControllableField
 * @export
 * @param {any} element
 * @param {any} properties
 * @returns
 */
export default function createControlledField (element, properties) {
  const Field = createControllableField(element, properties)

  return class ContorlledField extends PureComponent {
    /**
     * Creates an instance of ContorlledField.
     * @param {any} props 
     */
    constructor (props) {
      super(props)

      this.state = {
        value: ''
      }
    }

    /**
     * Put changes of Field into state
     * @param {any} value 
     */
    handleChange (value) {
      this.setState({ value });
    }

    render () {
      let controlledValue

      if (element === 'checkbox') {
        controlledValue = { checked: this.state.value };
      } else {
        controlledValue = { value: this.state.value };
      }

      const propsForElement = Object.assign({}, this.props)

      delete propsForElement.children
      const elementAttributes = Object.assign(properties.elementAttributes, { name: properties.attribute });
      const elementProps = Object.assign(
        {
          onChange: this.handleChange.bind(this),
        },
        controlledValue,
        elementAttributes,
        propsForElement
      );

      return <Field {...elementProps}>{this.props.children || properties.children || undefined}</Field>
    }
  }
}
