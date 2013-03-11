var mGtiDataModelLocalStorage = Backbone.Model.extend({
    
    defaults: function() {
        return {
            storage: null
        };
    },
    //Legt die Standardwerte im LocalStorage ab
    //Falls sie noch nicht existieren
    init: function() {

        //mGtiApplication.Objects.get("mLogHistory").push("mGtiDataModelLocalStorage.init()");
        
        if(this.get("storage").username == null) {
            
            this.get("storage").username = "";
            this.get("storage").password = "";
            this.get("storage").logging = 0;
            //Kartentypen: 0... OpenStreetMap, 1... OpenCycleMap
            this.get("storage").maptype = 1;
            this.get("storage").compass = 1;
            this.get("storage").accuracy = 0;
        }

        //Falls die Werte noch nicht gesetzt sind, werden sie auf die Standard-Werte gesetzt
        this.get("storage").speed = (this.get("storage").speed) ? this.get("storage").speed : 1;
        this.get("storage").altitude = (this.get("storage").altitude) ? this.get("storage").altitude : 1;
        this.get("storage").distance = (this.get("storage").distance) ? this.get("storage").distance : 1;
        this.get("storage").time = (this.get("storage").time) ? this.get("storage").time : 1;

        this.get("storage").zoom = (this.get("storage").zoom) ? this.get("storage").zoom : 13;
        this.get("storage").compassState = (this.get("storage").compassState) ? this.get("storage").compassState : 0;

        //mGtiApplication.Objects.get("mLogHistory").pop();
    },
    
    //Ueberprueft ob LocalStorage vom Browser unterstuezt wird,
    //und gibt das Storage-Objekt zurueck
    getLocalStorage: function() {

        //mGtiApplication.Objects.get("mLogHistory").push("mGtiDataModelLocalStorage.getLocalStorage()");

        //return 'localStorage' in window;
        var uid = new Date,
          storage,
          result;
        try {
            (storage = window.localStorage).setItem(uid, uid);
            result = storage.getItem(uid) == uid;
            storage.removeItem(uid);
            return result && storage;
        } 
        catch(e) {}

        //mGtiApplication.Objects.get("mLogHistory").pop();
    },

    //Speichert die Einstellungen im LocalStorage
    changeSettingsHandler: function() {

        mGtiApplication.Objects.get("mLogHistory").push("mGtiDataModelLocalStorage.changeSettingsHandler()");

        this.get("storage").logging = mGtiApplication.Objects.get("settings").get("logging");
        this.get("storage").maptype = mGtiApplication.Objects.get("settings").get("maptype");
        this.get("storage").compass = mGtiApplication.Objects.get("settings").get("compass");
        this.get("storage").accuracy = mGtiApplication.Objects.get("settings").get("accuracy");
        this.get("storage").speed = mGtiApplication.Objects.get("settings").get("speed");
        this.get("storage").altitude = mGtiApplication.Objects.get("settings").get("altitude");
        this.get("storage").distance = mGtiApplication.Objects.get("settings").get("distance");
        this.get("storage").time = mGtiApplication.Objects.get("settings").get("time");
        this.get("storage").zoom = mGtiApplication.Objects.get("settings").get("zoom");
        this.get("storage").compassState = mGtiApplication.Objects.get("settings").get("compassState");
        this.get("storage").lastMapLon = mGtiApplication.Objects.get("settings").get("lastMapLon");
        this.get("storage").lastMapLat = mGtiApplication.Objects.get("settings").get("lastMapLat");

        mGtiApplication.Objects.get("mLogHistory").pop();
    },

    //Speichert die Login-Daten im LocalStorage
    saveLoginData: function() {

        mGtiApplication.Objects.get("mLogHistory").push("mGtiDataModelLocalStorage.saveLoginData()");

        this.get("storage").username = mGtiApplication.Objects.get("settings").get("username");
        this.get("storage").password = mGtiApplication.Objects.get("settings").get("password");

        mGtiApplication.Objects.get("mLogHistory").pop();
    }
});


