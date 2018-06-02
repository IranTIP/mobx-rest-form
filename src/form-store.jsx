import _merge from 'lodash/merge'
import { action, extendObservable, computed } from 'mobx'

/**
 * Store errors and field values
 * @export
 * @class FormStore
 */
export default class FormStore {
    /**
     * Creates an instance of FormStore.
     * @param {any} models
     * @memberof FormStore
     */
    constructor(models) {
        extendObservable(this, {
            models: models,
            errors: {},
            requiredField: [],
            isDirty: false,
            hasError: computed(() => {
                for (let error in this.errors) {
                    if (this.errors[error] && this.errors[error].length > 0) {
                        return true
                    }
                }

                // if (Object.keys(this.data)) {
                //     const modelName = Object.keys(this.data)[0]
                //     return !!this.requiredField.find((field) => {
                //         if (!this.data[modelName][field]) {
                //             return true
                //         }
                //     })
                // }

                return false
            }),
            setError: action.bound(function(attribute, value) {
                this.errors = Object.assign({}, this.errors, {
                    [attribute]: value,
                })
            }),
            makeDirty: action.bound(function() {
                this.isDirty = true
            }),
            cleanDirty: action.bound(function() {
                this.isDirty = false
            }),
            setRequiredField: action.bound(function(attribute) {
                this.requiredField = this.requiredField.concat([attribute])
            }),
        })

        this.data = {}

        this.listeners = []
    }

    onDataChange(listener) {
        this.listeners.push(listener)
    }

    clearAttribute(modelName, attribute) {
        if (this.data[modelName].hasOwnProperty(attribute)) delete this.data[modelName][attribute]
    }

    /**
     * Merge given data into model data.
     * @param {string} modelName
     * @param {any} data
     * @param {boolean} [nonRecursively=false] if true it ganna use lodash merge for merge else it will use Object.prototype.assign.
     * @memberof FormStore
     */
    setAttribute(modelName, data, nonRecursively = false) {
        this.data[modelName] = this.data[modelName] || {}

        if (nonRecursively) {
            Object.assign(this.data[modelName], data)
        } else {
            _merge(this.data[modelName], data)
        }

        this.listeners.forEach(listener => listener(this.data, this.setError))
    }
}
