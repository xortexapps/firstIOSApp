var mGtiGpsModelCompass = Backbone.Model.extend({
    
    defaults: function() {
        return {
            logHistory: null,
            settings: null,
            localStorage: null,
            mGeolocation: null,
            heading: 0,
            previous_heading: null,
            compass_responded: false,
            //0... frei/genordet, 1... zentriert/genordet, 2... zentriert/nicht genordet
            state: 0,
            compass_activated: false,
            atInitState: true,
            deviceOffset: 0,
            averageHeading: null,
            previousHeadings: new Array(),
            timeOutFinished: true
        };
    },

    //Ueberprueft ob die Kompass-API vom Browser unterstuezt wird
    //Und legt das DeviceOrientationEvent an wenn ja
    checkCompassApiSupport: function() {

        var self = this;
        self.get("logHistory").push("mGtiGpsModelCompass.checkCompassApiSupport()");

        if (window.DeviceOrientationEvent) {

            //Der Kompass wird unterstuezt
            self.set({compass_activated: true});
            //Anlegen des Event-Listeners
            window.addEventListener('deviceorientation',
                function(event) {self.deviceOrientationHandler(event, self)},
                false
            );
            //Ueberprueft nach einer gewissen Zeit ob der Kompass auch Werte zurueckliefert
            window.setTimeout(function() {self.checkCompassRespondence(self)}, 3000);
        }
        else {
            self.set({compass_activated: false});
            //Es wird abgespeichert, dass der Kompass nicht verwendet werden soll
            self.get("settings").set({compass: 0});
            self.get("localStorage").get("storage").setItem("compass", "0");
        }

        self.get("logHistory").pop();
    },

    //Aktiviert oder deaktiviert die Kompass-Events
    toggleCompass: function() {

        var self = this;
        self.get("logHistory").push("mGtiGpsModelCompass.toggleCompass()");

        if(self.get("compass_activated") === true) {

            //Der Kompass wird wieder aktiviert
            self.checkCompassApiSupport();
        }
        else {

            //Die Kompass EventListener werden entfernt
            window.removeEventListener('deviceorientation', self.deviceOrientationHandler, false);
            //Wenn der Kompass nicht verwendet wird, existiert auch kein Offset
            self.set({deviceOffset: 0});
        }

        self.get("logHistory").pop();
    },

    //Ueberprueft ob der Kompass reagiert hat
    checkCompassRespondence: function(self) {

        self.get("logHistory").push("mGtiGpsModelCompass.checkCompassRespondence()");

        //Wenn der Kompass nicht reagiert hat, wird auf die normale Bewegungsrichtung zurueck geschaltet
        if(!self.get("compass_responded")) {

            $().toastmessage('showWarningToast', "Der Kompass reagiert nicht");
            $().toastmessage('showNoticeToast', "Ausrichtung wird über Bewegungsdaten erfasst");
            self.set({compass_activated: false});
            //Es wird abgespeichert, dass der Kompass nicht verwendet werden soll
            self.get("settings").set({compass: 0});
            self.get("localStorage").get("storage").setItem("compass", 0);
        }

        self.get("logHistory").pop();
    },

    //Der Handler fuer das DeviceOrientationEvent
    deviceOrientationHandler: function(event, self) {

        var heading;

        if(self.get("compass_activated")) {

            //Wenn dieser Wert existiert, wird ein iOS Geraet verwendet
            if(event.webkitCompassHeading) {
                heading = event.webkitCompassHeading;
                //Gibt an um wie viel Grad der Kompass verschoben ist
                self.set({deviceOffset: 0});
            }
            //Ansonsten wird die Android Implementation verwendet
            else {
                //Die Android-Implementierung liefert andere Werte zurueck
                if(event.alpha != null)
                    heading = 360 - event.alpha;
                self.set({deviceOffset: -90});
            }

            //Beim ersten mal wird die Ausrichtung sofort gesetzt
            if(self.get("heading") == 0)
                self.set({heading: heading});
            //Der Kompass hat Werte zurueckgeliefert
            if(heading != null) {

                self.set({compass_responded: true});

                //Es werden immer zuerst 3 Werte ausgelesen
                if(self.get("previousHeadings").length < 3) {

                    self.get("previousHeadings").push(heading);
                }
                else {

                    var sum = 0;
                    _(self.get("previousHeadings")).each(function(degrees) {
                        sum += degrees;
                    });

                    //Der Durchschnitt aus den letzten drei Ausrichtungen
                    var average = sum / self.get("previousHeadings").length;

                    //Das Array fuer die Ausrichtung wird ausgeleert
                    self.set({previousHeadings: new Array()});

                    if(self.get("averageHeading") != null) {

                        var difference = Math.ceil(Math.abs(average - self.get("averageHeading")));
                        //Wenn sich die Ausrichtung im Schnitt um mehr als 7° geaendert hat,
                        //wird die Ausrichtung geaendert und die neue durchschnittliche Ausrichtung gesetzt
                        if(difference > 7/* && self.get("timeOutFinished")*/) {
                            self.set({previous_heading: self.get("heading")});
                            self.set({averageHeading: average});
                            self.set({heading: heading});
                            /*self.set({timeOutFinished: false});
                            window.setTimeout(function() {
                                self.set({timeOutFinished: true});
                            }, 300);*/
                        }
                    }
                    //Wenn noch nie eine Ausrichtung erfasst wurde,
                    //wird sie sofort zugewiesen
                    else {
                        self.set({averageHeading: average});
                        self.set({heading: heading});
                    }
                }
            }
        }
    }
});


