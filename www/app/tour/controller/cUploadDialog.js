var mGtiTourControllerUploadDialog = Backbone.View.extend({

    /**** Parameter *****
     * el
     * vUploadDialog
     * logHistory
     * mDatabase
     * mDistance
     * cTour
     */

    events: {
        'click #btnSendTrack': 'BtnSendTrackClickHandler'
    },

    init: function() {

        var self = this;

        self.setElement($("#controlsUploadDialog"));

        $("#btnSendTrack").button();

        //Sucht in der Collection das Track-Model mit der entsprechenden ID
        var track = self.options.cTour.get(mGtiApplication.Objects.get("selectedTrackid"));

        //Der View wird der Track als Model zugewiesen
        self.options.vUploadDialog.model = track;

        var lon;
        var lat;

        //Die Startposition des Tracks wird als Punkt fuer die Suche verwendet
        if(track.get("cTrackpoints").length > 0) {
            lon = track.get("cTrackpoints").at(0).get("lon");
            lat = track.get("cTrackpoints").at(0).get("lat");
        }
        //Wenn noch kein Trackpunkt aufgezeichnet wurde,
        //wird die aktuelle Position verwendet
        else {
            lon = mGtiApplication.Objects.get("mGeolocation").get("longitude");
            lat = mGtiApplication.Objects.get("mGeolocation").get("latitude");
        }

        var geocoding = new mGtiGeocodingModelNominatim();
        geocoding.SendRequest(
            lon,
            lat,
            //Success-Callback
            //Erhaehlt ein json-Objekt mit den Addressdetails
            function(json) {

                track.set({country: json.address.country});
                track.set({state: json.address.state});
                track.set({county: json.address.county});
                track.set({suburb: json.address.suburb});

                self.options.vUploadDialog.Init();

                self.options.logHistory.pop();
            },
            //Error-Callback
            function(error) {

                //$().toastmessage('showWarningToast', "Adresse konnte nicht ermittelt werden");
                //Die Seite muss auch initialisiert werden, falls keine Adresse gefunden wurde
                self.options.vUploadDialog.Init();

                self.options.logHistory.pop();
            }
        );
    },

    create: function() {

        var self = this;

        //Das Selectmenue fuer die Kategorien wird gefuellt
        //und Mountainbike anfangs ausgewaehlt
        var categories = self.options.mCategories.getSelectListOptions();
        $("#selectUploadCategory").html(categories);

        _.each($("#selectUploadCategory option"), function(option) {

            if($(option).val() == "Mountainbike") {

                $(option).attr('selected', 'true');
            }
        });
    },

    BtnSendTrackClickHandler: function() {

        var self = this;

        self.options.logHistory.push("mGtiTourControllerUploadDialog.BtnSendTrackClickHandler()");

        //Titel und Beschreibung muessen ausgefuellt sein
        if($("#recTitle").val() == "" || $("#recDescription").val() == "") {

            $().toastmessage("showErrorToast", "Title und Beschreibung müssen ausgefüllt werden");
        }
        else {

            $("#btnSendTrack").addClass("ui-disabled");
            window.scrollTo(0, 1);

            //Zugriff auf den original Track
            var origTrack = mGtiApplication.Objects.get("cTour").get(mGtiApplication.Objects.get("selectedTrackid"));

            //Dem Track werden die eingestellten Eigenschaften gesetzt,
            //und die Layer entfernt
            origTrack.set({title: $("#uploadTitle").val()});
            origTrack.set({desc: $("#uploadDescription").val()});
            origTrack.set({cat: $("#selectUploadCategory").val()});
            origTrack.set({fun: $("#sliderFun").val()});
            origTrack.set({skill: $("#sliderSkill").val()});
            origTrack.set({landscape: $("#sliderLandscape").val()});
            origTrack.set({condition: $("#sliderCondition").val()});
            origTrack.set({country: $("#uploadCountry").val()});
            origTrack.set({state: $("#uploadState").val()});
            origTrack.set({county: $("#uploadCounty").val()});

            //Sucht in der Collection das Track-Model mit der derzeit ausgewaehlten ID
            //und erzeugt einen Klon
            var track = origTrack.clone();

            track.set({track_layer: null});
            track.set({vector_layer: null});

            console.log(origTrack);

            var color = $("#recordDialogHeadline").css("color");

            $("#recordDialogHeadline").css("color", "green");
            $("#recordDialogHeadline").html("XML wird gebaut...");

            //Das XML-File des Tracks wird erstellt
            var xml = track.generateXml();


            $("#recordDialogHeadline").html("Upload...");

            self.sendToServer(xml,

                //Der Success-Callback fuer die Serveranfrage
                function(response, status, xhr) {

                    $("#btnSendTrack").removeClass("ui-disabled");

                    if(xhr.status == "201") {

                        $().toastmessage("showSuccessToast", "Track wurde auf den Server geladen");

                        $("#recordDialogHeadline").css("color", color);
                        $("#recordDialogHeadline").html("Trackaufzeichnung");

                        //Wenn der Track erfolgreich auf den Server geladen wurde,
                        //wird der Eintrag aus der Datenbank entfernt
                        track.deleteTrackFromDatabase(track.get("id"), self.options.mDatabase);

                        //Die ID des Tracks wird aus der Antwort ausgelesen
                        var link = response.getElementsByTagName("resource")[0].firstChild.data;
                        var id = link.slice(link.lastIndexOf("tours/") + 6);

                        //Der aufgezeichnete Track wird mit der uebergebenen ID
                        //neu in die Datenbank gespeichert
                        origTrack.set({id: id});
                        //Erzeugen des Datenstrings
                        var data = self.options.mJson.createJSONString(track);

                        self.options.mDatabase.AddTrack(id, data);
                        //Die Zuweisungen der Kartenteile werden an die neue Track ID angepasst
                        self.options.mDatabase.updateMapToTrackRelations(track.get("id"), id);

                        //Der LocalStorage Eintrag fuer das Kartenmaterial wird umgeschrieben
                        //Falls ein Eintrag vorhanden ist
                        if(window.localStorage.getItem(track.get("id"))) {

                            window.localStorage.removeItem(track.get("id"));
                            window.localStorage.setItem(id, "true");
                        }

                        //Entfernt den Event-Listener fuer den geloeschten Track von der Karte
                        mGtiApplication.Objects.get("map").events.unregister( "zoomend", track, track.mapZoomChangedHandler);

                        //Es wird in das Trackmanagement gewechselt
                        $.mobile.changePage('trackManagement.html');

                        self.options.logHistory.pop();
                    }
                },
                //Der Error-Callback
                function(thrownError, jqXHR) {

                    $("#recordDialogHeadline").css("color", color);
                    $("#recordDialogHeadline").html("Trackaufzeichnung");
                    $("#btnSendTrack").removeClass("ui-disabled");

                    if(jqXHR.responseXML) {

                        var errors = jqXHR.responseXML.getElementsByTagName("error");

                        _.each(errors, function(error) {

                            var type = error.getAttribute("field");
                            var msg = $(error).text();

                            $().toastmessage('showErrorToast', type + ": " + msg);
                        });
                    }
                    else {

                        if(jqXHR.status == "403") {
                            $().toastmessage('showErrorToast', "Zugriff verweigert");
                        }
                        else {
                            $().toastmessage('showErrorToast', "Unbekannter Fehler");
                        }
                    }

                    self.options.logHistory.pop();
                }
            );
        }
    },

    //Sendet das uebergebene GPX-File zum gps-tour.info Server
    sendToServer: function(gpx, onSuccess, onError) {

        //Durchfuehren des Ajax-Requests,
        //um den Track auf den Server zu laden
        var url = encodeURI("http://" + window.location.hostname + "/api/v1/tours/");

        $.ajax({
            type: "POST",
            url: url,
            dataType: "xml",
            contentType: "text/xml",
            data: gpx,
            processData: false,
            //Wenn der Request erfolgreich war wird die Funktion aufgerufen
            //um die Daten aus dem File auszulesen
            success: onSuccess,
            beforeSend: mGtiDataTransferAjax.beforeSendAuthorizationHeader,
            error: function(jqXHR, ajaxSettings, thrownError) {


                onError(thrownError, jqXHR);
            }
        });
    }
});