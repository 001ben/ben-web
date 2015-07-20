function hasProperties(obj) {
    return !(obj) || Object.getOwnPropertyNames(obj).length === 0;
}

var showsModel = {
    fields: {
        name: '',
        image: {},
        notes: '',
        episodes: 0,
        next: '',
        filmType: '',
        seasons: 0,
        seasonEpisodes: 0,
        watched: false
    },
    parseFields: function (showObj) {
        var newObject = {};
        for (var f in showObj) {
            var match = this.fields.hasOwnProperty(f)
            
            if (!match)
                continue;
            else if (typeof this.fields[f] !== typeof showObj[f]) {
                throw { fieldName: f, fieldError: 'This field did not match the given type' };
            }
            else
                newObject[f] = showObj[f];
                
        }
        return newObject;
    },
    validation: {
        name: function (value) {
            return value ? true : false;
        }
    },
    validateAll: function (showObj) {
        hasProperties(showObj);

        for (var rule in this.validation) {
            if (!this.validation[rule](showObj[rule])) {
                throw { fieldName: rule, fieldError: 'This field did not meet the server-side validation criteria' };
            }
        }

        return true;
    },
    validateFields: function (showObj) {
        hasProperties(showObj);

        for (var prop in showObj) {
            if (this.validation.hasOwnProperty(prop) && !this.validation[prop](showObj[prop]))
                throw { fieldName: prop, fieldError: 'This field did not meet the server-side validation criteria' };
        }
        
        return true;
    }
};

module.exports = showsModel;