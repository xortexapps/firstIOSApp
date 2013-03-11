var mGtiTourCollectionTour = Backbone.Collection.extend({
    
    activeTrackUrl: null,
    activeTrack: null,

    mColors: null,
    //Wird immer beim Hinzufuegen eines Tracks erhoeht,
    //und gibt an welche Farbe ausgewaehlt werden soll
    colorIndex: 0,
    
    model: mGtiTourModelTrack,
    
    //Benoetigt ein Track-Model
    //Legt die Layer des Tracks an und fuegt ihn der Tour-Collection hinzu
    addTrack: function(model_track) {

        mGtiApplication.Objects.get("mLogHistory").push("mGtiTourCollectionTour.addTrack()");

        var self = this;

        var model_track = model_track;

        //Der Index der zu verwenden Farbe
        //Ein derzeit aufzeichnender Track muss weggezaehlt werden
        //var colorIndex = self.length % self.mColors.get("colors").length - self.where({recording: true}).length;

        //Setzt einen neuen Layer auf welchem spaeter die Wegpunkte und Trackmakierungen angezeigt werden
        model_track.set({vector_layer:
            new OpenLayers.Layer.Vector(model_track.get("id"),
            {
                //Die Sylemap legt das Aussehen der Features und
                //in diesem Fall der Feature-Labels fest
                styleMap: new OpenLayers.StyleMap({
                    pointRadius: 0,
                    pointerEvents: "visiblePainted",
                    //Das Label erhaelt das Text-Attribut der Features als Text
                    label : "${text}",
                    fontColor: self.mColors.get("colors")[self.colorIndex % self.mColors.get("colors").length].complement,
                    fontSize: "16px",
                    fontFamily: "Helvetica",
                    fontWeight: "bold",
                    labelOutlineColor: self.mColors.get("colors")[self.colorIndex % self.mColors.get("colors").length].color,
                    labelOutlineWidth: 3,
                    labelAlign: "$(align)"
                })
            })
        });

        //Neuer Vektor Layer auf welchem der Track gezeichnet wird
        model_track.set({track_layer:
            new OpenLayers.Layer.Vector("track_layer")
        });

        //Die Layer werden zur Map hinzugefuegt
        mGtiApplication.Objects.get("map").addLayer(model_track.get("track_layer"));
        mGtiApplication.Objects.get("map").addLayer(model_track.get("vector_layer"));

        //Der Vector-Layer, welcher die Position anzeigt wird an die oberste Stelle gesetzt
        //Wenn der Track durch eine uebergebene TrackID geladen wird, kann es sein das der Layer noch nicht existiert
        if(mGtiApplication.Objects.get("vAccuracy").layer != null)
            mGtiApplication.Objects.get("vMap").raiseLayerToTop(mGtiApplication.Objects.get("vAccuracy").layer);
        if(mGtiApplication.Objects.get("position") != null)
            mGtiApplication.Objects.get("vMap").raiseLayerToTop(mGtiApplication.Objects.get("position"));

        //Die Farbe des Tracks wird gesetzt
        model_track.set({color:
            //Es werden nach der Reihe alle Farben durchgelaufen, und dann wieder mit der ersten begonnen
            self.mColors.get("colors")[self.colorIndex % self.mColors.get("colors").length]
        });

        var sym = new Image();
        sym.onload = function() {
            //Das Wegpunkt-Symbol wird berechnet und dem Track gesetzt
            model_track.set({waypointSymbol: mGtiDataCanvasConverter.exchangeColor(sym, model_track.get("color").complement)});

            //Die Trackpunkte werden in den Track-Vektor-Layer geladen
            model_track.loadTrackPointsIntoLayer();
            //Wegpunkte werden in den Vector-Layer geladen
            model_track.loadWaypointsIntoLayer();
        }

        //Es darf sich nicht um eine abgebrochene Aufzeichnung handeln
        if(!model_track.get("recording")) {

            //Die Funktion wird anfangs einmal aufgerufen,
            //um zu ueberpruefen ob die Features angezeigt werden sollen
            model_track.mapZoomChangedHandler();

            //Falls sich noch kein Track in der Collection befindet
            //wird der neu hinzugefuegte Track als aktiver Track gesetzt
            if(mGtiApplication.Objects.get("cTour").activeTrack == null) {
                mGtiApplication.Objects.get("cTour").activeTrack = model_track;
            }
        }
        //Falls es sich um eine abgebrochene Aufzeichnung handelt,
        //muss der Track dem mRecord-Model gesetzt werden
        else {

            mGtiApplication.Objects.get("mRecord").set({track: model_track});
            //Wenn Trackpunkte im Track vorhanden sind,
            //wird der letzte als previousPoint der Aufzeichnung gesetzt
            if(model_track.get("cTrackpoints").length > 0) {
                mGtiApplication.Objects.get("mRecord").set({
                    previousLon: model_track.get("cTrackpoints").at(model_track.get("cTrackpoints").length - 1).get("lon"),
                    previousLat: model_track.get("cTrackpoints").at(model_track.get("cTrackpoints").length - 1).get("lat")
                });
            }
        }

        sym.src = "res/Icons/marker.png";

        self.colorIndex += 1;

        //Der heruntergeladene Track wird der Tour-Collection hinzugefuegt
        mGtiApplication.Objects.get("cTour").add(model_track);

        mGtiApplication.Objects.get("mLogHistory").pop();
    },

    //Benoetigt ein Datenbank-Objekt eines Tracks
    //Erstellt ein Track-Model und liesst alle Daten ein
    parseTrackFromDatabase: function(track) {

        mGtiApplication.Objects.get("mLogHistory").push("mGtiTourCollectionTour.parseTrackFromDatabase()");

        var trackData = mGtiApplication.Objects.get("mJSON").parseJSONString(track.data);

        trackData.cat = (trackData.cat) ? trackData.cat : "";

        //Anlegen eines neuen Track-Models mit den uebergebenen Eigenschaften
        var model_track = new mGtiTourModelTrack({
            id: track.id,
            title: trackData.title,
            trackrank: trackData.trackrank,
            cat: trackData.cat,
            distance: trackData.distance,
            height: trackData.height,
            circuit: trackData.circuit,
            day: trackData.day,
            hour: trackData.hour,
            min: trackData.min,
            minlon: trackData.minlon,
            minlat: trackData.minlat,
            maxlon: trackData.maxlon,
            maxlat: trackData.maxlat,
            image: trackData.image,
            profile: trackData.profile
        });

        //Falls es sich um eine abgebrochene Aufzeichnung handelt,
        //wird dem Track das Recording-Attribut gesetzt
        if(trackData.recording) {
            model_track.set({recording: true});
        }

        //Die Collections fuer die Track und Wegpunkte
        var waypoints = trackData.cWaypoints;
        var trackpoints = trackData.cTrackpoints;

        //Durchlaeuft alle Wegpunkte und fuegt sie der Collection hinzu
        _(waypoints).each(function(self) {

            var waypoint = new mGtiTourModelWaypoint({});

            waypoint.set({lon: self.lon});
            waypoint.set({lat: self.lat});
            waypoint.set({name: self.name});
            waypoint.set({ele: self.ele});
            waypoint.set({desc: self.desc});

            model_track.get("cWaypoints").add(waypoint);
        });

        //Durchlaeuft alle Trackpunkte und fuegt sie der Collection hinzu
        _(trackpoints).each(function(self) {

            var trackpoint = new mGtiTourModelTrackpoint({});

            trackpoint.set({lon: self.lon});
            trackpoint.set({lat: self.lat});
            trackpoint.set({name: self.name});
            trackpoint.set({ele: self.ele});
            trackpoint.set({time: self.time});

            model_track.get("cTrackpoints").add(trackpoint);
        });

        //Der Track wird vervollstaendigt und der Tour hinzugefuegt
        mGtiApplication.Objects.get("cTour").addTrack(model_track);

        mGtiApplication.Objects.get("mLogHistory").pop();
    },

    //Liest die uebergebene XML-Datei aus
    //und legt ein neues Track Model an
    parseTrackFromGpx: function(gpx, callback) {

        mGtiApplication.Objects.get("mLogHistory").push("mGtiTourCollectionTour.parseTrackFromGpx()");

        //Sucht in der Collection das Waypoint-Model mit der entsprechenden ID
        var model_track = mGtiApplication.Objects.get("cTracklist").get(mGtiApplication.Objects.get("selectedTrackid")).clone();

        //Track darf noch nicht vorhanden sein
        if(mGtiApplication.Objects.get("cTour").get(model_track.get("id")) == null) {

            //Liest die maximalen und minimalen Longitude und Latitude Werte aus
            $(gpx).find("bounds").each(function() {
                var element = $(this);

                model_track.set({minlon: element.attr("minlon")});
                model_track.set({minlat: element.attr("minlat")});
                model_track.set({maxlon: element.attr("maxlon")});
                model_track.set({maxlat: element.attr("maxlat")});
            });

            //Liest alle Wegpunkte aus
            //und fuegt sie dem Track-Model hinzu
            $(gpx).find("wpt").each(function() {

                var element = $(this);
                var waypoint = new mGtiTourModelWaypoint();

                //Auslesen der Eigenschaften
                waypoint.set({lon: element.attr("lon")});
                waypoint.set({lat: element.attr("lat")});

                waypoint.set({ele: element.find("ele").text()});
                waypoint.set({name: element.find("name").text()});
                waypoint.set({sym: element.find("sym").text()});

                //Fuegt den Wegpunkt der Wegpunkt-Collection des Track-Models hinzu
                model_track.get("cWaypoints").add(waypoint);
            });

            //Liest alle Trackpunkte aus
            //und fuegt sie dem Track-Model hinzu
            $(gpx).find("trkpt").each(function() {

                var element = $(this);
                var trackpoint = new mGtiTourModelTrackpoint();

                trackpoint.set({lon: element.attr("lon")});
                trackpoint.set({lat: element.attr("lat")});

                trackpoint.set({ele: element.find("ele").text()});
                trackpoint.set({name: element.find("name").text()});

                model_track.get("cTrackpoints").add(trackpoint);
            });

            //Speichern des Tracks
            //Umwandeln der Trackpoint und Waypoint-Collections in einen JSON String
            //var waypoint_json = mGtiApplication.Objects.get("mJSON").createJSONString(model_track.get("cWaypoints"));
            //var trackpoint_json = mGtiApplication.Objects.get("mJSON").createJSONString(model_track.get("cTrackpoints"));

            //Anlegen der Image-Objekte
            var profile = new Image();
            var image = new Image();

            //Event-Handler der aufgerufen wird, wenn das Bild fertig heruntergeladen wurde
            profile.onload = function() {
                //Der Hoehenprofil-Link wird durch eine Canvas-DataURI ersetzt
                model_track.set({profile: mGtiDataCanvasConverter.convertToDataUri(profile, "image/jpg")});

                image.onload = function() {

                    //Der Track-Bild-Link wird durch eine Canvas-DataURI ersetzt
                    model_track.set({image: mGtiDataCanvasConverter.convertToDataUri(image, "image/jpg")});

                    //Umwandlung des Tracks in einen JSON-String
                    var data = mGtiApplication.Objects.get("mJSON").createJSONString(model_track);
                    //Speichern des Tracks in der Datenbank
                    mGtiApplication.Objects.get("mDatabase").AddTrack(
                        model_track.get("id"), data
                    );

                    //Der Track wird vervollstaendigt und der Tour hinzugefuegt
                    mGtiApplication.Objects.get("cTour").addTrack(model_track);

                    $().toastmessage('showSuccessToast', "Track wurde heruntergeladen");

                    //Falls die Tracklist-View existiert, wurde der Track
                    //ueber die Suche heruntergeladen
                    //Daher muss die Liste angepasst werden
                    if(mGtiApplication.Objects.get("vShowtracklist") != null)
                        mGtiApplication.Objects.get("vShowtracklist").adjustListItemTheme(model_track, "e");

                    //Download abgeschlossen
                    callback(model_track);
                }
                //Setzen des Links um das Bild herunterzuladen
                image.src = model_track.get("image");
            }
            //Setzen des Links um das Bild des Hoehenprofils herunterzuladen
            profile.src = model_track.get("profile");
        }
        else {
            $().toastmessage('showWarningToast', "Track bereits vorhanden");
            //Die Funktion ist abgeschlossen da kein Track heruntergeladen werden musste
            callback();
        }

        mGtiApplication.Objects.get("mLogHistory").pop();
    }
    
});


