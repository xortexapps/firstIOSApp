var mGtiRecordingControllerBtnRecord = Backbone.View.extend({

    /**** Parameter *****
     * el
     * mRecord
     * vBtnRecord
     * logHistory
     * cTour
     * mJson
     * mDatabase
     */

    events: {
        'click #btn_record': 'BtnRecordClickHandler'
    },

    init: function() {

        this.options.logHistory.push("mGtiRecordingControllerBtnRecord.init()");

        //Das Record-Model benoetigt die Tour-Collection und das Datenbank-Model
        this.options.mRecord.set({cTour: this.options.cTour});
        this.options.mRecord.set({mDatabase: this.options.mDatabase});

        this.options.vBtnRecord.model = this.options.mRecord;
        //Das Model reagiert darauf, wenn sich die recording Eigenschaft veraendert
        this.options.mRecord.bind('change:recording', this.options.mRecord.RecordingChangedHandler, this.options.mRecord);

        this.options.logHistory.pop();
    },

    BtnRecordClickHandler: function() {

        this.options.logHistory.push("mGtiRecordingControllerBtnRecord.BtnRecordClickHandler()");

        //Die Eigenschaft welche aussagt ob gerade aufgezeichnet wird oder nicht
        //wird umgeschaltet
        if(this.options.mRecord.get("recording")) {
            this.options.mRecord.set({recording: false});

            this.AddOrRemoveGeolocationEventListeners();

            //Der Aufzeichnungsdialog wird geoeffnet
            $.mobile.changePage('recordDialog.html',
                {transition: 'none', allowSamePageTransition: true, role: "dialog"});
       }
        else {

            this.options.mRecord.set({recording: true});
            this.AddOrRemoveGeolocationEventListeners();
        }

        //Der Button muss sein Aussehen anpassen
        this.options.vBtnRecord.BtnRecordClickHandler();

        this.options.logHistory.pop();
    },

    PositionChangedHandler: function() {

        var self = this;
        var distance = 100;
        //Fuer die Berechnung muessen Vorgaengerpunkte existieren
        if(this.options.mRecord.get("previousLon") != null) {

            distance = this.options.mDistance.get_distance(
                mGtiApplication.Objects.get("mGeolocation").get("longitude"),
                mGtiApplication.Objects.get("mGeolocation").get("latitude"),
                this.options.mRecord.get("previousLon"),
                this.options.mRecord.get("previousLat")
            );
        }
        //Fuegt der Aufzeichnung einen neuen Trackpunkt hinzu,
        //falls die Genauigkeit unter 31 Metern liegt
        //und beide Positionswerte verfuegbar sind
        //und der Abstand zum letzten Punkt zumindest 10 Meter betraegt
        if(mGtiApplication.Objects.get("mGeolocation").get("accuracy") < 11
            && mGtiApplication.Objects.get("mGeolocation").locationAvailable()
            && distance > 9) {
            this.options.mRecord.AddTrackPoint(
                mGtiApplication.Objects.get("mGeolocation").get("longitude"),
                mGtiApplication.Objects.get("mGeolocation").get("latitude"),
                mGtiApplication.Objects.get("mGeolocation").get("altitude")
            );

            //Wenn ein neuer Trackpunkt angelegt wird, wird auch die zurueckgelegte Distanz aktualisiert
            this.options.mDistance.set({distance: this.options.mDistance.get("distance") + distance});

            //Bei jedem fuenften Trackpunkt wird der Track in der Datenbank zwischengespeichert,
            //damit er nach einem moeglichen Absturz immer noch existiert
            if(this.options.mRecord.get("track").get("cTrackpoints").length % 5 == 0) {
                //Es wird ein JSON-Objekt aus dem Track-Model erzeugt
                var track = self.options.mRecord.get("track").clone();
                //Die Layer beinhalten Circular-Data, welche von JSON.stringify() nicht unterstuetzt wird
                track.set({track_layer: null});
                track.set({vector_layer: null});
                var data = self.options.mJson.createJSONString(track);
                //console.log(data);
                //Schreibt die Daten in die Datenbank
                self.options.mRecord.get("track").updateTrackData(data, self.options.mDatabase);
            }
        }
    },

    AddOrRemoveGeolocationEventListeners: function() {

        this.options.logHistory.push("mGtiRecordingControllerBtnRecord.AddOrRemoveGeolocationEventListeners()");

        if(this.options.mRecord.get("recording")) {
            mGtiApplication.Objects.get("mGeolocation").bind('change:longitude', this.PositionChangedHandler, this);
        }
        else {
            mGtiApplication.Objects.get("mGeolocation").unbind('change:longitude', this.PositionChangedHandler, this);
        }

        this.options.logHistory.pop();
    }
});

