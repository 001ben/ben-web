BenEditable = ($mdMedia) ->
	restrict: 'A'
	require: 'ngModel'
	transclude: true
	template: '<div><span contenteditable ng-style="style" data-ph="{{placeholder}}"></span></div><ng-transclude></ng-transclude>'
	scope:
		modelValue: '=ngModel'
		tabindex: '='
		placeholder: '@'
	,
	link: (scope, element, attrs, ngModel) ->
			inlineSpan = angular.element element.children()[0].childNodes[0]
			scope.isEmpty = false
			scope.style = {}

			updateTextStyle = (text) ->
				if scope.isEmpty isnt (!text)
					scope.isEmpty = !scope.isEmpty
					
					if scope.isEmpty
						scope.style =
							display: 'inline-block',
							width: if $mdMedia('sm') then '80%' else '200px'
					else
						scope.style = {}
				return

			read = () ->
				text = inlineSpan.text()
				updateTextStyle(text)
				ngModel.$setViewValue(text)
				return

			# write
			ngModel.$render = () ->
				text = ngModel.$viewValue or ''
				updateTextStyle(text)
				inlineSpan.text(text)
				return

			inlineSpan.bind 'blur keyup change', ->
				if scope.$$phase?
						read()
				else
						scope.$apply(read)
				return
			return
    

angular.module 'shows'
.directive 'benEditable', ['$mdMedia', BenEditable]