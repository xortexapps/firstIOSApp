var mGtiMapViewOpenLayers = Backbone.View.extend({
    init: function() {

        mGtiApplication.Objects.get("mLogHistory").push("mGtiMapViewOpenLayers.init()");

        // Anlegen der Karte
        mGtiApplication.Objects.set("map", new OpenLayers.Map({
            div: "div_map",
            theme: null,
            projection: new OpenLayers.Projection("EPSG:900913"),
            //Mit dieser Eigenschaft kann aktivert werden,
            //ob auf Zwischenzoomstufen gezoomt werden kann
            fractionalZoom: false,
            displayProjection: new OpenLayers.Projection("EPSG:4326"), 
            controls: [
            ],
            layers: [
                new OpenLayers.Layer.OSM("OpenStreetMap",
                    ["./tiles/tiles.php?z=${z}&x=${x}&y=${y}&r=mapnik"],
                    { transitionEffect: 'resize',
                        isBaseLayer:false,
                        serverResolutions: [156543.03390625, 78271.516953125,
                            39135.7584765625, 19567.87923828125,
                            9783.939619140625, 4891.9698095703125,
                            2445.9849047851562, 1222.9924523925781,
                            611.4962261962891, 305.74811309814453,
                            152.87405654907226, 76.43702827453613,
                            38.218514137268066, 19.109257068634033,
                            9.554628534317017, 4.777314267158508,
                            2.388657133579254, 1.194328566789627,
                            0.5971642833948135],
                        resolutions: [156543.03390625, 78271.516953125,
                            39135.7584765625, 19567.87923828125,
                            9783.939619140625, 4891.9698095703125,
                            2445.9849047851562, 1222.9924523925781,
                            611.4962261962891, 305.74811309814453,
                            152.87405654907226, 76.43702827453613,
                            38.218514137268066, 19.109257068634033,
                            9.554628534317017, 4.777314267158508,
                            2.388657133579254, 1.194328566789627,
                            0.5971642833948135]
                    }),
                new OpenLayers.Layer.OSM("OpenCycleMap",
                    ["./tiles/tiles.php?z=${z}&x=${x}&y=${y}&r=cycle"],
                    { transitionEffect: 'resize',
                        isBaseLayer: true,
                        visibility: false,
                        serverResolutions: [156543.03390625, 78271.516953125,
                            39135.7584765625, 19567.87923828125,
                            9783.939619140625, 4891.9698095703125,
                            2445.9849047851562, 1222.9924523925781,
                            611.4962261962891, 305.74811309814453,
                            152.87405654907226, 76.43702827453613,
                            38.218514137268066, 19.109257068634033,
                            9.554628534317017, 4.777314267158508,
                            2.388657133579254, 1.194328566789627],
                        resolutions: [156543.03390625, 78271.516953125,
                            39135.7584765625, 19567.87923828125,
                            9783.939619140625, 4891.9698095703125,
                            2445.9849047851562, 1222.9924523925781,
                            611.4962261962891, 305.74811309814453,
                            152.87405654907226, 76.43702827453613,
                            38.218514137268066, 19.109257068634033,
                            9.554628534317017, 4.777314267158508,
                            2.388657133579254, 1.194328566789627,
                            0.5971642833948135]
                    })
            ],
            //Positionierung der Karte
            center: new OpenLayers.LonLat(742000, 5861000),
            //Zoomstufe
            zoom: 13
        })
        );

        OpenLayers.ProxyHost = "./tiles.php?z=${z}&x=${x}&y=${y}&r=mapnik";
        
        mGtiApplication.Objects.get("vMap").initClickHandler();
        
        /*var attribution = new OpenLayers.Control.Attribution();
        mGtiApplication.Objects.get("map").addControl(attribution);
        
        attribution.activate();*/
        
        var touch = new OpenLayers.Control.TouchNavigation({
            dragPanOptions: {
                enableKinetic: false,
                interval: 35
            }
        });
        mGtiApplication.Objects.get("map").addControl(touch);
        touch.activate();
        
        var navigation = new OpenLayers.Control.Navigation({
        });

        mGtiApplication.Objects.get("map").addControl(navigation);
        navigation.activate();
        
        //Fuegt das selbst erstellte Click-Event hinzu
        var click = new OpenLayers.Control.Click();
        mGtiApplication.Objects.get("map").addControl(click);
        click.activate();

        mGtiApplication.Objects.get("mLogHistory").pop();
    },

    //Fuegt einen Event-Listener hinzu, welcher Positionsaenderungen in den LocalStorage schreibt
    addMoveEndEventListener: function() {

        mGtiApplication.Objects.get("map").events.register("moveend", null, function() {

            var pos = mGtiApplication.Objects.get("map").getCenter().transform(
                mGtiApplication.Objects.get("map").projection,
                mGtiApplication.Objects.get("map").displayProjection);

            mGtiApplication.Objects.get("settings").set({lastMapLon: pos.lon}, {silent: true});
            mGtiApplication.Objects.get("settings").set({lastMapLat: pos.lat});
        });
    },
    
    //Legt den Layer fuer die Marker an
    initMarkerLayer: function() {
        
        mGtiApplication.Objects.get("mUserWaypoints").set({waypointLayer: new OpenLayers.Layer.Vector("Waypoints")});
        mGtiApplication.Objects.get("map").addLayer(mGtiApplication.Objects.get("mUserWaypoints").get("waypointLayer"));
    },

    //Wird aufgerufen wenn der Benutzer auf einen Wegpunkt geklickt hat
    //Erhaelt als Parameter das geklickte Vektor-Feature und den dazugehoerigen Track
    editMarker: function(feature, track) {

        //Die Variable fuer das ausgewaehlte Feature wird gesetzt
        mGtiApplication.Objects.get("mUserWaypoints").set({clickedFeature: feature});
        //Gibt an zu welchem Track das ausgewahlte Feature gehoert
        mGtiApplication.Objects.get("mUserWaypoints").set({track: track});
        
        //Der Wegpunkt-Dialog wird geoeffnet
        $.mobile.changePage('#popup_waypoint',
            {transition: 'none', allowSamePageTransition: true, role: "dialog"});
    },
    
    //Fuegt dem Marker-Layer einen neuen Marker hinzu
    addMarker: function(lon, lat, name, desc, id) {

        var size = new OpenLayers.Size(16,26);
        var offset = new OpenLayers.Pixel(-(size.w/2), -size.h);
        //var icon = new OpenLayers.Icon('res/Icons/marker.png', size, offset);
        var icon = 'res/Icons/marker.png';
        var markerstyle = {
            graphicWidth:size.w, graphicHeight:size.h,
            graphicXOffset:-(size.w/2), graphicYOffset:-size.h,
            externalGraphic:icon,
            label : name,
            fontColor: "#E3E3E3",
            fontSize: "14px",
            fontFamily: "Helvetica, 'Helvetica Neue', Arial, sans-serif",
            fontWeight: "bold",
            labelAlign: "lb",
            labelOutlineColor: "#444444",
            labelOutlineWidth: 4,
            labelXOffset: size.w,
            labelYOffset: size.h / 2
        }
        
        //Ein neuer Marker wird erzeugt
        //Erhaelt zusaetzlich noch den Titel, die Beschreibung und die Zeilen-ID als Attribute
        var marker = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(lon,lat).transform(
            mGtiApplication.Objects.get("map").displayProjection,
            mGtiApplication.Objects.get("map").projection),
            {
                name: name,
                desc: desc,
                id: id,
                //Die Vector-Features erhalten die nicht umgerechneten Positionen als Attribute
                lon: lon,
                lat: lat
            },
            markerstyle);

        mGtiApplication.Objects.get("mUserWaypoints").get("waypointLayer").addFeatures([marker]);
    },
    //Greift auf die Collection der Waypoints zu
    //Fuegt fuer jedes Model einen Wegpunkt hinzu
    loadWaypoints: function() {

        mGtiApplication.Objects.get("mLogHistory").push("mGtiMapViewOpenLayers.loadWaypoints()");

        var i;
        var waypoints = mGtiApplication.Objects.get("cWaypoints");
        for(i = 0; i < waypoints.length; i++) {
            
            var waypoint = waypoints.at(i);
            
            var lon = waypoint.get("lon");
            var lat = waypoint.get("lat");
            var name = waypoint.get("name");
            var desc = waypoint.get("desc");
            var id = waypoint.get("id");
            
            mGtiApplication.Objects.get("vMap").addMarker(lon, lat, name, desc, id);
        }

        mGtiApplication.Objects.get("mLogHistory").pop();
    },
    
    locate: function() {

        mGtiApplication.Objects.get("mLogHistory").push("mGtiMapViewOpenLayers.locate()");

        //Die Position muss verfuegbar sein und exitieren
        if(mGtiApplication.Objects.get("mGeolocation").locationAvailable()) {
            
            //Wenn der Positionlayer noch nicht existiert wird dieser angelegt
            if (mGtiApplication.Objects.get("position") == null)
            {
                var icon;

                var useragent = navigator.userAgent.toLowerCase();
                //Falls es sich um einen Android 2.x Browser handelt
                //wird ein eigenes Icon verwendet
                if(useragent.indexOf("android 2") > -1) {
                    icon = "res/Icons/locate.png";
                }
                else {
                    icon = "res/Icons/location.png";
                }

                var size = new OpenLayers.Size(24, 24);
                //Anlegen des Positions-Layers
                mGtiApplication.Objects.set("position", new OpenLayers.Layer.Vector( "Position" ));

                var markerstyle = {graphicWidth:24, graphicHeight:24, graphicXOffset:-(size.w/2), graphicYOffset:-(size.h/2), externalGraphic:icon};
                
                //Anlegen und setzen des Positionsmarkers
                mGtiApplication.Objects.set("marker", new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(mGtiApplication.Objects.get("mGeolocation").get('longitude'),
                mGtiApplication.Objects.get("mGeolocation").get('latitude')).transform(mGtiApplication.Objects.get("map").displayProjection,
                mGtiApplication.Objects.get("map").projection),null,markerstyle,null,markerstyle)); 
                
                //Der Positionsmarker wird dem Positionlayer hinzugefuegt
                mGtiApplication.Objects.get("position").addFeatures([mGtiApplication.Objects.get("marker")]);

                //Fuegt der Karte den Layer fuer die Position hinzu
                mGtiApplication.Objects.get("map").addLayer(mGtiApplication.Objects.get("position"));

                //Wenn eine TrackID ueber einen Parameter uebergeben wurde
                //und dieser erfolgreich heruntergeladen wurde, darf die Karte nicht umpositioniert werden
                if(mGtiApplication.Objects.get("cTour").get(mGtiApplication.Objects.get("parameterTrackID")) == null) {
                    //Setzt die Karte einmal auf die Position an der sich der Benutzer befindet
                    mGtiApplication.Objects.get("map").setCenter(new OpenLayers.LonLat(mGtiApplication.Objects.get("mGeolocation").get('longitude'),
                        mGtiApplication.Objects.get("mGeolocation").get('latitude')).transform(mGtiApplication.Objects.get("map").displayProjection,
                        mGtiApplication.Objects.get("map").projection));
                }

            }
            //Wenn der Layer bereits existiert wird nur noch der Marker auf die aktuelle Position verschoben
            else
            {
                mGtiApplication.Objects.get("marker").move(new OpenLayers.LonLat(mGtiApplication.Objects.get("mGeolocation").get('longitude'),
                    mGtiApplication.Objects.get("mGeolocation").get('latitude')).transform(mGtiApplication.Objects.get("map").displayProjection,
                    mGtiApplication.Objects.get("map").projection));

                //Verschieben der Genauigkeits-Anzeige
                mGtiApplication.Objects.get("vAccuracy").move(new OpenLayers.LonLat(mGtiApplication.Objects.get("mGeolocation").get('longitude'),
                    mGtiApplication.Objects.get("mGeolocation").get('latitude')).transform(mGtiApplication.Objects.get("map").displayProjection,
                    mGtiApplication.Objects.get("map").projection));
            }  

            mGtiApplication.Objects.get("vMap").center();
        }

        mGtiApplication.Objects.get("mLogHistory").pop();
    },
    
    //Wenn die Option aktiv ist, wird die Karte auf die gegenwaertige Position zentriert
    center: function() {

        mGtiApplication.Objects.get("mLogHistory").push("mGtiMapViewOpenLayers.center()");

        if (mGtiApplication.Objects.get("mCompass").get("state") != 0)
        {
            mGtiApplication.Objects.get("map").setCenter(new OpenLayers.LonLat(mGtiApplication.Objects.get("mGeolocation").get('longitude'),
            mGtiApplication.Objects.get("mGeolocation").get('latitude')).transform(mGtiApplication.Objects.get("map").displayProjection,
            mGtiApplication.Objects.get("map").projection));
        }

        mGtiApplication.Objects.get("mLogHistory").pop();
    },
    
    //Setzt die Karte auf die standardmaeßige Zoomstufe
    defaultZoom: function() {
        mGtiApplication.Objects.get("map").zoomTo(16);
    },

    //Fuegt dem Kartenelement alle CSS-Eigenschaften fuer die Animation hinzu
    activateMapAnimation: function() {

        $("#div_map").css("-webkit-transition", "all 0.1s");
        $("#div_map").css("-moz-transition", "all 0.1s");
        $("#div_map").css("-o-transition", "all 0.1s");
        $("#div_map").css("-ms-transition", "all 0.1s");
        $("#div_map").css("transition", "all 0.1s");
    },

    //Entfernt alle CSS-Eigenschaften fuer die Animation vom Kartenelement
    deactivateMapAnimation: function() {

        $("#div_map").css("-webkit-transition", "none");
        $("#div_map").css("-moz-transition", "none");
        $("#div_map").css("-o-transition", "none");
        $("#div_map").css("-ms-transition", "none");
        $("#div_map").css("transition", "none");
    },
    
    //Richtet die Karte neu aus
    rotateMap: function() {

        //this.rotateMarker();
        var mCompass = mGtiApplication.Objects.get("mCompass");

        mGtiApplication.Objects.get("mLogHistory").push("mGtiMapViewOpenLayers.rotateMap()");

        //Dient dem aktivieren und deaktivieren der Animation
        /*if(Math.abs(mCompass.get("previous_heading") - mCompass.get("heading")) < 270) {
            this.activateMapAnimation();
        }
        else {
            this.deactivateMapAnimation();
        }*/

       //Die Orientierung wird fuer alle moeglichen Browser geaendert
       //Die Orientierung des Browserfensters muss mit eingerechnet werden --> Liefert auf Desktop-Browsern "undefinded" zurueck
        var heading;
        //$().toastmessage("showNoticeToast", mGtiApplication.Objects.get("mCompass").get("deviceOffset"));
        if(mGtiApplication.Objects.get("mCompass").get('heading') != 0) {
            heading = Math.ceil(mGtiApplication.Objects.get("mCompass").get('heading'))
               + ((mGtiApplication.Objects.get("mCompass").get("deviceOffset") != null) ? mGtiApplication.Objects.get("mCompass").get("deviceOffset") : 0)
               + ((window.orientation != null) ? window.orientation : 0);
        }
        else {
            heading = 0;
        }
       $("#div_map").css("-webkit-transform","rotateZ(" + (-heading) + "deg)");
       $("#div_map").css("-moz-transform","rotateZ(" + (-heading) + "deg)");
       $("#div_map").css("transform","rotateZ(" + (-heading) + "deg)");

        mGtiApplication.Objects.get("mLogHistory").pop();
    },

    //Aktiviert alle Controls
    activateControls: function() {

        var self = this;
        //Aktivieren und deaktivieren muss manuell durchgefuehrt werden,
        //da die CacheRead und CacheWrite Controls nicht beeinflusst werden dürfen
        var map = mGtiApplication.Objects.get("map");
        var mDrag = mGtiApplication.Objects.get("mDrag");

        //Falls die Eigenschaft "mouseMoved" true ist,
        //wird die Karte zur Zeit manuell gezogen und die Controls duerfen nicht aktiviert werden
        if(!mDrag.get("mouseMoved")) {
            //map.getControlsByClass("OpenLayers.Control.Attribution")[0].activate();
            map.getControlsByClass("OpenLayers.Control.TouchNavigation")[0].activate();
            map.getControlsByClass("OpenLayers.Control.Navigation")[0].activate();
            map.getControlsByClass("OpenLayers.Control.Click")[0].activate();

            //Das manuelle Ziehen wird deaktiviert
            self.deactivateMapDragEvents();
        }
    },

    //Deaktiviert alle Controls
    deactivateControls: function() {

        var self = this;
        var map = mGtiApplication.Objects.get("map");

        //map.getControlsByClass("OpenLayers.Control.Attribution")[0].deactivate();
        map.getControlsByClass("OpenLayers.Control.TouchNavigation")[0].deactivate();
        map.getControlsByClass("OpenLayers.Control.Navigation")[0].deactivate();
        map.getControlsByClass("OpenLayers.Control.Click")[0].deactivate();

        //Das manuelle Ziehen wird aktiviert
        self.initMapDragEvents();
    },
    
    //Die OpenLayers-Controls werden entweder aktiviert oder deaktiviert
    toggleControls: function() {

        mGtiApplication.Objects.get("mLogHistory").push("mGtiMapViewOpenLayers.toggleControls()");

        //Wenn der Kompass genordet ist und die Karte nicht zentriert wurde
        //werden die Controls aktiviert
        if(mGtiApplication.Objects.get("mCompass").get('state') == 0) {

            mGtiApplication.Objects.get("vMap").activateControls();
        }
        else {
            mGtiApplication.Objects.get("vMap").deactivateControls();
        }

        mGtiApplication.Objects.get("mLogHistory").pop();
    },

    //Die Events fuer das manuelle Kartenziehen werden entfernt
    deactivateMapDragEvents: function() {

        var self = this;

        $("#div_map").unbind("vmousemove", self.mapDragMouseMoveHandler);
        $("#div_map").unbind("vmousedown", self.mapDragMouseDownHandler);
        $("#div_content").unbind("vmouseup", self.mapDragMouseUpHandler);
    },

    mapDragMouseDownHandler: function(event) {

        var self = event.data.parent;

        //Die Maus wurde gedrueckt
        //Event fuer die Mausbewegungen
        //Verschiebt die Karte manuell
        $("#div_map").bind('vmousemove', { parent: self }, self.mapDragMouseMoveHandler);
    },

    mapDragMouseMoveHandler: function(event) {

        var self = event.data.parent;

        var mDrag = mGtiApplication.Objects.get("mDrag");

        //Der Kompass wird wieder auf Status 0 zurueckgesetzt,
        //falls die Maus bewegt wurde
        if(mGtiApplication.Objects.get("mCompass").get("state") != 0) {

            //Die Maus wurde bewegt
            //und die Controls duerfen im MouseUp-Eventhandler wieder aktiviert werden
            //!!Muss vor dem Kompassstatus gesetzt werden!!
            mDrag.set({mouseMoved: true});

            mGtiApplication.Objects.get("mCompass").set({state: 0});
            $("#compass").attr("src", "./res/mainscreen/Kompass_1.png");
        }

        //Es muss eine vorhergehende Position vorhanden sein
        if(mDrag.get("previous_y") != null) {

            //Berechnet die Differenz zur letzten Mausposition
            var dx = mDrag.get("previous_x") - event.pageX;
            var dy = mDrag.get("previous_y") - event.pageY;

            //$().toastmessage('showSuccessToast', "Difference: " + dx + " / " + dy);
            //Verschiebt die Karte um die ausgerechnete Differenz
            if(Math.abs(dx) > 10 || Math.abs(dy) > 10) {
                mGtiApplication.Objects.get("map").pan(dx, dy, {
                    animate: false
                });
                //Setzt die aktuellen Werte als die neuen, vorherigen Werte
                mDrag.SetPosition(event.pageX, event.pageY);
            }
        }
        else {

            mDrag.SetPosition(event.pageX, event.pageY);
        }
    },

    mapDragMouseUpHandler: function(event) {

        //Die Maus wurde ausgelassen
        $("#div_map").unbind('vmousemove');

        var mDrag = mGtiApplication.Objects.get("mDrag");

        //Der Kompass wird wieder auf Status 0 zurueckgesetzt und die Controls damit aktiviert,
        //falls die Maus bewegt wurde
        if(mDrag.get("mouseMoved")) {

            //!!!Muss vor dem Kompassstatus gesetzt werden!!!
            mDrag.set({mouseMoved: false});

            //Durch das kuenstliche ausloesen des Events werden die Controls wieder aktiviert
            //und das manuelle Kartenziehen deaktiviert
            mGtiApplication.Objects.get("mCompass").trigger('change:state');
        }

        //Loescht die Werte
        mDrag.SetPosition(null, null);
    },

    initMapDragEvents: function() {

        mGtiApplication.Objects.get("mLogHistory").push("mGtiMapViewOpenLayers.initMapDragEvents()");

        var self = this;

        //Es wird ueberprueft ob die Maustaste gedrueckt wird
        $("#div_map").bind('vmousedown', { parent: self }, self.mapDragMouseDownHandler);

        //Es wird ueberprueft ob die Maustaste ausgelassen wird
        $("#div_content").bind('vmouseup', { parent: self }, self.mapDragMouseUpHandler);

        mGtiApplication.Objects.get("mLogHistory").pop();
    },
    
    //Der Positionsmarker wird entsprechend der Bewegungsrichtung gedreht
    rotateMarker: function() {

        mGtiApplication.Objects.get("mLogHistory").push("mGtiMapViewOpenLayers.rotateMarker()");

        //Darf nur gedreht werden falls der "position"-Layer auch existiert
        if (mGtiApplication.Objects.get("position")) {
            //Veraendert die Ausrichtung des Markers
            if(mGtiApplication.Objects.get("mCompass").get('heading') != 0) {
                mGtiApplication.Objects.get("marker").style.rotation = mGtiApplication.Objects.get("mCompass").get('heading')
                    + ((mGtiApplication.Objects.get("mCompass").get("deviceOffset") != null) ? mGtiApplication.Objects.get("mCompass").get("deviceOffset") : 0)
                    + ((window.orientation != null) ? window.orientation : 0);
            }
            else {
                mGtiApplication.Objects.get("marker").style.rotation = 0;
            }
            mGtiApplication.Objects.get("marker").layer.redraw();
        }

        mGtiApplication.Objects.get("mLogHistory").pop();
    },
    
    //Der angegebene Layer wird auf den hoechsten Z-Index gehoben
    //und so immer an oberster Stelle angezeigt
    raiseLayerToTop: function(layer) {
        
        var map = mGtiApplication.Objects.get("map");
        map.raiseLayer(layer, map.layers.length);
    },
    
    //Erstellt ein spezielles Click-Event
    initClickHandler: function() {
        
        OpenLayers.Control.Click = OpenLayers.Class(OpenLayers.Control, {                
                defaultHandlerOptions: {
                    'single': true,
                    'double': false,
                    'pixelTolerance': 0,
                    'stopSingle': false,
                    'stopDouble': false
                },

                CLASS_NAME: "OpenLayers.Control.Click",

                initialize: function(options) {
                    this.handlerOptions = OpenLayers.Util.extend(
                        {}, this.defaultHandlerOptions
                    );
                    OpenLayers.Control.prototype.initialize.apply(
                        this, arguments
                    ); 
                    this.handler = new OpenLayers.Handler.Click(
                        this, {
                            'click': this.onClick
                        }, this.handlerOptions
                    );
                },

                //Click-Event auf der gesamten Karte
                onClick: function(evt) {

                    mGtiApplication.Objects.get("mLogHistory").push("mGtiMapViewOpenLayers onClick-Event for Markers");

                    var evtGeom = null;
                    var found = false;

                    //Durchlaeuft alle Features des Vector-Layers fuer die eigenen Wegpunkte
                    for (var feat in mGtiApplication.Objects.get("mUserWaypoints").get("waypointLayer").features) {
                        
                        if (!mGtiApplication.Objects.get("mUserWaypoints").get("waypointLayer").features.hasOwnProperty(feat)) {continue;}

                        //Die EventGeometry stellt jenen Bereich, rund um den Klick dar
                        //Wird nur berechnet falls sie noch nicht existiert
                        if(evtGeom == null)
                            evtGeom = mGtiApplication.Objects.get("vMap").createEventGeometry(evt, mGtiApplication.Objects.get("mUserWaypoints").get("waypointLayer").features[feat].style);

                        //Falls sich der Klick und ein Faeture ueberlagern
                        if (mGtiApplication.Objects.get("mUserWaypoints").get("waypointLayer").features[feat].geometry.intersects(evtGeom)) {
                            
                            //Das ausgewaehlte Feature wurde gefunden und wird der Funktion editMarker uebergeben
                            mGtiApplication.Objects.get("vMap").editMarker(mGtiApplication.Objects.get("mUserWaypoints").get("waypointLayer").features[feat]);
                            found = true;
                            break;
                        }
                    }

                    //Falls noch kein passender Wegpunkt gefunden wurde
                    if(!found) {

                        //Durchlaeuft alle geladenen Tracks
                        //und ueberprueft ob auf einen Wegpunkt, eines dieser Tracks geklickt wurde
                        _(mGtiApplication.Objects.get("cTour").models).each(function(track) {

                            //Durchlaeuft alle Features des Vector-Layers
                            for (var feat in track.get("vector_layer").features) {

                                if (!track.get("vector_layer").features.hasOwnProperty(feat)) {continue;}

                                //Die EventGeometry stellt jenen Bereich, rund um den Klick dar
                                //Wird nur berechnet falls sie noch nicht existiert
                                if(evtGeom == null)
                                    evtGeom = mGtiApplication.Objects.get("vMap").createEventGeometry(evt, track.get("vector_layer").features[feat]);

                                //Falls sich der Klick und ein Faeture ueberlagern
                                if (track.get("vector_layer").features[feat].geometry.intersects(evtGeom)
                                    //Stellt sicher, dass es sich um einen Wegpunkt und keine Richtungsmakierung handelt
                                    && track.get("vector_layer").features[feat].attributes.lon) {

                                    //Das ausgewaehlte Feature wurde gefunden und wird der Funktion editMarker uebergeben
                                    mGtiApplication.Objects.get("vMap").editMarker(track.get("vector_layer").features[feat], track);
                                    break;
                                }
                            }
                        }, this);
                    }

                    mGtiApplication.Objects.get("mLogHistory").pop();
                }
        });
    },

    //Erhaelt ein Klick-Event und die Style-Attribute eines Vector Features
    //Rechnet die Bounds fuer den Klick aus und gibt eine OpenLayers Geometry zurueck
    createEventGeometry: function (evt, style)  {

        mGtiApplication.Objects.get("mLogHistory").push("mGtiMapViewOpenLayers.createEventGeometry()");

        //Wuerde die echten Daten abfragen wenn vorhanden
        //var xtolerance = style.graphicWidth ? (Math.round(style.graphicWidth/2)) : (style.pointRadius || 15);
        //var ytolerance = style.graphicHeight ? (Math.round(style.graphicHeight/2)) : style.pointRadius || 15;
        
        //Die angegebenen Toleranz in Pixeln
        var xtolerance = 20;
        var ytolerance = 20;
        
        var px = evt.xy.x;
        var py = evt.xy.y;

        //Der Offset des Icons wird abgezogen
        if (style.graphicXOffset) {
           px = px-style.graphicXOffset;
        }

        if (style.graphicYOffset) {
           py = py-style.graphicYOffset;
        }
        //Die berechnete Klick-Position
        var loc = mGtiApplication.Objects.get("map").getLonLatFromPixel(new OpenLayers.Pixel(px, py));
        //Die derzeitige Aufloesung der Karte
        var resolution = mGtiApplication.Objects.get("map").getResolution();

        //In diesem Bereich muss der Klick liegen
        var bounds = new OpenLayers.Bounds(loc.lon - resolution * xtolerance,
                                           loc.lat - resolution * ytolerance,
                                           loc.lon + resolution * xtolerance,
                                           loc.lat + resolution * ytolerance);

        mGtiApplication.Objects.get("mLogHistory").pop();


        return bounds.toGeometry();
    },
    
    set_cycle: function()
    {
        //Visibility der OSM auf false setzen und Visibility der OCM auf true
        mGtiApplication.Objects.get("map").getLayersByName("OpenStreetMap")[0].setVisibility(false);
        mGtiApplication.Objects.get("map").getLayersByName("OpenCycleMap")[0].setVisibility(true);
    },
    
    set_standard: function()
    {
        mGtiApplication.Objects.get("map").getLayersByName("OpenCycleMap")[0].setVisibility(false);
        mGtiApplication.Objects.get("map").getLayersByName("OpenStreetMap")[0].setVisibility(true);
    }
});


