const UserAdapter = require('vialer-js/bg/modules/user/adapter')


class UserAdapterVoip extends UserAdapter {
    constructor(app) {
        super(app)
    }


    _initialState() {
        return {
            platform: {
                account: {
                    selection: false,
                },
            }
        }
    }


    /**
    * Try to login to the SIP endpoint with these
    * credentials. In softphone modus, these are the
    * credentials that Vialer-js will use.
    * @param {Object} options - The options to pass along.
    * @param {String} options.username - Username formatted as `accountid@domain`.
    * @param {Object} options.password - Password to the SIP endpoint account.
    * @param {Object} options.endpoint - Domain to the SIP-over-wss service.
    */
    async login({username, password, endpoint}) {
        this.app.setState({user: {status: 'login'}})
        let sessionName = username
        username = username.split('@')[0]

        let userFields = {
            id: shortid.generate(),
        }

        if (this.app.state.app.session.active !== sessionName) {
            // State is reinitialized, but we are not done loading yet.
            let keptState = {user: {status: 'login'}, settings: {webrtc: {endpoint: {uri: endpoint}}}}
            await this.app.changeSession(sessionName, keptState)
        }

        try {
            await this.app.modules.calls.register({
                account: {username, password, uri: sessionName}, endpoint,
                register: true,
            })
            await super.login({username, password, userFields})
            await this.app.setState({settings: {webrtc: {
                account: {selected: {username, password, uri: sessionName}},
                endpoint: {uri: endpoint},
            }}}, {persist: true})
        } catch (err) {
            this.app.notify({icon: 'warning', message: this.app.$t('failed to login; please check your credentials.'), type: 'warning'})
        } finally {
            this.app.setState({user: {status: null}})
        }
    }


    /**
    * Generate a representational name for this module. Used for logging.
    * @returns {String} - An identifier for this module.
    */
    toString() {
        return `${this.app}[user-voip] `
    }
}

module.exports = UserAdapterVoip
