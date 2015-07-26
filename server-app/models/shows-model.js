var baseModel = require('./base-model');

function showsModel() {
    this.fields = {
        name: '',
        image: {},
        notes: '',
        episodes: 0,
        next: '',
        filmType: '',
        seasons: 0,
        seasonEpisodes: 0,
        watched: false
    };
    
    this.validation = {
        name: function (value) {
            return value ? true : false;
        }
    };
}

showsModel.prototype = new baseModel();

module.exports = showsModel;