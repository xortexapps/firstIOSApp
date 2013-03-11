var mGtiGpsControllerCompass = Backbone.View.extend({

    /**** Parameter ****
    mCompass,
    vCompass,
    vMap,
    logHistory,
    settings,
    localStorage,
    ****/

    events: {
        'click #compass': 'compassClickHandler'
    },

    init: function() {

        this.options.logHistory.push("mGtiGpsControllerCompass.init()");

        //Setzen der Objekte fuer die Models und Views
        this.options.mCompass.set({logHistory: this.options.logHistory});
        this.options.mCompass.set({settings: this.options.settings});
        this.options.mCompass.set({localStorage: this.options.localStorage});
        this.options.mCompass.set({mGeolocation: this.options.mGeolocation});
        this.options.vCompass.model = this.options.mCompass;
        this.options.vCompass.el = $("#compass");

        //Anlegen der Events fuer das Model
        //Wenn das Attribut "heading" geaendert wird,
        //triggert das ein Event und ruft die Rotate Funktion des Positionsmarkers auf
        //this.options.mCompass.bind('change:heading', this.CompassHeadingChangedHandler, this);
        this.options.mCompass.bind('change:heading', this.options.vMap.rotateMarker, this.options.vMap);
        this.options.mCompass.bind('change:state', this.options.vCompass.ChangeCompassStateHandler, this.options.vCompass);
        this.options.mCompass.bind('change:state', this.ChangeCompassStateHandler, this);
        this.options.mCompass.bind('change:state', this.options.vMap.toggleControls, this.options.vMap);
        //Ersetzen?
        this.options.mCompass.bind('change:compass_activated', this.options.mCompass.toggleCompass, this.options.mCompass);

        this.options.logHistory.pop();
    },

    //Handelt das Klick-Event des Kompass,
    //Veraendert die View und das Model entsprechend
    compassClickHandler: function() {

        var self = this;
        self.options.logHistory.push("mGtiGpsControllerCompass.compassClickHandler()");

        switch(parseInt(self.options.mCompass.get('state'))) {
            case 0:
                self.options.mCompass.set({state: 1});
                break;
            case 1:
                self.options.mCompass.set({state: 2});
                break;
            case 2:
                self.options.mCompass.set({state: 0});
                break;
        }

        this.options.logHistory.pop();
    },

    //Wird aufgeruden wenn sich der Zustand des Kompass aendert
    ChangeCompassStateHandler: function() {

        var self = this;

        self.options.logHistory.push("mGtiGpsControllerCompass.ChangeCompassStateHandler()");

        self.options.settings.set({compassState: self.options.mCompass.get("state")});

        if(self.options.mCompass.get("state") != 2) {

            //Die Ausrichtung wird auf Norden gesetzt
            self.options.mCompass.set({heading: 0});

            //In den Zustaenden 0 und 1 duefen Karte und Kompass nicht gedreht werden
            //rotateMarker wird nicht mehr von rotateMap aufgerufen und erhaelt einen eigenen Event-Listener
            //self.options.mCompass.bind('change:heading', self.options.vMap.rotateMarker, self.options.vMap);
            self.options.mCompass.unbind('change:heading', self.options.vCompass.Rotate, self.options.vCompass);
            self.options.mCompass.unbind('change:heading', self.options.vMap.rotateMap, self.options.vMap);
            //Benoetigt um fluessige Animationen in iOS zu bekommen
            /*$("#div_map").css("-webkit-backface-visibility", "visible");
            $("#div_map").css("-webkit-perspective", "none");*/
        }
        //Im Zustand zwei duerfen Kompass und Karte gedreht werden
        else {

            self.options.mCompass.bind('change:heading', self.options.vCompass.Rotate, self.options.vCompass);
            self.options.mCompass.bind('change:heading', self.options.vMap.rotateMap, self.options.vMap);
            //Benoetigt um fluessige Animationen in iOS zu bekommen
            /*$("#div_map").css("-webkit-backface-visibility", "hidden");
            $("#div_map").css("-webkit-perspective", "1000");*/
        }

        if(self.options.mCompass.get("state") == 1) {
            //Setzt die Karte auf die standardmaeßige Zoomstufe
            //Zoom darf nur beim ersten Mal angepasst werden
            if(self.options.mCompass.get("atInitState"))
                self.options.vMap.defaultZoom();
            //Zentriert die Karte auf die aktuelle Position
            self.options.vMap.center();
        }

        //Der Kompasszustand wurde mindestens einmal veraendert
        self.options.mCompass.set({atInitState: false});

        self.options.logHistory.pop();
    },

    //Wird aufgerufen wenn sich die Ausrichtung des Geolocation-Objekts aendert
    //Setzt dem Model den neuen Wert
    GeolocationHeadingChangedHandler: function() {

        var self = this;

        self.options.logHistory.push("mGtiGpsModelCompass.GetHeading()");

        //!!! Zugriff ueber eigenes Objekt funktioniert nicht???
        self.options.mCompass.set({heading: mGtiApplication.Objects.get("mGeolocation").get('heading')});

        self.options.logHistory.pop();
    },

    //Reagiert auf Aenderungen der Kompassausrichtung
    CompassHeadingChangedHandler: function() {

        var self = this;

        console.log("CompassHeadingChangedHandler");

        if(Math.abs(self.options.mCompass.get("previous_heading") - self.options.mCompass.get("heading")) < 180) {
            self.activateCompassAnimation();
        }
        else {
            self.deactivateCompassAnimation();
        }
    },

    //Fuegt dem Kompass die noetigen CSS-Styles hinzu um die Animation zu aktivieren
    activateCompassAnimation: function() {

        $("#compass").css("-webkit-transition", "all 0.1s");
        $("#compass").css("-moz-transition", "all 0.1s");
        $("#compass").css("-o-transition", "all 0.1s");
        $("#compass").css("-ms-transition", "all 0.1s");
        $("#compass").css("transition", "all 0.1s");
    },
    //Entferntdie noetigen CSS-Styles vom Kompass um die Animation zu deaktivieren
    deactivateCompassAnimation: function() {

        $("#compass").css("-webkit-transition", "none");
        $("#compass").css("-moz-transition", "none");
        $("#compass").css("-o-transition", "none");
        $("#compass").css("-ms-transition", "none");
        $("#compass").css("transition", "none");
    }
});


