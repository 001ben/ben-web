ConfigurationLogic = ($mdThemingProvider, $mdIconProvider, extendDefaultObjectsProvider) ->
	$mdIconProvider
		.defaultIconSet './assets/svg/avatars.svg', 128
		.icon 'menu', './assets/svg/menu.svg', 24
		.icon 'share', './assets/svg/share.svg', 24
		.icon 'google_plus', './assets/svg/google_plus.svg', 512
		.icon 'hangouts', './assets/svg/hangouts.svg', 512
		.icon 'twitter', './assets/svg/twitter.svg', 512
		.icon 'phone', './assets/svg/phone.svg', 512

	$mdThemingProvider
		.theme 'default'
		.primaryPalette 'grey'
		.accentPalette 'blue'

	extendDefaultObjectsProvider
		.objectFor 'show-image',
			'background-size': 'cover'
			'background-position': '50% 50%'
			'background-repeat': 'no-repeat'

	return


InitialisationLogic = (cseRenderer) ->
	do cseRenderer.initialise

	$('.avatar-container').hover ->
		$('.avatar-image').addClass('image-hover')
		$('.add-image').addClass('image-hover')
		return
	, ->
		$('.avatar-image').removeClass('image-hover')
		$('.add-image').removeClass('image-hover')
		return
	return

# Prepare the 'shows' module for subsequent registration of controllers and delegates
angular.module 'shows', ['ngMaterial', 'ngMessages', 'iconSelector']
.config ['$mdThemingProvider', '$mdIconProvider', 'extendDefaultObjectsProvider', ConfigurationLogic]
.run ['cseRenderer', InitialisationLogic]
