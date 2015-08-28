ConfigurationLogic = ($mdThemingProvider) ->
	$mdThemingProvider
		.theme 'default'
		.primaryPalette 'blue-grey'
		.accentPalette 'blue'

	return

angular.module 'login', ['ngMaterial']
.config ['$mdThemingProvider', ConfigurationLogic]
