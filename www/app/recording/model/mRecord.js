var mGtiRecordingModelRecord = Backbone.Model.extend({

    defaults: function() {
        return {
            recording: false,
            track: null,
            cTour: null,
            previousLon: null,
            previousLat: null,
            stopWatch: null,
            //Diese Eigenschaften werden in den Dialog geladen
            time: 0,
            distance: 0,
            altitude: 0,
            country: "",
            state: "",
            county: "",
            city: "",
            suburb: ""
        };
    },

    //
    RecordingChangedHandler: function() {

        var self = this;

        //Die Aufzeichnung wurde aktiviert
        if(self.get("recording")) {

            //Falls noch kein Track existiert muss dieser angelegt werden
            if(self.get("track") == null) {

                self.set({
                    track: new mGtiTourModelTrack({
                        image: "/redx/tools/mb_image.php/cid.055084047081098099103122082065065061/gid.2/tour_default.jpg"
                    })
                });

                //Wenn die Eigenschaft existiert, handelt es sich um den aufzeichnenden Track
                //Wichtig um nach einem App-Neustart die Aufzeichnung fortsetzen zu koennen
                self.get("track").set({recording: true});

                //Liest aus, wie viele Tracks in der Collection aufgezeichnet wurden
                var numRecordedTracks = _.filter(self.get("cTour").models, function(track) { return (track.get("id") < 0); }).length;

                var id = (numRecordedTracks + 1) * (-1);

                self.get("track").set({id: id});

                //Der Datenbank-Eintrag fuer den Track wird angelegt
                self.get("mDatabase").AddTrack(id, "{}");

                //Der Track muss der Tour-Collection hinzugefuegt werden,
                //damit die Wegpunkte bearbeitet werden koennen
                self.get("cTour").addTrack(self.get("track"));
            }
            //Das Model reagiert darauf wenn ein Trackpunkt hinzugefuegt wurde
            self.get("track").get("cTrackpoints").bind("add", self.AddedTrackPointHandler, self);
            //Das Stoppen der Dauer wird gestartet
            self.StartStopWatch();
        }
        else {
            self.get("track").get("cTrackpoints").unbind("add", self.AddedTrackPointHandler, self);
            //Das Stoppen der Dauer wird angehalten
            self.StopStopWatch();
        }
    },

    //Zeichnet eine Linie zwischen dem hinzugefuegten und dem vorherigen Trackpunkt
    AddedTrackPointHandler: function(trackpoint) {

        var self = this;

        //self.get("drawControl").insertXY(trackpoint.get("lon"), trackpoint.get("lat"));
        //Der vorherige Trackpunkt
        var prevTrackpoint = self.get("track").get("cTrackpoints").at(self.get("track").get("cTrackpoints").length - 2);
        var points = new Array();

        if(prevTrackpoint != null) {
            //Vorherigen Trackpunkt dem Array hinzufuegen
            points.push(
                new OpenLayers.Geometry.Point(prevTrackpoint.get("lon"),prevTrackpoint.get("lat")).transform(
                    mGtiApplication.Objects.get("map").displayProjection,
                    mGtiApplication.Objects.get("map").projection)
            );
            //Neuen Trackpunkt dem Array hinzufuegen
            points.push(
                new OpenLayers.Geometry.Point(trackpoint.get("lon"),trackpoint.get("lat")).transform(
                    mGtiApplication.Objects.get("map").displayProjection,
                    mGtiApplication.Objects.get("map").projection)
            );

            //Erzeugt einen LineString aus dem Points Array
            var line = new OpenLayers.Geometry.LineString(points);

            //Der Stil der Linie
            var style = {
                //Hellgruen
                strokeColor: "#1AFF1A",
                strokeOpacity: 1,
                strokeWidth: 4
            };

            //Ein Linien-Feature erstellen
            var lineFeature = new OpenLayers.Feature.Vector(line, null, style);

            //Das Feature dem Layer hinzufuegen
            self.get("track").get("track_layer").addFeatures([lineFeature]);
        }
    },

    //Fuegt einen neuen Trackpoint am Ende des Tracks an
    //Parameter: Laengengrad, Breitengrad, Hoehe
    AddTrackPoint: function(lon, lat, ele) {

        var self = this;

        //Legt den neuen Trackpunkt an
        var trackPoint = new mGtiTourModelTrackpoint({
            lon: lon,
            lat: lat,
            ele: ele,
            time: self.GetXsdDateTime()
        });
        self.set({previousLon: lon});
        self.set({previousLat: lat});

        self.get("track").get("cTrackpoints").add(trackPoint);
    },

    //Gibt die aktuelle Zeit im XsdDateTime-Format zurueck
    GetXsdDateTime: function() {

        var date = new Date();
        //Fuegt eine redundante 0 an falls der Wert kleiner als 10 ist
        function pad(n) {
            var s = n.toString();
            return s.length < 2 ? '0'+s : s;
        };

        var yyyy = date.getFullYear();
        var mm1  = pad(date.getMonth()+1);
        var dd   = pad(date.getDate());
        var hh   = pad(date.getHours());
        var mm2  = pad(date.getMinutes());
        var ss   = pad(date.getSeconds());

        return yyyy +'-' +mm1 +'-' +dd +'T' +hh +':' +mm2 +':' +ss + "Z";
    },

    //Startet die Stoppuhr
    StartStopWatch: function() {
        var self = this;
        self.set({stopWatch: window.setInterval(function() {self.StopWatchCallbackHandler(self);}, 1000)});
    },

    StopStopWatch: function() {

        window.clearInterval(this.get("stopWatch"));
        this.set({stopWatch: null});
    },

    ResetStopWatch: function() {
        this.set({time: 0});
    },

    //Zaehlt die Zeit um 1 nach oben
    StopWatchCallbackHandler: function(self) {
        //console.log("StopWatchCallbackHandler");
        self.set({time: self.get("time") + 1});
    }
});