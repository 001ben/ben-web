debounceRate = 1000

Debouncer = ($interval) ->

	currentTimer = null

	clear = ->
		if currentTimer?
			$interval.cancel(currentTimer)
			currentTimer = null

	start = (saveCallback) ->
		do clear
		currentTimer = $interval(callSave, debounceRate, 1, true, saveCallback)
		return

	callSave = (saveCallback) ->
		do clear
		do saveCallback

	return {
		clear: clear
		start: start
	}

angular.module 'shows'
.service 'debouncer', ['$interval', Debouncer]
