# Service just maps object methods to api urls. All methods return http promises
ShowService = ($q, $http) ->
	loadAllShows: ->
		return $http.get '/shows'
	loadShowOrder: ->
		return $http.get '/shows/order'
	updateShowOrder: (showsOrderedBy, showsOrderedAscending) ->
		return $http.post '/shows/updateOrder', { showsOrderedBy, showsOrderedAscending }
	updateShow: (showId, showObj) ->
		return $http.post '/shows/update/' + showId, showObj
	createShow: (showObj) ->
		return $http.post '/shows/create', showObj
	uploadImage: (showId, imageProperties) ->
		return $http.post '/shows/image/' + showId, imageProperties

angular.module 'shows'
.service 'showData', ['$q', '$http', ShowService]
