var mGtiGpsModelAltitude = Backbone.Model.extend({
    
    defaults: function() {
      return {
        altitude: 0
      };  
    },
    //Es wird versucht die Hoehe auszulesen
    GetAltitude: function() {

        mGtiApplication.Objects.get("mLogHistory").push("mGtiGpsModelAltitude.GetAltitude()");

        //window.alert(mGeolocation.get('heading'));
        mGtiApplication.Objects.get("mAltitude").set({altitude: mGtiApplication.Objects.get("mGeolocation").get("altitude")});

        mGtiApplication.Objects.get("mLogHistory").pop();
    }
});


