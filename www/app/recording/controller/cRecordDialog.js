var mGtiRecordingControllerRecordDialog = Backbone.View.extend({

    /**** Parameter *****
     * el
     * mRecord
     * vRecordDialog
     * logHistory
     * mDatabase
     * mDistance
     * cTour
     */

    events: {
        'click #btnSaveTrack': 'BtnSaveTrackClickHandler',
        'click #btnCancelRecording': 'BtnCancelRecordingClickHandler'
    },

    Init: function() {

        var self = this;

        this.options.logHistory.push("mGtiRecordingControllerRecordDialog.Init()");

        //Wenn die Seite geladen wurde wird zuerst das DOM-Element fuer die Event gesetzt
        //if(this.el != document.getElementById("controlsRecordDialog")) {
            //console.log("Set Element");
            this.setElement(document.getElementById("controlsRecordDialog"));
        //}
    },

    //Die XML-Datei fuer den Track wird erzeugt
    //und die Uebertragung an den Server gestartet
    BtnSaveTrackClickHandler: function() {

        var self = this;

        this.options.logHistory.push("mGtiRecordingControllerRecordDialog.BtnSaveTrackClickHandler()");

        //Es muss ein Titel fuer den Track angegeben werden
        if($("#recTitle").val() == "") {

            $().toastmessage("showNoticeToast", "Es muss ein Titel angegeben werden");
        }
        else {

            var track = self.options.mRecord.get("track").clone();

            //Die Eigenschaften des Tracks werden dem Track-Model gesetzt
            track.set({title: $("#recTitle").val()});
            track.set({hour: Math.floor(self.options.mRecord.get("time") / 3600)});
            track.set({min: Math.floor((self.options.mRecord.get("time") - track.get("hour") * 3600) / 60)});
            track.get("track_layer").destroy();
            track.set({track_layer: null});
            track.get("vector_layer").destroy();
            track.set({vector_layer: null});

            //Entfernt die Aufzeichnungseigenschaft
            track.unset("recording");

            var color = $("#recordDialogHeadline").css("color");
            //Es wird dem Benutzer angezeigt, dass der Track optimiert wird
            $("#recordDialogHeadline").css("color", "green");
            $("#recordDialogHeadline").html("Trackoptimierung...");
            //Der Track wird optimiert, mit einer Toleranz von 5 Metern
            var optimizedTrack = self.optimizeTrack(track, 5);

            //Die zurueckgelegte Strecke und die bewaeltigten Hoehenmeter werden berechnet
            var info = optimizedTrack.GetTrackInfo();
            optimizedTrack.set({distance: Math.round((info.distance / 100)) / 10});
            optimizedTrack.set({height: info.altitude});

            //Das "remove"-Event der Collection darf nicht ausgeloest werden
            self.options.cTour.remove(self.options.mRecord.get("track"), {silent: true});

            //Entfernt den Event-Listener fuer den geloeschten Track von der Karte
            mGtiApplication.Objects.get("map").events.unregister( "zoomend", self.options.mRecord.get("track"), self.options.mRecord.get("track").mapZoomChangedHandler);

            //Erzeugen des Datenstrings
            var data = self.options.mJson.createJSONString(optimizedTrack);
            track.updateTrackData(data, self.options.mDatabase);

            //Der Track wird vervollstaendigt und der Tour hinzugefuegt
            self.options.cTour.addTrack(optimizedTrack);

            //Die Distanz wird zurueckgesetzt
            self.options.mDistance.set({distance: 0});
            //Die Zeit wird zurueckgesetzt
            self.options.mRecord.StopStopWatch();
            self.options.mRecord.ResetStopWatch();

            //Die Eigenschaften des Aufzeichnungs-Models werden zurueckgesetzt
            self.options.mRecord.set({track: null});
            self.options.mRecord.set({previousLon: null});
            self.options.mRecord.set({previousLat: null});
            self.options.mRecord.set({recording: false});

            //Zuruecksetzen der Ueberschrift
            $("#recordDialogHeadline").css("color", color);
            $("#recordDialogHeadline").html("Trackaufzeichnung");

            //Der Dialog wird geschlossen
            $("#popup_recording").dialog("close");

            self.options.logHistory.pop();
        }
    },

    //Optimiert den uebergebenen Track mit der uebergebenen Toleranz (in Metern)
    optimizeTrack: function(track, tolerance) {

        this.options.logHistory.push("mGtiRecordingControllerRecordDialog.optimizeTrack()");

        //Die Collection in welche die neuen Trackpunkte gespeichert werden
        var newTrackPointCollection = new mGtiTourCollectionTrackpoints();
        //Beinhaltet alle aktuellen Abschnitt des Tracks
        var sections = new mGtiRecordingCollectionSections();
        //Der erste Abschnitt besteht aus dem ganzen Track
        sections.add(new mGtiRecordingModelSection({
            sectionNumber: 0,
            trackPoints: track.get("cTrackpoints")
        }));
        //Der erste und letzte Punkt des Tracks werden in die neue Trackpunkt-Collection geladen
        newTrackPointCollection.add(track.get("cTrackpoints").at(0));
        newTrackPointCollection.add(track.get("cTrackpoints").at(track.get("cTrackpoints").length - 1));

        var section;

        //Es wird immer der letzte Abschnitt in der Collection bearbeitet,
        //bis keine Abschnitte mehr existieren (werden nach abgeschlossener Operation geloescht)
        while((section = sections.at(sections.length - 1)) != null) {

            //Es muessen mehr als 2 Punkte vorhanden sein
            if(section.get("trackPoints").length > 2) {

                //Der am weitesten Entfernte Punkt des Abschnittes wird gesucht
                //Gibt ein Objekt mit dem Index des Punktes und dem Abstand(in Metern) zurueck
                var info = section.getFurthestPoint();

                //console.log("Distance: " + info.distance);
                //console.log("Index: " + info.index);

                //Der Abstand muss ueber der Toleranz liegen
                if(info.distance > tolerance) {

                    //console.log("Vor Einschub: " + newTrackPointCollection.at(section.get("sectionNumber") + 1).get("lon"));
                    //Der Punkt wird der neuen Trackpunkt-Collection hinzugefuegt
                    newTrackPointCollection.add(
                        section.get("trackPoints").at(info.index),
                        {at: section.get("sectionNumber") + 1}
                    );
                    //console.log("Eingeschobener: " + newTrackPointCollection.at(section.get("sectionNumber") + 1).get("lon"));
                    //console.log("Verschobener: " + newTrackPointCollection.at(section.get("sectionNumber") + 2).get("lon"));
                    //Aus dem alten Abschnitt werden zwei neue erstellt
                    var newSec1 = new mGtiRecordingModelSection({
                        sectionNumber: section.get("sectionNumber"),
                        //Erhaelt alle Trackpunte vom Anfang bis zum Index
                        trackPoints: new mGtiTourCollectionTrackpoints(_.toArray(section.get("trackPoints")).slice(0, info.index + 1))
                    });
                    var newSec2 = new mGtiRecordingModelSection({
                        sectionNumber: section.get("sectionNumber") + 1,
                        //Erhaelt alle Trackpunte vom Index bis zum Ende
                        trackPoints: new mGtiTourCollectionTrackpoints(_.toArray(section.get("trackPoints")).slice(info.index))
                    });
                    //Die zwei neuen Abschnitte werden der Collection hinzugefuegt
                    sections.add([newSec1, newSec2]);
                    //Der alte Abschnitt wird geloescht und aus der Collection entfernt
                    sections.remove(section);
                    section.destroy();

                    //console.log("Neuer Punkt: " + sections.length);
                }
                //Ansonsten ist der Abschnitt abgeschloss und kann verworfen werden
                else {
                    sections.remove(section);
                    section.destroy();
                    //console.log("In Toleranz: " + sections.length);
                }
            }
            //Ansonsten ist der Abschnitt abgeschloss und kann verworfen werden
            else {
                sections.remove(section);
                section.destroy();
                //console.log("Zu Kurz: " + sections.length);
            }
        }

        //Dem Track die neue Trackpunkt-Collection gesetzt
        track.set({cTrackpoints: newTrackPointCollection});

        this.options.logHistory.pop();

        return track;
    },

    //Setzt das Aufzeichnungs-Model zurueck
    //und loescht den aufzeichnenden Track aus der Datenbank
    BtnCancelRecordingClickHandler: function() {

        var self = this;

        self.options.logHistory.push("mGtiRecordingControllerRecordDialog.optimizeTrack()");

        //Der Track wird aus der Tour-Collection entfernt
        self.options.cTour.remove(self.options.mRecord.get("track"));

        //Die Distanz wird zurueckgesetzt
        self.options.mDistance.set({distance: 0});
        //Die Zeit wird zurueckgesetzt
        self.options.mRecord.StopStopWatch();
        self.options.mRecord.ResetStopWatch();

        //Die Eigenschaften des Aufzeichnungs-Models werden zurueckgesetzt
        self.options.mRecord.set({track: null});
        self.options.mRecord.set({previousLon: null});
        self.options.mRecord.set({previousLat: null});
        self.options.mRecord.set({recording: false});

        self.options.logHistory.pop();
    },

    Finish: function() {

    }
});

