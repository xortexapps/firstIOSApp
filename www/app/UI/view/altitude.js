var mGtiUiViewAltitude = Backbone.View.extend({
    
    refresh: function() {

        mGtiApplication.Objects.get("mLogHistory").push("mGtiUiViewAltitude.refresh()");

        if (mGtiApplication.Objects.get("mAltitude").get("altitude")!= null)
        {
            $("#p_altitude").html(mGtiApplication.Objects.get("mAltitude").get("altitude") + " m");
        }
        else{
            $("#p_altitude").html("N/A");
        }

        mGtiApplication.Objects.get("mLogHistory").pop();
    }
});


