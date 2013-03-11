var mGtiDataModelSettings = Backbone.Model.extend({
    
    defaults: function() {
        return {
            username: null,
            password: null,
            maptype: 0,
            logging: 0,
            simulation: 0,
            compass: 0,
            accuracy: 0,

            //Welche Info-Felder werden angezeigt
            speed: 1,
            height: 1,
            distance: 1,
            time: 1,

            zoom: 13
        };
    }
});


