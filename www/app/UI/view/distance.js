var mGtiUiViewDistance = Backbone.View.extend({

   refresh: function() {

       mGtiApplication.Objects.get("mLogHistory").push("mGtiUiViewDistance.refresh()");

       var distance =  Math.round((mGtiApplication.Objects.get("mDistance").get("distance") / 100)) / 10;
       $("#p_distance").html(distance + " km");

       mGtiApplication.Objects.get("mLogHistory").pop();
   },
   replace: function() {

       mGtiApplication.Objects.get("mLogHistory").push("mGtiUiViewDistance.replace()");

       //die Position des Divtags aendern 
       $("#div_distance").css("right", 2+"%");

       mGtiApplication.Objects.get("mLogHistory").pop();
   },
   place: function(){

       mGtiApplication.Objects.get("mLogHistory").push("mGtiUiViewDistance.place()");

       $("#div_distance").css("right", 32+"%");

       mGtiApplication.Objects.get("mLogHistory").pop();
   }
});


