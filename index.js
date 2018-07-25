const UserAdapter = require('vialer-js/src/js/bg/modules/user/adapter')


class UserAdapterVoip extends UserAdapter {
    constructor(app) {
        super(app)
    }


    _initialState() {
        return {}
    }


    /**
    * Try to login to the SIP endpoint with these
    * credentials. In softphone modus, these are the
    * credentials that Vialer-js will use.
    * @param {Object} options - The options to pass along.
    * @param {String} options.username - Username formatted as `accountid@domain`.
    * @param {Object} options.password - Password to the SIP endpoint account.
    * @param {Object} options.sipEndpoint - Domain to the SIP-over-wss service.
    */
    async login({username, password, sipEndpoint}) {
        this.app.setState({user: {status: 'login'}})
        let sessionName = username
        username = username.split('@')[0]

        let userFields = {
            id: shortid.generate(),
        }

        if (this.app.state.app.session.active !== sessionName) {
            // State is reinitialized, but we are not done loading yet.
            let keptState = {user: {status: 'login'}}
            this.app.setSession(sessionName, keptState)
        }

        try {
            await super.login({username, password, userFields})
            await this.app.setState({settings: {sipEndpoint, webrtc: {account: {selected: {username, password, uri: sessionName}}}}}, {persist: true})
            await this.app.modules.calls.connect({register: true})

        } catch (err) {
            console.log("AUTHENTICATION ERROR")
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
