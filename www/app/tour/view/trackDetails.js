var mGtiTourViewTrackDetails = Backbone.View.extend({

    downloadlink: null,
    buttonTemplate: null,

    init: function() {

        mGtiApplication.Objects.get("mLogHistory").push("mGtiTourViewTrackDetails.init()");

        mGtiApplication.Objects.get("vTrackDetails").showDetails();

        mGtiApplication.Objects.get("vTrackDetails").loadTemplates();

        //Klick-Event fuer den Download-Button
        $('#btn_download').click( function() {

            mGtiApplication.Objects.get("vTrackDetails").downloadtrack(function() {}, function() {});
            //Wechsel auf die Tracklist-Seite
            $.mobile.changePage("./track_list.html");
        });

        //Klick-Event fuer den Karte-Loeschen-Button
        $('#btn_delete_map').click( function() {

            //Sicherheitsabfrage ob der Track wirklich geloescht werden soll
            var confirmDelete = window.confirm("Sind Sie sicher?");

            if(confirmDelete) {

                var collection = mGtiApplication.Objects.get("vTrackManagement").collection;

                //Die ID des derzeit ausgewaehlten Tracks
                var trackID = mGtiApplication.Objects.get("selectedTrackid");

                //Sucht in der Collection das Waypoint-Model mit der entsprechenden ID
                var model_track = collection.get(trackID);

                //Loescht das Kartenmaterial zu diesem Track
                model_track.deleteMapData(model_track,
                    function() {
                        $().toastmessage("showNoticeToast", "Kartenmaterial wurde gelöscht");
                    },
                    function() {
                        $().toastmessage("showErrorToast", "Kartenmaterial konnte nicht gelöscht werden");
                    }
                );
            }
        });

        //Event-Handler fuer die Sichtbarkeits-Checkbox
        $("#cBoxVisibility").change( function(evt) {

            //Sucht in der Collection das Track-Model mit der entsprechenden ID
            var model_track = mGtiApplication.Objects.get("cTour").get(mGtiApplication.Objects.get("selectedTrackid"));

            if($("#cBoxVisibility").prop("checked")) {
                model_track.showLayer();
            }
            else {
                model_track.hideLayer();
            }
        });

        //Event-Handler fuer die Simulations-Checkbox
        //Aktiviert oder deaktiviert die Simulation
        $("#cBoxSimulate").change( function(evt) {

            //Sucht in der Collection das Track-Model mit der entsprechenden ID
            var model_track = mGtiApplication.Objects.get("cTour").get(mGtiApplication.Objects.get("selectedTrackid"));
            //Setzt den aktiven Track
            mGtiApplication.Objects.get("cTour").activeTrack = model_track;

            //Umschreiben des Einstellungsobjektes
            //Wenn die Checkbox gecheckt wurde, muss die Simulation aktiviert werden
            if($("#cBoxSimulate").prop("checked"))
                mGtiApplication.Objects.get("settings").set({simulation: 1});
            else
                mGtiApplication.Objects.get("settings").set({simulation: 0});

            //Die zurueckgelegte Distanz wird auf 0 gesetzt
            mGtiApplication.Objects.get("mDistance").set({distance: 0});
            //Die Simulation wird aktiviert
            mGtiApplication.activateSettings();
        });

        //Klick-Event fuer den Track-Finden-Button
        $('#btn_findTrack').click( function() {

            //Sucht in der Collection das Track-Model mit der entsprechenden ID
            var model_track = mGtiApplication.Objects.get("cTour").get(mGtiApplication.Objects.get("selectedTrackid"));

            //Liest die lat und lon Werte des ersten Trackpunktes des Tracks aus
            var lon = model_track.get("cTrackpoints").at(0).get("lon");
            var lat = model_track.get("cTrackpoints").at(0).get("lat");

            //Zentriert die Karte auf den Start des angezeigten Track
            mGtiApplication.Objects.get("map").setCenter(new OpenLayers.LonLat(lon, lat)
                .transform(mGtiApplication.Objects.get("map").displayProjection,
                    mGtiApplication.Objects.get("map").projection));

            //Der Kompass wird auf den Zustand 0 gesetzt damit die Karte nicht mehr zentriert ist
            mGtiApplication.Objects.get("mCompass").set({state: 0});
            $("#compass").attr("src", "./res/mainscreen/Kompass_1.png");

            $.mobile.changePage(mGtiApplication.Objects.get("mainUrl"));
        });

        //Click-Event fuer den Button zum Speichern des Tracks
        $('#btn_deleteTrack').click( function() {

            //Sicherheitsabfrage ob der Track wirklich geloescht werden soll
            var confirmDelete = window.confirm("Sind Sie sicher?");

            if(confirmDelete) {

                var collection = mGtiApplication.Objects.get("vTrackManagement").collection;

                //Die ID des derzeit ausgewaehlten Tracks
                var trackID = mGtiApplication.Objects.get("selectedTrackid");

                //Sucht in der Collection das Waypoint-Model mit der entsprechenden ID
                var model_track = collection.get(trackID);

                //Loescht das Track-Model aus der Collection
                //Wenn das Model entfernt wird triggert ein Event,
                //durch welches sich der Track selbststaendig loescht
                collection.remove(model_track);

                $.mobile.changePage("./trackManagement.html");
            }
        });

        mGtiApplication.Objects.get("mLogHistory").pop();
    },
    
    showDetails: function() {

        mGtiApplication.Objects.get("mLogHistory").push("mGtiTourViewTrackDetails.showDetails()");

        //Die ausgewaehlte Track ID und die aktive Collection werden ausgelesen
        var selecttrackid = mGtiApplication.Objects.get("selectedTrackid");
        var collection = mGtiApplication.Objects.get("activeTrackCollection");
        
        for (i = 0; i < collection.length; i++) {
           
           if(collection.pluck("id")[i] == selecttrackid)
           {
               mGtiApplication.Objects.get("vTrackDetails").downloadlink = collection.pluck("download")[i];

               var content = "";

               content += "Länge: " + collection.pluck("distance")[i] + " km  <br />";
               content += "Höhenmeter: " + collection.pluck("height")[i] + " m <br />";
               var circuit = (collection.pluck("circuit")[i] == 0) ? "nein" : "ja";
               content += "Rundkurs: " + circuit + " <br />";
               content += "Trackrank: " + collection.pluck("trackrank")[i] + "<br />";

               //Auslesen und zusammenfuegen der Zeit
               var str_time = "";
               str_time += (collection.pluck("day")[i]) ? collection.pluck("day")[i] : "0";
               str_time += " Tage, ";
               str_time += (collection.pluck("hour")[i]) ? collection.pluck("hour")[i] : "0";
               str_time += ":";
               str_time += (collection.pluck("min")[i]) ? collection.pluck("min")[i] : "0";
               str_time += " h";

               content += "Dauer: " + str_time;

               $('#p_trackInfo').html(content);

               var str_title = collection.pluck("title")[i];
               $('#h_title').text(str_title);
               
               var src_profile =  collection.pluck("profile")[i]
               $('#i_profile').attr("src", src_profile);
           }
        }

        mGtiApplication.Objects.get("mLogHistory").pop();
    },
    
    //Laedt alle Templates in den HTML-Code
    loadTemplates: function() {

        mGtiApplication.Objects.get("mLogHistory").push("mGtiTourViewTrackDetails.loadTemplates()");

        var self = this;
        
        //Loescht den Inhalt
        $("#div_controls").html('');
        
        //Der HTML-Code des Control-Divs wird mit dem buttonTemplate ausgetauscht
        $("#div_controls").html(
            self.buttonTemplate
        );
        
        //Der Inhalt des Div-Tags wird neu aufgebaut
        $("#trackd").trigger('create');

        mGtiApplication.Objects.get("mLogHistory").pop();
    },
    
    //Fuehrt einen Ajax-Request durch und laedt den Track vom Server
    downloadtrack: function(onSuccess, onError)
    {
        mGtiApplication.Objects.get("mLogHistory").push("mGtiTourViewTrackDetails.downloadtrack()");

        var username = (mGtiApplication.Objects.get("settings").get("username") != null) ? mGtiApplication.Objects.get("settings").get("username") : "";
        var password = (mGtiApplication.Objects.get("settings").get("password") != null) ? mGtiApplication.Objects.get("settings").get("password") : "";

        var download_url = mGtiApplication.Objects.get("vTrackDetails").downloadlink;
        //Username und Passwort duerfen nur angehaengt werden,
        //falls sie nicht leer sind
        if(username != "" && password != "")
            download_url += '&ses_id=' + username + '&ses_pwd=' + password;

        mGtiApplication.Objects.get("cTour").activeTrackUrl = download_url;

        $.ajax({
            type: "GET",
            url: download_url,
            dataType: "xml",
            success: function(data) {
                mGtiApplication.Objects.get("cTour").parseTrackFromGpx(data, function(model_track) {
                    //Callback darf erst aufgerufen werden, wenn der Track vollstaendig heruntergeladen
                    //und der Collection hinzugefuegt wurde
                    onSuccess(model_track);
                });
            },
            error: function(jqXHR, ajaxSettings, thrownError) {
                $().toastmessage('showWarningToast', "Fehler: Track konnte nicht geladen werden. Bitte überprüfe deine Zugangsdaten unter Einstellungen.");
                onError(thrownError);
            }
        });

        mGtiApplication.Objects.get("mLogHistory").pop();
    }
});

