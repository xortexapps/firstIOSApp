var mGtiTestModelLogger = Backbone.Model.extend({

    defaults: function() {
        return {
            profiling: ""
        };
    },

    //Erzeugt einen neuen Log mit der angegebenen Nachricht
    //Wenn das logging aktiviert ist
    log: function(message) {

        if(mGtiApplication.Objects.get("settings").get("logging") == 1)
            console.log(message);
    },

    //Startet ein neues Profiling unter dem uebergebenen Namen
    startProfiling: function(Name) {

        //Es darf nur ein Profiling gleichzeitig laufen
        if(mGtiApplication.Objects.get("mLogger").get("profiling") == "") {
            console.profile(Name);
            mGtiApplication.Objects.get("mLogger").set({profiling: Name});
        }
        else {
            console.log("Versuch ein zweites Profiling zu starten!");
        }
    },

    //Stoppt das Profiling
    stopProfiling: function() {

        console.profileEnd(mGtiApplication.Objects.get("mLogger").get("profiling"));
        mGtiApplication.Objects.get("mLogger").set({profiling: ""});
    }
});