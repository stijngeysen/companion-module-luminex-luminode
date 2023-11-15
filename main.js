import { InstanceBase, Regex, runEntrypoint, InstanceStatus } from '@companion-module/base'
import { getActions } from './actions.js'
import { getPresets } from './presets.js'
import { getVariables } from './variables.js'
import { getFeedbacks } from './feedbacks.js'
import { upgradeScripts } from './upgrades.js'

import fetch from 'node-fetch'

class ModuleInstance extends InstanceBase {
	constructor(internal) {
		super(internal)
	}

	async init(config) {
		this.config = config
		this.device = {}

		this.updateStatus(InstanceStatus.Connecting)

		this.initConnection()
		this.initVariables()
		this.initFeedbacks()
		this.initActions()
		this.initPresets()
	}

	// When module gets deleted
	async destroy() {
		this.log('debug', 'destroy')
		this.stopDevicePoll()
	}

	async configUpdated(config) {
		this.config = config
		this.init(config)
	}

	initVariables() {
		const variables = getVariables.bind(this)()
		this.setVariableDefinitions(variables)
	}

	initFeedbacks() {
		const feedbacks = getFeedbacks.bind(this)()
		this.setFeedbackDefinitions(feedbacks)
	}

	initPresets() {
		const presets = getPresets.bind(this)()
		this.setPresetDefinitions(presets)
	}

	initActions() {
		const actions = getActions.bind(this)()
		this.setActionDefinitions(actions)
	}

	initConnection() {
		this.stopDevicePoll()
		let headers = { 'Content-Type': 'application/json' }
		if (this.config.password !== '') {
			headers['Authorization'] = `Basic ${Buffer.from('admin:' + this.config.password).toString('base64')}`
		}
		let options = {
			headers: headers,
		}
		fetch(`http://${this.config.host}/api/deviceinfo`, options)
			.then((res) => {
				if (res.status == 200) {
					return res.json()
				}
			})
			.then((json) => {
				let data = json
				if (data) {
					this.updateStatus(InstanceStatus.Ok)
					this.startDevicePoll()
				}
			})
			.catch((error) => {
				this.log('debug', error)
				this.updateStatus(InstanceStatus.ConnectionFailure)
			})

	}

	// Return config fields for web config
	getConfigFields() {
		return [
			{
				type: 'textinput',
				id: 'host',
				label: 'LumiNode IP',
				width: 6,
				regex: Regex.IP,
			},
			{
				type: 'textinput',
				id: 'password',
				label: 'Password',
				tooltip: 'Only provide a password when authentication is enabled on the device',
				width: 6,
			},
		]
	}

	getDeviceInfo() {
		this.sendCommand('deviceinfo', 'GET')
	}

	getPlayInfo() {
		// Find a Player input
		this.sendCommand(`IO?io_class=player`, 'GET')
		if (this.device.mainPlayerIdx >= 0) {
			this.sendCommand(`play/player/${this.device.mainPlayerIdx}`, 'GET')
		}
	}

	getProfileNames() {
		this.sendCommand(`active_profile_name`, 'GET')
		this.sendCommand(`profile`, 'GET')
	}

	startDevicePoll() {
		this.stopDevicePoll()

		this.getDeviceInfo()
		this.getPlayInfo()
		this.getProfileNames()

		this.devicePoll = setInterval(() => {
			this.getDeviceInfo()
			this.getPlayInfo()
		}, 5000)

		this.deviceLongPoll = setInterval(() => {
			this.getProfileNames()
		}, 15000)
	}

	stopDevicePoll() {
		if (this.devicePoll) {
			clearInterval(this.devicePoll)
			delete this.devicePoll
		}
		if (this.deviceLongPoll) {
			clearInterval(this.deviceLongPoll)
			delete this.deviceLongPoll
		}
	}

	sendCommand(cmd, type, params) {
		let url = `http://${this.config.host}/api/${cmd}`
		let headers = { 'Content-Type': 'application/json' }
		if (this.config.password !== '') {
			headers['Authorization'] = `Basic ${Buffer.from('admin:' + this.config.password).toString('base64')}`
		}
		let options = {
			method: type,
			body: params != undefined ? JSON.stringify(params) : null,
			headers: headers,
		}

		fetch(url, options)
			.then((res) => {
				if (res.ok) {
					const contentType = res.headers.get("content-type")
					if (contentType && contentType.indexOf("application/json") !== -1) {
						return res.json().catch((err) => {return {}})
					}
				} else {
					throw new Error(res)
				}
			})
			.then((json) => {
				this.processData(cmd, json)
			})
			.catch((error) => {
				this.log('debug', `CMD error: ${error}`)
			})
	}

	processData(cmd, data) {
		if (cmd.startsWith('deviceinfo')) {
			this.device.deviceInfo = data

			this.setVariableValues({
				short_name: data.short_name,
				long_name: data.long_name,
				nr_dmx_ports: data.nr_dmx_ports,
				nr_processblocks: data.nr_processblocks,
				serial: data.serial,
				mac_address: data.mac_address,
				device_type: data.type,
			})
		} else if (cmd.startsWith(`IO\?io_class\=player`)) {
			let players = data
			if (players.length === 0) {
				this.device.mainPlayerIdx = -1
				this.device.current_snapshot = '-'
				this.device.next_snapshot = '-'
				this.setVariableValues({
					current_snapshot: '-',
					next_snapshot: '-',
				})
				this.checkFeedbacks('playing_cue', 'next_cue')
			} else {
				this.device.mainPlayerIdx = players[0]['id']
			}
		} else if (cmd.startsWith('play/player')) {
			this.device.current_snapshot = data.playing_snapshot_id
			this.device.next_snapshot = data.next_snapshot_id
			this.setVariableValues({
				current_snapshot: data.playing_snapshot_id,
				next_snapshot: data.next_snapshot_id,
			})
			this.checkFeedbacks('playing_cue', 'next_cue')
		} else if (cmd.startsWith('active_profile_name')) {
			if (!this.device.active_profile || this.device.active_profile !== data.name) {
				this.device.active_profile = data.name
				this.setVariableValues({ active_profile_name: data.name })
			}
		} else if (cmd.startsWith('profile')) {
			let changedVariables = {}
			data.forEach((profile) => {
				let id = profile.id + 1
				let oldProfile = this.device.profiles?.find(({ profileId }) => profileId === profile.id)
				if (!oldProfile || oldProfile?.name !== profile.name) {
				    changedVariables[`profile_${id}_name`] = profile.name
				}
			})
			this.setVariableValues(changedVariables)
			this.device.profiles = data
		} else if (cmd.startsWith('play/control')) {
			this.getPlayInfo()
		} else if (cmd.startsWith('play/play_snapshot')) {
			this.getPlayInfo()
		} else {
			this.log('debug', `Unhandled command ${cmd}: ${JSON.stringify(data)}`)
		}
	}
}

runEntrypoint(ModuleInstance, upgradeScripts)
