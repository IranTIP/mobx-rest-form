import React, { Component, PropTypes } from 'react'
import { withRouter } from 'react-router'
import { Provider, observer } from 'mobx-react'
import { last } from 'lodash'
import FormStore from './form-store.jsx'

const ModelForm = withRouter(
    observer(
        class ModelForm extends Component {
            /**
             * Creates an instance of ModelForm.
             * @param {any} props
             */
            constructor(props) {
                super(props)
                this.store = new FormStore(props.models)

                if (this.props.onChange && typeof this.props.onChange === 'function')
                    this.store.onDataChange(this.props.onChange)
            }

            componentWillUnmount() {
                this.store.cleanDirty()
            }

            componentDidMount() {
                this.props.router.setRouteLeaveHook(last(this.props.router.routes), () => {
                    if (this.store.isDirty) {
                        return confirm('You Are Leaving Form With Unsaved Changes...?')
                    }
                    return true
                })
            }
            /**
             * Save given data in backend.
             * @param {any} data
             * @returns
             */
            saveData(data) {
                const { models } = this.props
                const formData = JSON.parse(JSON.stringify(data))
                const promises = []

                for (const modelName in models) {
                    if (models[modelName].request) return

                    promises.push(models[modelName].save(data[modelName], { optimistic: !!this.props.optimistic }))
                }

                return Promise.all(promises)
                    .then((response) => {
                        if (this.props.onSave && typeof this.props.onSave === 'function')
                            this.props.onSave(formData, response)
                        this.store.cleanDirty()
                        return Promise.resolve(response)
                    })
                    .catch((e) => {
                        if (this.props.onError) {
                            this.props.onError(e)
                        }
                        return Promise.reject(e)
                    })
            }

            /**
             * Emit "OnSubmit" if it exists in props
             * @param {any} args
             */
            emitOnSubmit(...args) {
                if (this.props.onSubmit && typeof this.props.onSubmit === 'function') this.props.onSubmit(...args)
            }

            /**
             * Save data if there is no error and notSave wasn't setted in props
             * If notSave was setted pass saveData function to onSubmit listener to saveData
             * @param {any} e
             */
            handleSubmit(e) {
                e.preventDefault()

                if (this.store.hasError) return

                if (!this.props.notSave) {
                    this.saveData(this.store.data)
                    this.store.cleanDirty()
                    this.emitOnSubmit(this.store.data)
                } else {
                    this.emitOnSubmit(this.store.data, this.saveData.bind(this))
                }
            }

            render() {
                const propsForForm = Object.assign({}, this.props)

                delete propsForForm.onSubmit
                delete propsForForm.notSave
                delete propsForForm.optimistic
                delete propsForForm.onSave
                delete propsForForm.models
                delete propsForForm.onChange

                return (
                    <Provider form={this.store}>
                        <form
                            className={this.props.className || ''}
                            onSubmit={this.handleSubmit.bind(this)}
                            {...propsForForm}>
                            {this.props.children}
                        </form>
                    </Provider>
                )
            }
        },
    ),
)

ModelForm.propTypes = {
    models: PropTypes.any.isRequired,
    onSubmit: PropTypes.func,
    onChange: PropTypes.func,
    onSave: PropTypes.func,
    optimistic: PropTypes.bool,
    router: PropTypes.object,
    location: PropTypes.object,
    params: PropTypes.object,
    routes: PropTypes.object,
}

export default ModelForm
