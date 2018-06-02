import React, { PureComponent } from 'react'

import { observe, when } from 'mobx'

import { observer, inject } from 'mobx-react'

/**
 * Create ControllableField with given properties.
 * @export
 * @param {any} element
 * @param {any} properties 
 * @returns {ControllableField}
 */
export default function createControllableField (element, properties) {
    return inject('form')(observer(class ControllableField extends PureComponent {
        /**
         * Creates an instance of ControllableField and save intial value into FormStore.
         * @param {any} props 
         */
        constructor (props) {
            super(props)

            this.model = this.props.form.models[properties.model];
            this.setModel(props.value || undefined)
        }

        
        /**
         * Valiate new value
         * Save new value in form-store to save in backend
         */
        componentWillReceiveProps ({ value }) {
            this.validateData(value)
            this.setModel(value)
        }

        /**
         * Wait for model to finish fetching if waitForFetch wasn't false then set initial value.
         * Validate initial value.
         * Emit "onChange" to let parent know initial value.
         */
        componentDidMount () {
            if (properties.waitForFetch !== false && properties.setIntialValue !== false) {
                if (this.model.isRequest('fetching')) {
                    if (this.disposeWhen) this.disposeWhen()

                    this.disposeWhen = when(
                        () => !this.model.isRequest('fetching'),
                        () => {
                            const value = this.getDefaultValue()

                            this.handleDefaultChange(value)
                        }
                    )
                }
            }

            this.validateData(this.props.value)
            this.isRequiredValidation(this.props.value)

            if (properties.setIntialValue !== false) this.handleDefaultChange(this.getDefaultValue())


        }

        /**
         * Clear errors when component is going to unmount.
         * Clear field data in form-store to prevent save data of unmounted field.
         */
        componentWillUnmount() {
            this.props.form.setError(properties.attribute, null)
            this.props.form.clearAttribute(properties.model, properties.attribute)

        }

        /**
         * Emit onChange event listener and validate data.
         * @param {any} value 
         */
        handleChange (e) {
            let value
            if(!this.props.form.isDirty) {
                this.props.form.makeDirty()
            }
            if (e && e.target) value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
            else value = e;

            if (this.props.onChange && typeof this.props.onChange === 'function')
                this.props.onChange(value)
        }

        handleDefaultChange (e) {
            let value

            if (e && e.target) value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
            else value = e;

            if (this.props.onChange && typeof this.props.onChange === 'function')
                this.props.onChange(value)
        }

        /**
         * Put value of field into schema.
         * @param {any} value 
         * @param {string} schema 
         * @returns {object} data
         */
        setSchema (value, schema) {
            let result = value

            switch (typeof result) {
                case 'string':
                    result = value
                        .replace(/[\\]/g, '\\\\')
                        .replace(/[\"]/g, '\\\"')
                        .replace(/[\/]/g, '\\/')
                        .replace(/[\b]/g, '\\b')
                        .replace(/[\f]/g, '\\f')
                        .replace(/[\n]/g, '\\n')
                        .replace(/[\r]/g, '\\r')
                        .replace(/[\t]/g, '\\t')
                    break

                case 'object':
                    result = (value === undefined ? null : JSON.stringify(result))
                    break

                case 'boolean':
                    result = value ? 'true': 'false'
                    break

                default:
                    result = (value === undefined ? null : value)
            }



            const data = (result || result === '')? schema.replace(/%/, result) : null
            return JSON.parse(data)
        }

        /**
         * Set field value in form-store to save in backend on form submited.
         * @param {any} value 
         */
        setModel (value) {
            let data, newValue;

            if (properties.apply && typeof properties.apply === 'function')
                newValue = properties.apply(value);
            else
                newValue = value;

            if (properties.setter && typeof properties.setter === 'function') {
                newValue = properties.setter(this.props.form.data[properties.model], newValue)

                this.props.form.setAttribute(properties.model, data, true);
            } else {
                if (!properties.schema) data = { [properties.attribute]: newValue };
                else data = this.setSchema(newValue, properties.schema);

                this.props.form.setAttribute(properties.model, data, properties.nonRecursively);
            }
        }

        /**
         * Get initial value of fields.
         * @returns {any}
         */
        getDefaultValue () {
            if (properties.getter && typeof properties.getter === 'function') {
                return properties.getter(this.model)
            } else {
                if (this.model.has(properties.attribute)){
                    return this.model.get(properties.attribute)
                }
                return ''
            }
        }

        /**
         * Validate value with given validators and put errors in form-store.
         * @param {any} value 
         */
        validateData (value) {
            let fieldErrors = []

            for (let validator of properties.validators) {
                let error

                if (typeof validator === 'function') error = validator(value);

                if (typeof error === 'function') {
                    fieldErrors = fieldErrors.concat([error(properties.fieldName)])
                }
            }

            this.props.form.setError(properties.attribute, fieldErrors);
        }

        isRequiredValidation(value){
            if(properties.isRequired && !value){
                this.props.form.setRequiredField(properties.attribute)
            }
        }

        render () {
            const propsForElement = Object.assign({}, this.props)

            delete propsForElement.children
            delete propsForElement.form
            delete propsForElement.notObserver
            delete propsForElement.onChange

            const elementAttributes = Object.assign(
                {
                    disabled: !!this.model.request,
                    onChange: this.handleChange.bind(this),
                },
                properties.elementAttributes,
                propsForElement
            )

            if(propsForElement.hasOwnProperty('form')) delete propsForElement.form

            return React.createElement(
                element,
                elementAttributes,
                this.props.children || properties.children || undefined
            )
        }
    }))
}
