describe('app enums', function() {
    beforeEach(module('shows'));
    
    var testValuesMatchProperties = function(enumObject) {
        for(var v in enumObject) {
            expect(v).toEqual(enumObject[v]);
        }
    };
    
    it('should have properties set equal to string values', inject(function(showType) {
        testValuesMatchProperties(showType);
    }));
});