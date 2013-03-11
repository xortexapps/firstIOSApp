var mGtiUiModelDistance= Backbone.Model.extend({
    
    defaults: function() {
        distance: 0
    },

    //Berechnet die zurueckgelegte Distanz in Metern
    get_distance: function(new_lat, new_long, old_lat, old_long) {

        mGtiApplication.Objects.get("mLogHistory").push("mGtiUiModelDistance.get_distance()");

        var t_distance = 0;
        
        t_distance =
            Math.acos(Math.sin(new_lat/180*Math.PI)*Math.sin(old_lat/180*Math.PI) + Math.cos(new_lat/180*Math.PI)*Math.cos(old_lat/180*Math.PI)*Math.cos(new_long/180*Math.PI-old_long/180*Math.PI) ) * 6378.137;
        
        t_distance = Math.round(t_distance*1000);

        mGtiApplication.Objects.get("mLogHistory").pop();

        return t_distance;
    }
});

