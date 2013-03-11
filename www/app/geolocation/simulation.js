
var mGtiGeolocationSimulation = Backbone.Model.extend({
    
    defaults: function() {
        return {
            latitude: null,
            longitude: null,
            heading: 0,
            oldHeading: 0,
            oldDistance: 0,
            altitude: null,
            speed: 0,
            anzahl_trpk: 0,
            track_length: 0,
            accuracy: null,
            oldAccuracy: null
        };
    },
    
    SetWatch: function() {

        mGtiApplication.Objects.get("mLogHistory").push("mGtiGeolocationSimulation.SetWatch()");

        //mGtiApplication.Objects.get("mGeolocation").ClearWatch();
        //Es wird ein Intervall-Timer gesetzt welcher die Success-Funktion im angegebenen Zeitabstand immer wieder aufruft
        mGtiApplication.Objects.set("watchProcess", window.setInterval("mGtiApplication.Objects.get('mGeolocation').Success()", mGtiApplication.Objects.get("refreshTime")));

        mGtiApplication.Objects.get("mLogHistory").pop();
    },
    
    ClearWatch: function() {
        //Der Intervall-Timer wird auf "null" gesetzt
        window.clearInterval(mGtiApplication.Objects.get("watchProcess"));
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
    
    //Simulierte Werte werden erzeugt und zugewiesen
    Success: function() {

        mGtiApplication.Objects.get("mLogHistory").push("mGtiGeolocationSimulation.Success()");

        var track = mGtiApplication.Objects.get("cTour").activeTrack;
        
        mGtiApplication.Objects.get("mGeolocation").set({oldHeading:  mGtiApplication.Objects.get("mGeolocation").get('heading')});
        
        //Simulation fuer die Position
        if(mGtiApplication.Objects.get("mGeolocation").get('anzahl_trpk') < track.get("cTrackpoints").length)
        {
            //Die Positionsdaten werden auf den naechsten Trackpunkt angepasst
            mGtiApplication.Objects.get("mGeolocation").set({latitude: 
                    track.get("cTrackpoints").at(mGtiApplication.Objects.get("mGeolocation").get('anzahl_trpk')).get("lat")});
            mGtiApplication.Objects.get("mGeolocation").set({longitude: 
                    track.get("cTrackpoints").at(mGtiApplication.Objects.get("mGeolocation").get('anzahl_trpk')).get("lon")}); 

            //Distanz und Winkel zwischen diesem und dem vorherigen Trackpunkt werden berechnet
            if (mGtiApplication.Objects.get("mGeolocation").get('anzahl_trpk') > 0)
            {
                var distance = mGtiApplication.Objects.get("mDistance").get_distance(
                track.get("cTrackpoints").at(mGtiApplication.Objects.get("mGeolocation").get('anzahl_trpk')).get("lat"),
                track.get("cTrackpoints").at(mGtiApplication.Objects.get("mGeolocation").get('anzahl_trpk')).get("lon"),
                track.get("cTrackpoints").at(mGtiApplication.Objects.get("mGeolocation").get('anzahl_trpk') - 1).get("lat"),
                track.get("cTrackpoints").at(mGtiApplication.Objects.get("mGeolocation").get('anzahl_trpk') - 1).get("lon"));
                mGtiApplication.Objects.get("mDistance").set({distance: mGtiApplication.Objects.get("mDistance").get('distance') + distance});

                mGtiApplication.Objects.get("mGeolocation").calculate_heading();
            }

            //Simulation fuer die Hoehe
            mGtiApplication.Objects.get("mGeolocation").set({altitude:  Math.round(track.get("cTrackpoints").at(mGtiApplication.Objects.get("mGeolocation").get('anzahl_trpk')).get("ele"))});

            //Der Zaehler fuer den aktuellen Trackpunkt wird um 1 erhoeht
            mGtiApplication.Objects.get("mGeolocation").set({'anzahl_trpk': mGtiApplication.Objects.get("mGeolocation").get('anzahl_trpk') + 1});
        }  
        else
        {
            mGtiApplication.Objects.get("mGeolocation").set({'anzahl_trpk': 0});
            mGtiApplication.Objects.get("mGeolocation").set({'heading:': 0});
        }

        //Simulation fuer die Geschwindigkeit
        mGtiApplication.Objects.get("mGeolocation").set({speed:  0});

        mGtiApplication.Objects.get("mGeolocation").set({oldAccuracy:
            mGtiApplication.Objects.get("mGeolocation").get("accuracy")
        });

        mGtiApplication.Objects.get("mGeolocation").set({accuracy: 0});

        mGtiApplication.Objects.get("mLogHistory").pop();
    }, 
    
    calculate_heading: function() {

        mGtiApplication.Objects.get("mLogHistory").push("mGtiGeolocationSimulation.calculate_heading()");

        var track = mGtiApplication.Objects.get("cTour").activeTrack;
        
        var trackpoint = track.get("cTrackpoints").at(mGtiApplication.Objects.get("mGeolocation").get('anzahl_trpk'));
        var former_trackpoint = track.get("cTrackpoints").at(mGtiApplication.Objects.get("mGeolocation").get('anzahl_trpk') - 1);

        //Die Lon und Lat Werte werden in Meter umgerechnet
        //Wert x wird berechnet
        var wert_x =  
            Math.acos(Math.sin(former_trackpoint.get("lat")/180*Math.PI)*Math.sin(former_trackpoint.get("lat")/180*Math.PI) + 
            Math.cos(former_trackpoint.get("lat")/180*Math.PI)*
            Math.cos(former_trackpoint.get("lat")/180*Math.PI)*Math.cos(trackpoint.get("lon")/180*Math.PI-former_trackpoint.get("lon")/180*Math.PI) ) * 6378.137;
        
        //Wert y wird berechnet
        var wert_y = 
            Math.acos(Math.sin(former_trackpoint.get("lat")/180*Math.PI)*Math.sin(trackpoint.get("lat")/180*Math.PI) + 
            Math.cos(former_trackpoint.get("lat")/180*Math.PI)*
            Math.cos(trackpoint.get("lat")/180*Math.PI)*Math.cos(trackpoint.get("lon")/180*Math.PI-trackpoint.get("lon")/180*Math.PI) ) * 6378.137;
        var ancle = 0;

        //Fuer das Endergenis muss unterschieden werden in welchem Sektor (zw. 0° und 90°, 90° und 180°,...)
        //sich der Winkel befindet
        if(former_trackpoint.get("lon") > trackpoint.get("lon"))
        {
            //Sektor 4
            if (former_trackpoint.get("lat") < trackpoint.get("lat"))
            {
                ancle = ((Math.atan((wert_y/wert_x)))*360)/ (2 * Math.PI);
                mGtiApplication.Objects.get("mGeolocation").set({heading: 270 + ancle});
            }
            else {
                //Sektor 3
                ancle = ((Math.atan((wert_x/wert_y)))*360)/ (2 * Math.PI);
                mGtiApplication.Objects.get("mGeolocation").set({heading: 180 + ancle});
            }
        }
        else if (former_trackpoint.get("lon") < trackpoint.get("lon"))
        {
            if (former_trackpoint.get("lat") < trackpoint.get("lat"))
            {
                //Sektor1;
                ancle = ((Math.atan((wert_x/wert_y)))*360)/ (2 * Math.PI);
                mGtiApplication.Objects.get("mGeolocation").set({heading: ancle});
            }
            else {
                //Sektor2
                ancle = ((Math.atan((wert_y/wert_x)))*360)/ (2 * Math.PI);
                mGtiApplication.Objects.get("mGeolocation").set({heading: 90 + ancle});
            }
        }

        mGtiApplication.Objects.get("mLogHistory").pop();
    }
});

