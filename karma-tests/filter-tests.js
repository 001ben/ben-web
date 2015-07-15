describe('ExtendDefaultFilter', function () {
    
    beforeEach(module('shows', function (extendDefaultObjectsProvider) {
        extendDefaultObjectsProvider 
            .objectFor('test', {
                'property': 'value'
            });
    }));

    it('should return the default object with the given object applied over it', inject(function (extendDefaultFilter) {
        expect(extendDefaultFilter(null, 'test')).toEqual({property: 'value'});
        expect(extendDefaultFilter({}, 'test')).toEqual({property: 'value'});
        expect(extendDefaultFilter({ property2: 'other'}, 'test')).toEqual({property: 'value', property2: 'other'});
        expect(extendDefaultFilter({ property: 'override'}, 'test')).toEqual({property: 'override'});
    }));
    
    it('should return true if the given object matches the value of the given enum value name', inject(function (showType, isShowTypeFilter) {
        expect(isShowTypeFilter(showType.episodes, 'episodes')).toBe(true);
        expect(isShowTypeFilter(showType.seasons, 'episodes')).toBe(false);
        expect(isShowTypeFilter(showType.seasons, 'non-existant')).toBe(false);
        expect(isShowTypeFilter(null, 'movie')).toBe(false);
    }));
});