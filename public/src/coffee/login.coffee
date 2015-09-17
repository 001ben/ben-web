ConfigurationLogic = ($mdThemingProvider) ->
	$mdThemingProvider
		.theme 'default'
		.primaryPalette 'grey'
		.accentPalette 'blue'

	return

angular.module 'login', ['ngMaterial']
.config ['$mdThemingProvider', ConfigurationLogic]
