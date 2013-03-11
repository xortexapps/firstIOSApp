var mGtiTourModelTrack = Backbone.Model.extend({
    
    defaults: function (){
        
        return {
            
            //Der OpenLayers-Layer auf welchem die Wegpunkte angezeigt werden
            vector_layer: null,
            //Der OpenLayers-Layer auf welchem der Track angezeigt wird
            //gml_layer: null,
            track_layer: null,
            //Die Collection aller Wegpunkte des Tracks
            cWaypoints: new mGtiDataCollectionWaypoints(),
            //Die Collection aller Trackpoints
            cTrackpoints: new mGtiTourCollectionTrackpoints(),
            
            title: null,
            desc: null,
            id:0,
            cat: "",
            image: null,
            trackrank: 0,
            distance: 0, 
            height: 0,
            circuit: 0,
            day: 0,
            hour: 0,
            min: 0,
            minlon: null,
            minlat: null,
            maxlon: null,
            maxlat: null,
            profile: null,
            download: null,
            //Die Farbe des Tracks
            color: "#e99600",
            waypointSymbol: null
        };
    },
    
    initialize: function() {
        
        
        //Event triggert wenn das Model aus einer Collection entfernt wird
        this.bind("remove", function() {
            
            var track = this;
            track.deleteTrack(track);
        });
    },
    
    deleteTrack: function(track) {

        mGtiApplication.Objects.get("mLogHistory").push("mGtiTourModelTrack.deleteTrack()");

        var collection = mGtiApplication.Objects.get("cTour");
        
        //Es darf keine Abfrage durchgefuehrt werden, wenn der aktive Track nicht mehr existiert
        if(collection.activeTrack != null) {

            //Wenn der entfernte Track der derzeit aktive war
            //muss die Simulation beendet werden
            if(track.get("id") == collection.activeTrack.get("id"))
            {

                //Falls die Simulation aktiviert ist, wird diese deaktiviert
                //und die echten Positionsdaten stattdessen abgerufen
                if(mGtiApplication.Objects.get("settings").get("simulation") == 1) {

                    mGtiApplication.Objects.get("settings").set({simulation: 0});
                    //Die zurueckgelegte Distanz wird auf 0 gesetzt
                    mGtiApplication.Objects.get("mDistance").set({distance: 0});
                    mGtiApplication.activateSettings();
                }

                //Der aktive Track wird entfernt
                collection.activeTrack = null;
            }
        }

        //Wenn derzeit das Kartenmaterial fuer diesen Track heruntergeladen wird
        //muss der Download gestoppt werden
        if(track == mGtiApplication.Objects.get("mMapDownload").get("track"))
            mGtiApplication.Objects.get("mMapDownload").stopCaching();

        //Kartenmaterial kann nur geloescht werden,
        //wenn auch der Speicher existiert und Kartenmaterial fuer diesen Track verfuegbar ist
        if(mGtiApplication.Objects.get("mapStorage") != null
            && window.localStorage.getItem(track.get("id"))) {
            track.deleteMapData(track, function(arg) {}, function(error) {});
        }
        //Loescht den Layer ueber welchen der Track dargestellt wird
        track.deleteLayer();
        if(mGtiApplication.Objects.get("mDatabase").get("db") != null) {
            track.deleteTrackFromDatabase(track.get("id"), mGtiApplication.Objects.get("mDatabase"));
        }

        //Entfernt den Event-Listener fuer den geloeschten Track von der Karte
        mGtiApplication.Objects.get("map").events.unregister( "zoomend", track, track.mapZoomChangedHandler);
        //Loescht alle Eigenschaften des Tracks
        track.clear();

        mGtiApplication.Objects.get("mLogHistory").pop();
    },

    //Schreibt das neue data-JSON-Objekt in die Datenbank
    updateTrackData: function(data, database) {

        var self = this;

        database.get("db").transaction(function(t) {
            t.executeSql("UPDATE Track SET data = ? WHERE id = ?;" ,
                [data, self.get("id")],
                database.StatementSuccess,
                database.StatementError);
        });
    },

    //Loescht das Kartenmaterial zu diesem Track aus der Datenbank
    //und entfernt den Eintrag im LocalStorage
    deleteMapData: function(track, onSuccess, onError) {

        mGtiApplication.Objects.get("mLogHistory").push("mGtiTourModelTrack.deleteMapData()");

        //Wenn derzeit das Kartenmaterial fuer diesen Track heruntergeladen wird
        //muss der Download gestoppt werden
        if(track == mGtiApplication.Objects.get("mMapDownload").get("track"))
            mGtiApplication.Objects.get("mMapDownload").stopCaching();

        //Loescht alle Eintraege mit der TrackID aus dem Map-Storage
        mGtiApplication.Objects.get("mapStorage").clear(
            track.get("id"),
            function(arg) {
                onSuccess(arg);
            },
            function(error) {
                onError(error);
            },
            null
        );

        //Der Eintrag des Tracks im LocalStorage, welcher die Verfuegbarkeit von Kartenmaterial angibt,
        //wird geloescht
        mGtiApplication.Objects.get("localStorage").get("storage").removeItem(track.get("id"));

        mGtiApplication.Objects.get("mLogHistory").pop();
    },

    //Loescht den Layer ueber welchen der Track dargestellt wird
    deleteLayer: function() {

        //Loescht die Layer
        if(this.get("vector_layer") != null)
            this.get("vector_layer").destroy();
        if(this.get("track_layer") != null)
            this.get("track_layer").destroy();
    },

    //Loescht den uebergebenen Track aus der uebergebenen Datenbank
    deleteTrackFromDatabase: function(trackID, mDatabase) {

        mGtiApplication.Objects.get("mLogHistory").push("mGtiTourModelTrack.deleteTrackFromDatabase()");

        mDatabase.get("db").transaction(function(t) {
            t.executeSql("DELETE FROM Track WHERE id = ?" ,
                [trackID],
                mDatabase.StatementSuccess,
                mDatabase.StatementError);
        });

        mGtiApplication.Objects.get("mLogHistory").pop();
    },

    //Reagiert auf eine Aenderung des Zoomlevels der Karte
    mapZoomChangedHandler: function() {

        //Wenn weit genug hineingezoomt wurde, werden die Wegpunkte angezeigt
        if(mGtiApplication.Objects.get("map").getZoom() > 14) {
            this.showFeatures();
        }
        else {
            this.hideFeatures();
        }
    },

    //Blendet den Layer mit den Vektor-Features aus
    hideFeatures: function() {
        this.get("vector_layer").setVisibility(false);
    },

    //Blendet den Layer mit den Vektor-Features ein
    showFeatures: function() {
        //Features duerfen nur angezeigt werden wenn auch der Track sichtbar ist
        if(this.get("track_layer").getVisibility())
            this.get("vector_layer").setVisibility(true);
    },

    hideLayer: function() {
        //Versteckt die Layer
        this.get("vector_layer").setVisibility(false);
        this.get("track_layer").setVisibility(false);
    },
    
    showLayer: function() {
        //Zeigt die Layer
        this.get("track_layer").setVisibility(true);
        this.get("vector_layer").setVisibility(true);
    },
    
    //Fuer jeden Wegpunkt in der Collection wird ein neuer Marker angelegt
    //und in den Vector-Layer geladen
    loadWaypointsIntoLayer: function () {

        mGtiApplication.Objects.get("mLogHistory").push("mGtiTourModelTrack.loadWaypointsIntoLayer()");
        
        var self = this;
        
        _(self.get("cWaypoints").models).each(function(waypoint){
            
            var size = new OpenLayers.Size(16,26);
            //var icon = new OpenLayers.Icon('res/Icons/marker.png', size, offset);
            var icon;
            var outlineColor = "";
            var fontcolor = "";
            if(!self.get("recording")) {
                icon = self.get("waypointSymbol");
                fontcolor = self.get("color").color;
                outlineColor = self.get("color").complement;
            }
            else {
                icon = 'res/Icons/marker_green.png';
                //Gruenton
                fontcolor = "#1AFF1A";
                //Rotton
                outlineColor = "#FF1A1A";
            }

            //Der Markerstyle braucht die meisten Eigenschaften der Stylemap des Layers ebenfalls,
            //da die Stylemap nicht angewendet wird, wenn ein eigener Style vorhanden ist
            var markerstyle = {
                graphicWidth:size.w,
                graphicHeight:size.h,
                graphicXOffset:-(size.w/2),
                graphicYOffset:-size.h,
                externalGraphic:icon,
                //Das Label erhaelt das Text-Attribut der Features als Text
                label : waypoint.get("name"),
                fontColor: fontcolor,
                fontSize: "14px",
                fontFamily: "Helvetica, 'Helvetica Neue', Arial, sans-serif",
                fontWeight: "bold",
                labelAlign: "lb",
                labelOutlineColor: outlineColor,
                labelOutlineWidth: 3,
                labelXOffset: size.w,
                labelYOffset: size.h / 2
            };

            //Ein neuer Marker wird erzeugt
            //Erhaelt zusaetzlich noch den Titel, die Beschreibung und die Zeilen-ID als Attribute
            var marker = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(waypoint.get("lon"),waypoint.get("lat")).transform(
                mGtiApplication.Objects.get("map").displayProjection,
                mGtiApplication.Objects.get("map").projection)
            );
            marker.style = markerstyle;
            marker.attributes = {
                name: waypoint.get("name"),
                desc: waypoint.get("desc"),
                lon: waypoint.get("lon"),
                lat: waypoint.get("lat")
            };

            self.get("vector_layer").addFeatures([marker]);
        }, this);

        mGtiApplication.Objects.get("mLogHistory").pop();
    },

    //Laedt alle Trackpunkte in einen Pfad und zeichnet diesen in den Layer
    loadTrackPointsIntoLayer: function() {

        mGtiApplication.Objects.get("mLogHistory").push("mGtiTourModelTrack.loadTrackPointsIntoLayer()");

        var self = this;
        //Array in welches die Koordinaten gespeichert werden
        var points = new Array();

        var countFeatures = 0;
        var counter = 0;
        var distance = parseInt(self.get("cTrackpoints").models.length / 10);
        distance = (distance > 4) ? distance : 5;

        //Liesst den Trackpoint aus und fuegt die Koordinaten dem Array hinzu
        _(self.get("cTrackpoints").models).each(function(trackpoint){ // in case collection is not empty

            //Bei jedem fuenften Trackpunkt wird eine Markierung angelegt
            //Es sollen nur 6 Markierungen erstellt werden (Performancegruende!)
            if(counter % distance == 0 || (counter == 4)) {

                countFeatures++;
                var point = new OpenLayers.Geometry.Point(trackpoint.get("lon"),trackpoint.get("lat")).transform(
                    mGtiApplication.Objects.get("map").displayProjection,
                    mGtiApplication.Objects.get("map").projection);
                var pointFeature = new OpenLayers.Feature.Vector(point);
                //Der Text soll eine hinaufzaehlende Reihe sein
                pointFeature.attributes = {
                    text: countFeatures,
                    //Das Label wird center-mid platziert
                    align: "cm"
                };
                self.get("vector_layer").addFeatures([pointFeature]);
            }
            points.push(
                new OpenLayers.Geometry.Point(trackpoint.get("lon"),trackpoint.get("lat")).transform(
                    mGtiApplication.Objects.get("map").displayProjection,
                    mGtiApplication.Objects.get("map").projection)
            );

            counter++;
        }, this);

        //Erzeugt einen LineString aus dem Points Array
        var line = new OpenLayers.Geometry.LineString(points);

        //Der Stil der Linie
        //Wenn die ID -1 ist, wurde die Aufzeichnung beim letzten beenden nicht abgeschlossen
        if(!self.get("recording")) {
            var style = {
                strokeColor: self.get("color").color,
                strokeOpacity: 1,
                strokeWidth: 4
            };
        }
        else {
            var style = {
                strokeColor: "#1AFF1A",
                strokeOpacity: 1,
                strokeWidth: 4
            };
        }

        //Ein Linien-Feature erstellen
        var lineFeature = new OpenLayers.Feature.Vector(line, null, style);

        //Das Feature dem Layer hinzufuegen
        self.get("track_layer").addFeatures([lineFeature]);

        mGtiApplication.Objects.get("mLogHistory").pop();
    },

    //Berechnet die Laenge und Hoehenmeter des Tracks
    GetTrackInfo: function() {

        mGtiApplication.Objects.get("mLogHistory").push("mGtiTourModelTrack.GetTrackInfo()");

        var self = this;

        var info = {
            distance: 0,
            altitude: 0
        }
        var prevPoint = null;

        //Durchlaeuft alle Trackpunkte
        _(self.get("cTrackpoints").models).each(function(trackpoint) {

            if(prevPoint != null) {
                //Die Distanz zwischen dem aktuellen und dem vorhergehenden Punkt wird berechnet
                //und der Gesamtdistanz hinzugefuegt
                info.distance += mGtiApplication.Objects.get("mDistance").get_distance(
                    trackpoint.get("lon"), trackpoint.get("lat"),
                    prevPoint.get("lon"), prevPoint.get("lat")
                );
                //Der Hoehenunterschied wird dem Gesamthoehenunterschied hinzugefuegt
                info.altitude += Math.abs(trackpoint.get("ele") - prevPoint.get("ele"));
            }
            prevPoint = trackpoint;
        });

        info.altitude = parseInt(info.altitude);
        info.distance = parseInt(info.distance);

        mGtiApplication.Objects.get("mLogHistory").pop();

        return info;
    },

    //Erzeugt die XML-Datei fuer den Track
    //und gibt diese zurueck
    generateXml: function() {

        var self = this;
        var xmlwriter = new mGtiDataModelXmlWriter();

        xmlwriter.beginNode("tour");
        xmlwriter.beginNode("title");
        xmlwriter.setValue(self.get("title"));
        xmlwriter.endNode();
        xmlwriter.beginNode("gpxdata");
        xmlwriter.beginNode("gpx",
            {
                version: 1.1,
                xmlns: "http://www.topografix.com/GPX/1/1",
                creator: "gps-tour.info/navigate",
                "xmlns:xsi": "http://www.w3.org/2001/XMLSchema-instance",
                "xsi:schemaLocation": "http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd"
            }
        );
        //Fuegt alle Wegpunkte an die XML-Datei an
        _(self.get("cWaypoints").models).each(function(waypoint) {
            xmlwriter.beginNode("wpt", {
                lon: waypoint.get("lon"),
                lat: waypoint.get("lat")
            });
            xmlwriter.beginNode("ele");
            xmlwriter.setValue(waypoint.get("ele"));
            xmlwriter.endNode();
            xmlwriter.beginNode("name");
            xmlwriter.setValue(waypoint.get("name"));
            xmlwriter.endNode();
            xmlwriter.beginNode("desc");
            xmlwriter.setValue(waypoint.get("desc"));
            xmlwriter.endNode();
            //Schliesst den Wegpunkt ab
            xmlwriter.endNode();
        });
        xmlwriter.beginNode("trk");
        xmlwriter.beginNode("name");
        xmlwriter.setValue(self.get("title"));
        xmlwriter.endNode();
        xmlwriter.beginNode("trkseg");
        //Fuegt alle Trackpunkte an die XML-Datei an
        _(self.get("cTrackpoints").models).each(function(trackpoint) {
            xmlwriter.beginNode("trkpt", {
                lon: trackpoint.get("lon"),
                lat: trackpoint.get("lat")
            });
            xmlwriter.beginNode("ele");
            xmlwriter.setValue(trackpoint.get("ele"));
            xmlwriter.endNode();
            xmlwriter.beginNode("time");
            xmlwriter.setValue(trackpoint.get("time"));
            xmlwriter.endNode();
            //Schliesst den Trackpunkt ab
            xmlwriter.endNode();
        });

        //trkseg
        xmlwriter.endNode();
        //trk
        xmlwriter.endNode();
        //gpx
        xmlwriter.endNode();
        //gpxdata
        xmlwriter.endNode();

        //Eigenschaften anfuegen
        xmlwriter.beginNode("cat");
        xmlwriter.setValue(self.get("cat"));
        xmlwriter.endNode();

        xmlwriter.beginNode("duration_days");
        xmlwriter.setValue(self.get("day"));
        xmlwriter.endNode();

        xmlwriter.beginNode("duration_hours");
        xmlwriter.setValue(self.get("hour"));
        xmlwriter.endNode();

        xmlwriter.beginNode("duration_minutes");
        xmlwriter.setValue(self.get("min"));
        xmlwriter.endNode();

        xmlwriter.beginNode("country");
        xmlwriter.setValue(self.get("country"));
        xmlwriter.endNode();

        xmlwriter.beginNode("federal");
        xmlwriter.setValue(self.get("state"));
        xmlwriter.endNode();

        xmlwriter.beginNode("region");
        xmlwriter.setValue("");
        xmlwriter.endNode();

        xmlwriter.beginNode("district");
        xmlwriter.setValue(self.get("county"));
        xmlwriter.endNode();

        xmlwriter.beginNode("descr");
        xmlwriter.setValue(self.get("desc"));
        xmlwriter.endNode();

        xmlwriter.beginNode("fun");
        xmlwriter.setValue(self.get("fun"));
        xmlwriter.endNode();

        xmlwriter.beginNode("landscape");
        xmlwriter.setValue(self.get("landscape"));
        xmlwriter.endNode();

        xmlwriter.beginNode("condition");
        xmlwriter.setValue(self.get("condition"));
        xmlwriter.endNode();

        xmlwriter.beginNode("skill");
        xmlwriter.setValue(self.get("skill"));
        xmlwriter.endNode();

        //tour
        xmlwriter.endNode();

        var xml = xmlwriter.getFile();
        xmlwriter.destroy();

        return xml;
    }
});