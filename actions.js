export function getActions() {
	let playActions = [
		{ id: 'go', label: 'Go' },
		{ id: 'forward', label: 'Forward' },
		{ id: 'back', label: 'Back' },
		{ id: 'reset', label: 'Reset' },
	]

	return {
		identify: {
			name: 'Identify',
			options: [],
			callback: async (event) => {
				this.sendCommand(`identify`)
			},
		},
		reboot: {
			name: 'Reboot',
			options: [],
			callback: async (event) => {
				this.sendCommand(`reboot`, 'POST')
			},
		},
		reset: {
			name: 'Reset',
			options: [
				{
					id: 'keep_ip_settings',
					type: 'checkbox',
					label: 'Keep IP Settings',
					default: true
				},
				{
					id: 'keep_user_profiles',
					type: 'checkbox',
					label: 'Keep User Profiles',
					default: true
				},
			],
			callback: (action) => {
				this.sendCommand(
				    `reset`,
				    'POST',
				    {
					keep_ip_settings: action.options.keep_ip_settings,
					keep_user_profiles: action.options.keep_user_profiles,
				    })
			},
		},
		display_on: {
			name: 'Turn on or off the display',
			options: [
				{
					id: 'display_on',
					type: 'checkbox',
					label: 'Display On',
					default: true
				},
			],
			callback: (action) => {
				this.sendCommand(`display`, 'POST', { display_on: action.options.display_on })
			},
		},
		recall_profile: {
			name: 'Recall configuration from profile',
			options: [
				{
					type: 'number',
					label: 'Profile',
					id: 'profile',
					tooltip: '1-based profile number',
					default: 1,
					min: 1,
					max: 40,
				},
				{
					id: 'keep_ip_settings',
					type: 'checkbox',
					label: 'Keep Ip Settings',
					default: true
				},
			],
			callback: (action) => {
				this.sendCommand(`profile/${action.options.profile - 1}/recall`, 'POST', { keep_ip_settings: action.options.keep_ip_settings })
			},
		},


		// DMX / RDM

		dmx_acknowledge: {
			name: 'Acknowledge all stream loss indications',
			options: [
			],
			callback: (action) => {
				this.sendCommand(`dmx/acknowledge`, 'POST')
			},
		},
		dmx_acknowledge_port: {
			name: 'Acknowledge stream loss indications for the given port',
			options: [
				{
					type: 'number',
					label: 'Port',
					id: 'port',
					tooltip: '1-based DMX port number',
					default: 1,
					min: 1,
					max: 12,
				},
			],
			callback: (action) => {
				this.sendCommand(`dmx/${action.options.port - 1}/acknowledge`, 'POST')
			},
		},
		force_rdm_discovery: {
			name: 'Force RDM discovery for all DMX ports',
			options: [
			],
			callback: (action) => {
				this.sendCommand(`dmx/force_discovery`, 'POST')
			},
		},
		force_rdm_discovery_port: {
			name: 'Force RDM discovery for the given port',
			options: [
				{
					type: 'number',
					label: 'Port',
					id: 'port',
					tooltip: '1-based DMX port number',
					default: 1,
					min: 1,
					max: 12,
				},
			],
			callback: (action) => {
				this.sendCommand(`dmx/${action.options.port - 1}/force_discovery`, 'POST')
			},
		},

		// Play
		play_control: {
			name: 'Control all players',
			options: [
				{
					type: 'dropdown',
					label: 'Action',
					id: 'action',
					default: 'go',
					choices: playActions,
				},
			],
			callback: (action) => {
				this.sendCommand(`play/control`, 'POST', { action: action.options.action })
			},
		},
		play_snapshot: {
			name: 'Play a specific snapshot',
			options: [
				{
					type: 'textinput',
					label: 'Snapshot ID',
					id: 'snapshot_id',
					default: '1.00',
					regex: '^\d+(\.\d{1,2})?$',
				},
			],
			callback: (action) => {
				this.sendCommand(`play/play_snapshot`, 'POST', { snapshot_id: action.options.snapshot_id })
			},
		},
	}
}
