var baseModel = require('./base-model');

function requiresVal(val) {
    return val ? true : false;    
}

function showImageModel() {
    this.fields = {
        'background-image': '',
        'background-size': '',
        'background-position': '',
        'background-repeat': '',
        'border-radius': '',
        height: '',
        width: '',
        top: '',
        left: '',
        position: ''
    };
    
    this.validation = {
        'background-image': requiresVal,
    }
}

showImageModel.prototype = new baseModel();

module.exports = showImageModel;