import React, { Component } from 'react';

import { observer, inject } from 'mobx-react'

export default inject('form')(observer(class ErrorDisplay extends Component {
    render() {
        const { form, attribute } = this.props;
        const error = form.errors[attribute];
        return (
            <span>
                {
                        error
                }
            </span>
        )
    }
}))
