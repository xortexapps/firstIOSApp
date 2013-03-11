var mGtiUiControllerWaypointCreation = Backbone.View.extend({

    /***** Parameter *****
     * el (#div_map)
     * vMap
     * mCompass
     * mWaypointCreation
     * logHistory
     */

    //Sagt aus, ob der Benutzer lange genug gehalten hat
    tapHoldFinished: false,
    tapHoldTimeout: null,

    init: function() {

        var self = this;

        //Die Zeit (in ms) welche gewartet wird, bis ein taphold-Event feuert
        $.event.special.tap.tapholdThreshold = 500;

        //Event-Listener fuer das MouseUp-Event wird hinzugefuegt
        $(self.el).bind("vmousedown", {parent: self }, self.mouseDownHandler);
        //Event-Listener fuer ein TapHold Event auf das Karten-Div wird hinzugefuegt
        $(self.el).bind("taphold", {parent: self }, self.mouseHoldHandler);
    },

    //Wenn der Benutzer den Klick beendet,
    //wird ueberprueft ob er ihn lange genug gehalten hat,
    //um einen Wegpunkt anzulegen
    mouseUpMapHandler: function(evt) {

        var self = evt.data.parent;

        //Die mobilen Android und iOS Browser loesen das MouseUp-Event
        //der Karte aus, statt des wpInner-Divs
        //Falls das Div also sichtbar ist, muss richtige Event-Handler aufgerufen werden
        if($("#wpInner").css("visibility") == "visible") {

            self.mouseUpHandler(evt);
        }
        else {

            self.options.mWaypointCreation.set({startPosX: null});
            self.options.mWaypointCreation.set({startPosY: null});
            self.options.mWaypointCreation.set({pageX: null});
            self.options.mWaypointCreation.set({pageY: null});
            self.resetWaypointCreation();
        }
    },

    mouseUpHandler: function(evt) {

        var self = evt.data.parent;

        //Falls die Maustaste lange genug gehalten wurde,
        //wird der Wegpunktdialog geoeffnet
        if(self.tapHoldFinished) {

            //Die Longitude und Latitude Werte des gedrueckten Punktes werden berechnet
            var pixel = new OpenLayers.Pixel(
                self.options.mWaypointCreation.get("startPosX"),
                self.options.mWaypointCreation.get("startPosY")
            );
            var lonlat = mGtiApplication.Objects.get("map").getLonLatFromPixel(pixel).transform(
                mGtiApplication.Objects.get("map").projection,
                mGtiApplication.Objects.get("map").displayProjection
            );

            //Die Werte werden dem Model gesetzt
            self.options.mWaypointCreation.set({lon: lonlat.lon});
            self.options.mWaypointCreation.set({lat: lonlat.lat});

            self.resetWaypointCreation();

            //Der Wegpunkt-Dialog wird geoeffnet
            $.mobile.changePage('#popup_waypoint',
                {transition: 'none', allowSamePageTransition: true, role: "dialog"});
        }
        else {

            self.options.mWaypointCreation.set({startPosX: null});
            self.options.mWaypointCreation.set({startPosY: null});
            self.options.mWaypointCreation.set({pageX: null});
            self.options.mWaypointCreation.set({pageY: null});
            self.resetWaypointCreation();
        }
    },

    //Handler fuer das MouseDown-Event
    mouseDownHandler: function(evt) {

        var self = evt.data.parent;

        var evt = evt;

        //Falls die Eigenschaften offsetX und offsetY nicht unterstuezt werden,
        //muessen sie selbst berechnet werden
        if(!evt.offsetX) {

            evt.offsetX = parseInt(evt.pageX - $("#div_map").offset().left);
            evt.offsetY = parseInt(evt.pageY - $("#div_map").offset().top);
        }

        //Die Position des MouseDown Events wird gespeichert
        self.options.mWaypointCreation.set({startPosX: evt.offsetX});
        self.options.mWaypointCreation.set({startPosY: evt.offsetY});
        self.options.mWaypointCreation.set({startPageX: evt.pageX});
        self.options.mWaypointCreation.set({startPageY: evt.pageY});
        self.options.mWaypointCreation.set({pageX: evt.pageX});
        self.options.mWaypointCreation.set({pageY: evt.pageY});

        //Der mouseMove Eventlistener wird angelegt
        $(self.el).bind("vmousemove", {parent: self }, self.mouseMoveHandler);
        //Event-Listener fuer ein TapHold Event auf das Karten-Div wird hinzugefuegt
        $(self.el).bind("taphold", {parent: self }, self.mouseHoldHandler);
        //Event-Listener fuer das MouseUp-Event wird hinzugefuegt
        $(self.el).bind("vmouseup", {parent: self}, self.mouseUpMapHandler);
    },

    //Wenn sich die Position im Vergleich zur Anfangsposition,
    //um mehr als x px aendert, muss dar TapHold-Eventlistener entfernt werden
    mouseMoveHandler: function(evt) {

        var self = evt.data.parent;

        //Die Position der Maus/des Fingers wird mitgespeichert
        self.options.mWaypointCreation.set({pageX: evt.pageX});
        self.options.mWaypointCreation.set({pageY: evt.pageY});
    },

    resetWaypointCreation: function() {

        var self = this;

        //Die CSS-Klassen werden von den Div-Elementen entfernt
        $("#wpInner").removeClass("animateCreateWaypoint");
        $("#wpInner").removeClass("createWaypointAnimationProperties");
        $("#wpInner").addClass("rescaleCreateWaypoint");
        $("#wpInner").css("visibility", "hidden");
        $("#wpOuter").css("visibility", "hidden");

        //Wenn ein Timeout existiert, wird es entfernt
        if(self.tapHoldTimeout != null) {

            window.clearTimeout(self.tapHoldTimeout);
            self.tapHoldTimeout = null;
        }

        //Zuruecksetzen der Eigenschaften
        self.tapHoldFinished = false;

        //Entfernen der Events
        $(self.el).unbind("taphold", self.mouseHoldHandler);
        $(self.el).unbind("vmouseup", self.mouseUpMapHandler);
        $(self.el).unbind("vmousemove", self.mouseMoveHandler);
        $("#wpInner").unbind("vmouseup", self.mouseUpHandler);

        //Nach Abschluss oder Abbruch der Wegpunkterzeugung,
        //muessen die Map-Controls und Eventlistener wieder angelegt werden
        //Falls der Kompass sich im Zustand 0 befindet
        if(self.options.mCompass.get("state") == 0)
            self.options.vMap.activateControls();
    },

    //Nachdem das TapHold-Event nach 500ms gefeuert hat,
    //wird ein Timeout mit einer Sekunde gestartet und die Animationsklasse
    //dem div hinzugefuegt
    mouseHoldHandler: function(evt) {

        var self = evt.data.parent;

        //Wenn sich die Position seit dem Start in mind. einer Richtung
        //um mehr als x Pixel veraendert hat, wird die Wegpunkterstellung abgebrochen
        if(Math.abs(self.options.mWaypointCreation.get("pageX") - self.options.mWaypointCreation.get("startPageX")) > 25
            || Math.abs(self.options.mWaypointCreation.get("pageY") - self.options.mWaypointCreation.get("startPageY")) > 25) {

            self.options.mWaypointCreation.set({startPosX: null});
            self.options.mWaypointCreation.set({startPosY: null});
            self.options.mWaypointCreation.set({pageX: null});
            self.options.mWaypointCreation.set({pageY: null});

            self.resetWaypointCreation();
        }
        //Ansonsten wird die Erstellung eines neuen Wegpunktes gestartet
        else {

            //Der Benutzer muss mindestens x ms lang die Maustaste gedrueckt halten,
            //damit der Wegpunktdialog geoeffnet werden darf
            self.tapHoldTimeout = window.setTimeout(function() {

                self.tapHoldFinished = true;
            }, 900);

            //Die Controls der Karte werden deaktiviert
            if(self.options.mCompass.get("state") == 0)
                self.options.vMap.deactivateControls();

            $("#wpOuter").css("height", "25%");
            //console.log($("#wpOuter").css("height"));
            $("#wpOuter").css("width", $("#wpOuter").css("height"));
            $("#wpInner").css("height", $("#wpOuter").css("width"));
            $("#wpInner").css("width", $("#wpOuter").css("width"));

            //Positionieren des Divs
            $("#wpOuter").css("top", (self.options.mWaypointCreation.get("pageY") - ($("#wpOuter").height() / 2)) + "px");
            $("#wpOuter").css("left", (self.options.mWaypointCreation.get("pageX") - ($("#wpOuter").width() / 2)) + "px");

            $("#wpOuter").css("visibility", "visible");
            $("#wpInner").css("visibility", "visible");

            $("#wpInner").removeClass("rescaleCreateWaypoint");
            $("#wpInner").addClass("createWaypointAnimationProperties");
            //Die CSS-Klasse fuer die Animation wird dem Inneren Kreis hinzugefuegt
            $("#wpInner").addClass("animateCreateWaypoint");

            //Der MouseUp-Eventlistener fuer die Erzeugungsfortschrittsanzeige wird angelegt
            $("#wpInner").bind("vmouseup", {parent: self}, self.mouseUpHandler);
        }
    }
});


