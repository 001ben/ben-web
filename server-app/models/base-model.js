function hasProperties(obj) {
    return !(obj) || Object.getOwnPropertyNames(obj).length === 0;
}

function baseModel() { }

baseModel.prototype = {
    parseFields: function (modelObj) {
        var newObject = {};
        for (var f in modelObj) {
            var match = this.fields.hasOwnProperty(f);

            if (!match)
                continue;
            else if (typeof this.fields[f] !== typeof modelObj[f]) {
                throw {
                    fieldName: f,
                    fieldError: 'This field did not match the given type'
                };
            } else
                newObject[f] = modelObj[f];
        }
        return newObject;
    },
    validateAll: function (modelObj) {
        hasProperties(modelObj);

        for (var rule in this.validation) {
            if (!this.validation[rule](modelObj[rule])) {
                throw {
                    fieldName: rule,
                    fieldError: 'This field did not meet the server-side validation criteria'
                };
            }
        }

        return true;
    },
    validateFields: function (modelObj) {
        hasProperties(modelObj);

        for (var prop in modelObj) {
            if (this.validation.hasOwnProperty(prop) && !this.validation[prop](modelObj[prop]))
                throw {
                    fieldName: prop,
                    fieldError: 'This field did not meet the server-side validation criteria'
                };
        }

        return true;
    }
};

module.exports = baseModel;