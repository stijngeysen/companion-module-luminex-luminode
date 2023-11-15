import { combineRgb } from '@companion-module/base'

export function getPresets() {
	const presets = {}

	presets[`play_reset`] = {
		type: 'button',
		category: 'Play',
		name: `Play Reset\nReset player to first cue`,
		style: {
			text: `Reset`,
			size: 'auto',
			color: combineRgb(255, 255, 0),
			bgcolor: 0,
		},
		steps: [
			{
				down: [
					{
						actionId: 'play_control',
						options: {
							action: 'reset',
						},
					}
				],
				up: [],
			},
		],
		feedbacks: [],
	}

	presets[`play_back`] = {
		type: 'button',
		category: 'Play',
		name: `Play Back\nMove next Cue back`,
		style: {
			text: `Back`,
			size: 'auto',
			color: combineRgb(255, 255, 0),
			bgcolor: 0,
		},
		steps: [
			{
				down: [
					{
						actionId: 'play_control',
						options: {
							action: 'back',
						},
					}
				],
				up: [],
			},
		],
		feedbacks: [],
	}

	presets[`play_forward`] = {
		type: 'button',
		category: 'Play',
		name: `Play Forward\nMove next Cue forward`,
		style: {
			text: `Next`,
			size: 'auto',
			color: combineRgb(255, 255, 0),
			bgcolor: 0,
		},
		steps: [
			{
				down: [
					{
						actionId: 'play_control',
						options: {
							action: 'forward',
						},
					}
				],
				up: [],
			},
		],
		feedbacks: [],
	}

	presets[`play_go`] = {
		type: 'button',
		category: 'Play',
		name: `Play Go\nPlay next cue`,
		style: {
			text: `Play`,
			size: 'auto',
			color: combineRgb(255, 255, 0),
			bgcolor: 0,
		},
		steps: [
			{
				down: [
					{
						actionId: 'play_control',
						options: {
							action: 'go',
						},
					}
				],
				up: [],
			},
		],
		feedbacks: [],
	}

	presets[`play_snapshot`] = {
		type: 'button',
		category: 'Play',
		name: `Play Snapshot\nPlay a specific snapshot. Button will become RED if snapshot is playing`,
		style: {
			text: `Play 1.00`,
			size: 'auto',
			color: combineRgb(0, 255, 0),
			bgcolor: combineRgb(0, 0, 0),
		},
		steps: [
			{
				down: [
					{
						actionId: 'play_snapshot',
						options: {
							snapshot_id: '1.00',
						},
					}
				],
				up: [],
			},
		],
		feedbacks: [
			{
				feedbackId: 'playing_cue',
				options: {
					snapshot_id: '1.00',
				},
				style: {
					color: combineRgb(255, 255, 255),
					bgcolor: combineRgb(255, 0, 0),
				},
			},
			{
				feedbackId: 'next_cue',
				options: {
					snapshot_id: '1.00',
				},
				style: {
					color: combineRgb(255, 255, 255),
					bgcolor: combineRgb(255, 102, 0),
				},
			}
		],
	}

	Array(40).fill().forEach((_,i) => {
		const id = i + 1
		presets[`recall_profile_${id}`] = {
			type: 'button',
			category: 'Profile Recall',
			name: `Profile ${id} name\nIncludes Name`,
			style: {
				text: `Recall $(LumiNode:profile_${id}_name)`,
				size: 'auto',
				color: combineRgb(0, 255, 255),
				bgcolor: 0,
			},
			steps: [
				{
					down: [
						{
							actionId: 'recall_profile',
							options: {
								profile: id,
								keep_ip_settings: true,
							},
						}
					],
					up: [],
				},
			],
			feedbacks: [],
		}
	})

	return presets
}
