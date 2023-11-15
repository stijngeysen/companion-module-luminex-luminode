import { combineRgb } from '@companion-module/base'

export function getFeedbacks() {
	const feedbacks = {}

	const ColorWhite = combineRgb(255, 255, 255)
	const ColorBlack = combineRgb(0, 0, 0)
	const ColorRed = combineRgb(200, 0, 0)
	const ColorGreen = combineRgb(0, 200, 0)
	const ColorOrange = combineRgb(255, 102, 0)

	feedbacks['playing_cue'] = {
		type: 'boolean',
		name: 'Cue is playing',
		defaultStyle: {
			bgcolor: ColorRed,
			color: ColorWhite,
		},
		options: [{
		  type: 'textinput',
		  label: 'Snapshot ID',
		  id: 'snapshot_id',
		  default: '1.00',
		}],
		callback: async (feedback) => {
			if (this.device.current_snapshot && this.device.current_snapshot === feedback.options.snapshot_id) {
				return true
			} else {
				return false
			}
		}
	}

	feedbacks['next_cue'] = {
		type: 'boolean',
		name: 'Cue is staged next',
		defaultStyle: {
			bgcolor: ColorOrange,
			color: ColorWhite,
		},
		options: [{
		  type: 'textinput',
		  label: 'Snapshot ID',
		  id: 'snapshot_id',
		  default: '1.00',
		}],
		callback: async (feedback) => {
			if (this.device.next_snapshot && this.device.next_snapshot === feedback.options.snapshot_id) {
				return true
			} else {
				return false
			}
		}
	}

	return feedbacks
}
