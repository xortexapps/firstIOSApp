var mGtiMapModelMapDownload = Backbone.Model.extend({

    defaults: function() {
        return {
            map: null,
            track: null,
            zoomLevels: null,
            mapTypes: null,
            cacheWrite: null,
            storage: null,
            zoomCounter: 0,
            trackPointCounter: 0,
            mapTypeCounter: 0
        };
    },

    //Erzeugt die Karte, laedt die Einstellungen und legt das CacheWrite-Control an
    //Benoetigt den Kartentyp
    //Ein Track-Model
    //Die Groesse in Pixel
    //und ein Array von Zoom-Leveln
    init: function(map_types, track, size, zoom_levels) {

        mGtiApplication.Objects.get("mLogHistory").push("mGtiMapModelMapDownload.init()");

        var self = this;

        // Anlegen der Karte
        self.set({map: new OpenLayers.Map({
                div: "div_download_map",
                theme: null,
                projection: new OpenLayers.Projection("EPSG:900913"),
                displayProjection: new OpenLayers.Projection("EPSG:4326"),
                controls: [
                ],
                layers: [
                ]
            })
        });

        self.set({track: track});
        self.set({zoomLevels: zoom_levels});
        self.set({mapTypes: map_types});
        self.set({size: size});

        self.set({cacheWrite: new mGtiMapModelCacheWrite({
            imageFormat: "image/jpeg",
            storage: mGtiApplication.Objects.get("mapStorage"),
            trackId: self.get("track").get("id"),
            eventListeners: {
                cachefull: function() {
                    self.stopCaching();
                    $().toastmessage('showErrorToast', "Im Cache steht kein Speicherplatz mehr zur Verfügung");
                }
            }
        })
        });

        //Hinzufuegen des Controls zur Karte
        self.get("map").addControl(self.get("cacheWrite"));

        //Setzen des Layers
        self.setNewLayer(self.get("mapTypes")[0]);

        //Die Kartengroesse wird auf die uebergebene Groesse gesetzt
        $("#div_download_map").css("width", self.get("size"));
        $("#div_download_map").css("height", self.get("size"));
        self.get("map").updateSize();

        var lon = self.get("track").get("cTrackpoints").at(self.get("trackPointCounter")).get("lon");
        var lat = self.get("track").get("cTrackpoints").at(self.get("trackPointCounter")).get("lat");

        //Positionieren der Karte
        self.get("map").setCenter(new OpenLayers.LonLat(lon, lat).transform(
            self.get("map").displayProjection,
            self.get("map").projection)
        );

        //Wenn die Zoomstufe -1 betraegt, muss eine Uebersichtskarte heruntergeladen werden
        if(self.get("zoomLevels")[self.get("zoomCounter")] == -1) {
            self.loadMapOverview();
        }
        else {
            //Zoomstufe einstellen
            self.get("map").zoomTo(self.get("zoomLevels")[0]);
        }

        self.get("cacheWrite").activate();

        $().toastmessage("showSuccessToast", "Karte wird heruntergeladen");

        mGtiApplication.Objects.get("mLogHistory").pop();
    },

    //Entfernt den aktuellen Layer von der Karte und setzt einen neuen
    setNewLayer: function(mapType) {

        var self = this;

        //Alle aktuellen Layer werden entfernt
        _(self.get("map").layers).each(function(layer) {
            self.get("map").removeLayer(layer);
        });

        //Der neue Layer wird angelegt und hinzugefuegt
        switch (mapType) {

            case 0:
                //console.log("added osm");
                //Hinzufuegen des OpenStreetMap-Layers
                self.get("map").addLayer(new OpenLayers.Layer.OSM("OpenStreetMap",
                    ["http://gps-tour.work.5.xortex.com/navigate/tiles/tiles.php?z=${z}&x=${x}&y=${y}&r=mapnik"],
                    {
                        transitionEffect: 'resize',
                        isBaseLayer:true,
                        eventListeners: {
                            loadend: self.finishedArea
                        }
                    }));
                break;
            case 1:
                //console.log("added ocm");
                //Hinzufuegen des OpenCyleMap-Layers
                self.get("map").addLayer(new OpenLayers.Layer.OSM("OpenCycleMap",
                    ["http://gps-tour.work.5.xortex.com/navigate/tiles/tiles.php?z=${z}&x=${x}&y=${y}&r=cycle"],
                    {
                        transitionEffect: 'resize', isBaseLayer: true,
                        eventListeners: {
                            loadend: self.finishedArea
                        }
                    }));
                break;
        }
    },

    //Der aktuelle Kartenbereich wurde vollstaendig geladen
    //Zum naechsten Zoomlevel wechseln
    //Oder zum naechsten Trackpoint, sollten alle Zoomlevels fuer diesen Trackpoint
    //fertig geladen sein
    finishedArea: function(event) {

        try {
            mGtiApplication.Objects.get("mLogHistory").push("mGtiMapModelMapDownload.finishedArea()");

            var self = mGtiApplication.Objects.get("mMapDownload");

            //Im LocalStorage festhalten, dass fuer diesen Track
            //Kartenmaterial heruntergeladen wurde
            mGtiApplication.Objects.get("localStorage").get("storage").setItem(self.get("track").get("id"), "true");

            //Zuerst werden alle Trackpunkte geladen
            if(self.get("trackPointCounter") < self.get("track").get("cTrackpoints").length - 3) {

                self.set({trackPointCounter: self.get("trackPointCounter") + 3});

                //Positionieren der Karte
                self.get("map").setCenter(new OpenLayers.LonLat(self.get("track").get("cTrackpoints").at(self.get("trackPointCounter")).get("lon"),
                    self.get("track").get("cTrackpoints").at(self.get("trackPointCounter")).get("lat")).transform(self.get("map").displayProjection,
                    self.get("map").projection));

                //console.log("Set to: " + self.get("trackPointCounter"));

                //Zeichnet den Layer neu, wodurch das Loadend-Event wieder ausgeloest wird
                self.get("map").baseLayer.redraw();

            }
            //Alle Trackpunkte fertig geladen -->
            //zum naechsten Zoom-Level wechseln
            else if (self.get("zoomCounter") < self.get("zoomLevels").length - 1) {

                self.set({zoomCounter: self.get("zoomCounter") + 1});

                //Wenn die Zoomstufe -1 betraegt, muss eine Uebersichtskarte heruntergeladen werden
                if(self.get("zoomLevels")[self.get("zoomCounter")] == -1) {
                    self.loadMapOverview();
                }
                else {
                    //Zoomstufe einstellen
                    self.get("map").zoomTo(self.get("zoomLevels")[self.get("zoomCounter")]);

                    //Zoom-Level zuruecksetzen
                    //self.set({zoomCounter: 0});
                    //self.get("map").zoomTo(self.get("zoomLevels")[self.get("zoomCounter")]);

                    self.set({trackPointCounter: 0});
                    //Positionieren der Karte
                    self.get("map").setCenter(new OpenLayers.LonLat(self.get("track").get("cTrackpoints").at(self.get("trackPointCounter")).get("lon"),
                        self.get("track").get("cTrackpoints").at(self.get("trackPointCounter")).get("lat")).transform(self.get("map").displayProjection,
                        self.get("map").projection));

                    //console.log("zoomed to: " + self.get("zoomLevels")[self.get("zoomCounter")]);
                }
            }
            //Wenn alle Zoom-Levels fertig geladen wurden
            //wird auf den naechsten Kartentyp gewechselt
            else if(self.get("mapTypeCounter") < self.get("mapTypes").length - 1) {

                //Setzen der Counter
                self.set({mapTypeCounter: self.get("mapTypeCounter") + 1});
                self.set({zoomCounter: 0});


                //Setzen des neuen Layers
                self.setNewLayer(self.get("mapTypes")[self.get("mapTypeCounter")]);

                if(self.get("zoomLevels")[self.get("zoomCounter")] == -1) {
                    self.loadMapOverview();
                }
                else {

                    //Muss als letztes geaendert werden, da das Event fuer die Fortschrittsanzeige auf diesen Wert reagiert
                    self.set({trackPointCounter: 0});

                    //Zoomstufe einstellen
                    self.get("map").zoomTo(self.get("zoomLevels")[0]);

                    //Positionieren der Karte
                    self.get("map").setCenter(new OpenLayers.LonLat(self.get("track").get("cTrackpoints").at(self.get("trackPointCounter")).get("lon"),
                        self.get("track").get("cTrackpoints").at(self.get("trackPointCounter")).get("lat")).transform(self.get("map").displayProjection,
                        self.get("map").projection));
                }
            }
            //Das Kartenmaterial wurde fertig geladen
            else {

                $().toastmessage('showSuccessToast', "Kartenmaterial fertig geladen");
                self.stopCaching();
            }

            mGtiApplication.Objects.get("mLogHistory").pop();
        }
        catch (e) {

        }
    },

    //Laedt eine Uebersichtskarte fuer den ganzen Track herunter
    loadMapOverview: function() {

        var self = this;

        self.get("map").zoomTo(13);

        var trackWidth = self.get("track").get("maxlon") - self.get("track").get("minlon");
        var trackHeight = self.get("track").get("maxlat") - self.get("track").get("minlat");

        var x = parseFloat(self.get("track").get("minlon")) + parseFloat(trackWidth / 2);
        var y = parseFloat(self.get("track").get("minlat")) + parseFloat(trackHeight / 2);

        var min = new OpenLayers.LonLat(self.get("track").get("minlon"), self.get("track").get("minlat"));
        var max = new OpenLayers.LonLat(self.get("track").get("maxlon"), self.get("track").get("maxlat"));

        min = self.get("map").getPixelFromLonLat(min.transform(self.get("map").displayProjection, self.get("map").projection));
        max = self.get("map").getPixelFromLonLat(max.transform(self.get("map").displayProjection, self.get("map").projection));

        trackWidth = Math.abs(max.x - min.x);
        trackHeight = Math.abs(max.y - min.y);

        //Der groessere Wert muss als Abmessung fuer die Uebersicht verwendet werden
        var trackBounds = (trackWidth > trackHeight) ? trackWidth : trackHeight;

        //Berechnung und Setzen der benoetigten Buffer-Groesse
        var bufferSize = Math.ceil((trackBounds / self.get("map").getTileSize().w) - (self.get("map").getSize().w / self.get("map").getTileSize().w));
        self.get("map").baseLayer.buffer = (bufferSize > 0) ? bufferSize : 0;

        //Wenn ein Ueberblick geladen wird, duerfen die Trackpunkte nicht durchgelaufen werden
        self.set({trackPointCounter: self.get("track").get("cTrackpoints").length});

        //Positionieren der Karte in der Mitte des Tracks
        self.get("map").setCenter(new OpenLayers.LonLat(x, y)
            .transform(self.get("map").displayProjection, self.get("map").projection));
    },

    //Stoppt das Herunterladen und Speichern des Kartenmaterials
    stopCaching: function() {

        mGtiApplication.Objects.get("mLogHistory").push("mGtiMapModelMapDownload.stopCaching()");

        var self = mGtiApplication.Objects.get("mMapDownload");

        //console.log("Stop caching");

        if(self.get("cacheWrite") != null && self.get("map") != null) {

            self.get("cacheWrite").deactivate();
            //Das loadend-Event entfernen
            self.get("map").baseLayer.events.un("loadend");
            self.set({track: null});
            self.set({storage: null});
            self.set({cacheWrite: null});
            self.set({trackPointCounter: 0});
            self.set({zoomCounter: 0});
            self.set({mapTypeCounter: 0});
            //Die Download-Karte aufloesen
            self.get("map").destroy();
        }

        mGtiApplication.Objects.get("mLogHistory").pop();
    }
});