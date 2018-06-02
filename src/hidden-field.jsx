import React, { PureComponent } from 'react'

import { observer, inject } from 'mobx-react'

import createControllableField from './controllable-field.jsx'

export default function Hidden(properties) {
    const Field = createControllableField(
        'input',
        Object.assign(
            {},
            properties,
            {
                elementAttributes: {
                    type: 'hidden',
                },
                value: undefined
            }
        )
    )

    class HiddenField extends PureComponent {
        render() {
            const value = this.props.value === undefined ? properties.value || undefined : this.props.value

            return <Field value={value} onChange={this.props.onChange}/>
        }
    }

    return HiddenField
}
