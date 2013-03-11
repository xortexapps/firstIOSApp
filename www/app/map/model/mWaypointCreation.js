var mGtiMapModelWaypointCreation = Backbone.Model.extend({

    defaults: function() {
        return {
            //Positionsangaben in Pixel
            startPosX: null,
            startPosY: null,
            startPageX: null,
            startPageY: null,
            pageX: null,
            pageY: null,
            lon: null,
            lat: null
        };
    }
});
