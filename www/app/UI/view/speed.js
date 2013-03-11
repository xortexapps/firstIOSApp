var mGtiUiViewSpeed = Backbone.View.extend({
   
   replace: function() {

       mGtiApplication.Objects.get("mLogHistory").push("mGtiUiViewSpeed.replace()");

       //die Position des Divtags aendern 
       $("#div_speed").css("right", 2+"%");

       mGtiApplication.Objects.get("mLogHistory").pop();
   },

   place: function(){

       mGtiApplication.Objects.get("mLogHistory").push("mGtiUiViewSpeed.place()");

       $("#div_speed").css("right", 32+"%");

       mGtiApplication.Objects.get("mLogHistory").pop();
   },

   refresh: function() {

       mGtiApplication.Objects.get("mLogHistory").push("mGtiUiViewSpeed.refresh()");

        $("#p_speed").html(mGtiApplication.Objects.get("mSpeed").get("speed") + " km/h");

       mGtiApplication.Objects.get("mLogHistory").pop();
    }
});


