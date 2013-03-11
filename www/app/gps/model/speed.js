var mGtiGpsModelSpeed = Backbone.Model.extend({
    
    defaults: function() {
      return {
        speed: 0
      };  
    },
    //Es wird versucht die Geschwindigkeit auszulesen
    GetSpeed: function() {

        mGtiApplication.Objects.get("mLogHistory").push("mGtiGpsModelSpeed.GetSpeed()");

        mGtiApplication.Objects.get("mSpeed").set({speed: mGtiApplication.Objects.get("mGeolocation").get("speed")});

        mGtiApplication.Objects.get("mLogHistory").pop();
    }
});


