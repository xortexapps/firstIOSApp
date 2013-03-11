var mGtiGeolocation = Backbone.Model.extend({
    
    defaults: function() {
        return {
            errorRate: 0,
            latitude: null,
            longitude: null,
            heading: 0,
            oldHeading: 0,
            altitude: null,
            speed: 0,
            accuracy: null,
            oldAccuracy: null
        };
    },
    
    //Es wird versucht die Geodaten abzurufen
    SetWatch: function() {

        mGtiApplication.Objects.get("mLogHistory").push("mGtiGeolocation.SetWatch()");

        //Anlegen des watchProcess, welcher die Position des Geraetes ueberwacht
        mGtiApplication.Objects.set("watchProcess", navigator.geolocation.watchPosition(mGtiApplication.Objects.get("mGeolocation").Success, mGtiApplication.Objects.get("mGeolocation").Failure, {maximumAge: mGtiApplication.Objects.get("refreshTime"), enableHighAccuracy: true}));

        mGtiApplication.Objects.get("mLogHistory").pop();
    },
    
    ClearWatch: function() {
        navigator.geolocation.clearWatch(mGtiApplication.Objects.get("watchProcess"));
        mGtiApplication.Objects.set("watchProcess", null);
    },
    
    //Ueberprueft ob Latitude und Longitude existieren
    //Gibt true oder false zurueck
    locationAvailable: function() {

        if(this.get('latitude') !== null && this.get('longitude') !== null) {
            return true;
        }
        else {
            return false;
        }
    },
    
    //Wird aufgerufen falls die Positionsbestimmung erfolgreich war
    Success: function(position) {

        mGtiApplication.Objects.get("mLogHistory").push("mGtiGeolocation.Success()");

        mGtiApplication.Objects.get("mGeolocation").set({
            oldAccuracy: mGtiApplication.Objects.get("mGeolocation").get('accuracy')
        });
        
        //Fehlerrate wird zurueckgesetzt
        mGtiApplication.Objects.get("mGeolocation").set({errorRate: 0});

        if(position.coords.latitude != null) {
            mGtiApplication.Objects.get("mGeolocation").set({latitude: position.coords.latitude});
        }
        if(position.coords.accuracy != null) {
            mGtiApplication.Objects.get("mGeolocation").set({accuracy: position.coords.accuracy});
        }
        if(position.coords.longitude != null) {
            mGtiApplication.Objects.get("mGeolocation").set({longitude: position.coords.longitude});
        }
        if(position.coords.altitude != null) {
            mGtiApplication.Objects.get("mGeolocation").set({altitude: Math.round(position.coords.altitude)});
        }
        if(position.coords.speed != null) {
            //Umrechnung von m/s in km/h und runden auf einen ganzen Wert
            mGtiApplication.Objects.get("mGeolocation").set({speed: Math.round(position.coords.speed * 3.6)});
            //Nur wenn eine Geschwindigkeit existiert kann es eine Bewegungsrichtung geben
            //Und nur wenn der Kompass nicht aktiviert ist, darf die Bewegungsrichtung ausgelesen werden
            if(position.coords.heading != null && !mGtiApplication.Objects.get("mCompass").get("compass_activated")) {
                //In oldHeading wird immer die letzte Ausrichtung gespeichert
                mGtiApplication.Objects.get("mGeolocation").set({oldHeading: mGtiApplication.Objects.get("mGeolocation").get('heading')});
                mGtiApplication.Objects.get("mGeolocation").set({heading: position.coords.heading});
            }
        }

        mGtiApplication.Objects.get("mLogHistory").pop();
    },
    //Wird aufgerufen falls bei der Positionsbestimmung ein Fehler aufgetreten ist
    Failure: function(error) {
        //Fehlerrate wird um 1 erhoeht
        mGtiApplication.Objects.get("mGeolocation").set({errorRate: mGtiApplication.Objects.get("mGeolocation").get('errorRate') + 1});
        
        //Ueberpruefung wie viele Fehler aufgetreten sind
        if(mGtiApplication.Objects.get("mGeolocation").get('errorRate') < 3) {
            
            switch(error.code) 
            {
                case error.TIMEOUT:
                    $().toastmessage('showWarningToast', "Timeout bei Positionsbestimmung");
                    break;
                case error.POSITION_UNAVAILABLE:
                    $().toastmessage('showWarningToast', "Position nicht verfuegbar");
                    break;
                case error.PERMISSION_DENIED:
                    $().toastmessage('showWarningToast', "Zugriff auf Position verweigert");
                    break;
                case error.UNKNOWN_ERROR:
                    $().toastmessage('showWarningToast', "Unbekannter Fehler bei Positionsabfrage");
                    break;
            }
        }
        //Wenn mehr als 3 Fehler hintereinander aufgetreten sind, wird der Vorgang abgebrochen
        //und der watchProcess geloescht
        else {
            $().toastmessage('showErrorToast', "Keine Bestimmung der Position moeglich");
            mGtiApplication.Objects.get("mGeolocation").ClearWatch();
        }
    }
});


