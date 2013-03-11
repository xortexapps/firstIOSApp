var mGtiTourViewTrackManagement = Backbone.View.extend({
    
    initialize: function() {
        
        var self = this;
        //Click-Event fuer den Loeschen-Button
        $("#list_trackManagement a.ui-li-link-alt").live("click", self.deleteTrack);
        
        //Click-Event fuer die Listeneintraege
        $("#list_trackManagement a.ui-link-inherit").live("click", self.showDetails);
        
        $("#btn_deleteAllTracks").live("click", self.deleteAllTracks);
        $("#btn_hideAllTracks").live("click", self.hideAllTracks);
        $("#btn_showAllTracks").live("click", self.showAllTracks);
    }, 
    
    render: function() {

        mGtiApplication.Objects.get("mLogHistory").push("mGtiTourViewTrackManagement.render()");

        var self = this; 
        //Jedes Model in der Collection der Tracks wird durchlaufen
        // und fuer jedes Model wird ein neuer Listeneintrag hinzugefuegt
        _.each(self.collection.models, function(track){
            //Der aufzeichnende Track darf nicht angezeigt werden
            if(track != mGtiApplication.Objects.get("mRecord").get("track"))
                self.appendItem(track);
        }, this);
        
        //Die Liste wird aktualisiert
        $("#list_trackManagement").listview('refresh');

        mGtiApplication.Objects.get("mLogHistory").pop();
    },
    
    //Ein neuer Listeneintrag wird der Trackliste hinzugefuegt
    appendItem: function(track) {

        var collection = mGtiApplication.Objects.get("cTour");
        var datatheme = "d";
        var opacity = 1.0;
        //Es darf keine Abfrage durchgefuehrt werden, wenn kein aktiver Track existiert
        if(collection.activeTrack != null) {

            //Ueberpruefen ob der hinzuzufuegende Track der aktive ist
            if(track.get("id") == collection.activeTrack.get("id"))
            {
                datatheme = "e";
            }
        }
        //Falls der Track nicht sichtbar ist,
        //wird das Listenelement leicht transparent dargestellt
        if(!track.get("track_layer").getVisibility()) {
            opacity = 0.5;
        }

        var strProp = " (";
        //Prueft ob der Track versteckt ist
        if(!track.get("track_layer").getVisibility()) {
            strProp += "Versteckt";
        }
        //Prueft ob der Track zur Zeit simuliert wird
        if(track == mGtiApplication.Objects.get("cTour").activeTrack
            && mGtiApplication.Objects.get("settings").get("simulation") == 1) {
            if(strProp != " (")
                strProp += ", Simuliert";
            else
                strProp += "Simuliert";
        }
        strProp += ")";

        var color = track.get("color").color;

        //Der Track wird der Liste angefuegt
        $("#list_trackManagement").append(
            '<li style="opacity: ' + opacity + '" data-theme=' + datatheme + '>' +
                '<a href="track_details.html" trackID = ' + track.get("id") + '>' +
                    '<img src="' + track.get("image")+ '"/>' +
                    '<h3 style="color: ' + color + '" >'+ track.get("id") + " - " + track.get("title") + strProp + '</h3>' +
                '<p>Rank: '+ track.get("trackrank") + ', Kat: ' + track.get("cat")
                + '<br />' + 'Laenge: ' + track.get("distance") + ' km, Hoehe: ' + track.get("height") + ' m</p></a>' +
                '<a href="" trackID = ' + track.get("id") + '></a>' +
            '</li>');
    },
    
    //Leert die aktuelle Liste
    //und baut sie danach neu auf
    refreshList: function() {

        mGtiApplication.Objects.get("mLogHistory").push("mGtiTourViewTrackManagement.refreshList()");
        
        $('#list_trackManagement li').remove();
        mGtiApplication.Objects.get("vTrackManagement").render();

        mGtiApplication.Objects.get("mLogHistory").pop();
    },

    //Loescht einen Track
    deleteTrack: function() {

        mGtiApplication.Objects.get("mLogHistory").push("mGtiTourViewTrackManagement.deleteTrack()");

        //Sicherheitsabfrage ob der Track wirklich geloescht werden soll
        var confirmDelete = window.confirm("Sind Sie sicher?");

        if(confirmDelete) {

            var collection = mGtiApplication.Objects.get("vTrackManagement").collection;

            var trackID = $(this).attr("trackID");

            //Sucht in der Collection das Waypoint-Model mit der entsprechenden ID
            var model_track = collection.get(trackID);

            //Loescht das Track-Model aus der Collection
            //Wenn das Model entfernt wird triggert ein Event,
            //durch welches sich der Track selbststaendig loescht
            collection.remove(model_track);

            //Die Liste wird neu aufgebaut
            mGtiApplication.Objects.get("vTrackManagement").refreshList();
        }

        mGtiApplication.Objects.get("mLogHistory").pop();
    },

    //Erzeugt den HTML-Code fuer die Controls auf der Track-Details Seite
    showDetails: function (e) {

        mGtiApplication.Objects.get("mLogHistory").push("mGtiTourViewTrackManagement.showDetails()");

        //Die aktive Trackcollection wird auf die Tour Collection gesetzt
        mGtiApplication.Objects.set("activeTrackCollection", mGtiApplication.Objects.get("cTour"));
        //Und die TrackID des ausgewaehlten Tracks wird gesetzt
        mGtiApplication.Objects.set("selectedTrackid", $(this).attr("trackID"));

        var mapBtn;
        var uploadBtn = "";
        var track = mGtiApplication.Objects.get("cTour").get($(this).attr("trackID"));

        //Wenn es ein selbst aufgezeichneter Track ist ( id < 0),
        //muss ein Abschicken-Button zur Verfuegung stehen
        if($(this).attr("trackID") < 0) {
            uploadBtn = '<a href="uploadDialog.html" data-rel="dialog" data-role="button" id="btn_uploadTrack">Hochladen</a>';
        }

        //Wenn Kartenmaterial fuer diesen Track zur Verfuegung steht,
        //soll der Benutzer die Moeglichkeit zum Loeschen von diesem erhalten
        if(mGtiApplication.Objects.get("localStorage").get("storage").getItem(mGtiApplication.Objects.get("selectedTrackid")) != null) {
            mapBtn = '<a id="btn_delete_map" href="" data-rel="back" data-role="button" style="background: red;">Karte löschen</a>';
        }
        //Falls zur Zeit ein Download aktiv ist, muss der Download-Button deaktiviert werden,
        //da immer nur ein Download gleichzeitig laufen darf
        else if(mGtiApplication.Objects.get("mMapDownload").get("track") != null)
            mapBtn = '<a id="btn_download_map" href="" data-role="button" data-rel="" class="ui-disabled">Karte herunterladen</a>';
        else
            mapBtn = '<a id="btn_download_map" href="mapDownloadDialog.html" data-transition="none" data-rel="dialog" data-role="button">Karte herunterladen</a>';

        var findTrackBtn = '<a href="" data-role="button" id="btn_findTrack">Zur Karte</a>';
        var trackVisibility = '<input type="checkbox" name="cBoxVisibility" id="cBoxVisibility" />' +
            '<label for="cBoxVisibility">Sichtbar</label>';

        if(track.get("track_layer").getVisibility()) {
            //Checkbox zeigt an, dass der Track zur Zeit sichtbar ist
            trackVisibility = '<input type="checkbox" name="cBoxVisibility" id="cBoxVisibility" checked="true" />' +
                '<label for="cBoxVisibility">Sichtbar</label>';
        }

        var simulateTrack = '<input type="checkbox" name="cBoxSimulate" id="cBoxSimulate"/>' +
            '<label for="cBoxSimulate">Simulieren</label>';
        //Wenn der Track aktiv ist und die Simulation laeuft, muss die Checkbox ausgewaehlt werden
        if(track == mGtiApplication.Objects.get("cTour").activeTrack && mGtiApplication.Objects.get("settings").get("simulation") == 1) {

            simulateTrack = '<input type="checkbox" name="cBoxSimulate" id="cBoxSimulate" checked="true"/>' +
                '<label for="cBoxSimulate">Simulieren</label>';
        }

        //Das ButtonTemplate, welches beim Laden der Detailseite geladen wird, wird geaendert
        mGtiApplication.Objects.get("vTrackDetails").buttonTemplate =
                '<div data-role="fieldcontain">' +
                    uploadBtn +
                    findTrackBtn +
                '</div>' +
                '<div data-role="fieldcontain">' +
                    '<fieldset data-role="controlgroup">' +
                        trackVisibility +
                        simulateTrack +
                    '</fieldset>' +
                '</div>' +
                '<div data-role="fieldcontain">' +
                    '<div data-role="controlgroup">' +
                        mapBtn +
                        '<a id="btn_deleteTrack" href="" data-role="button" style="background:#FF0000;">Löschen</a>' +
                    '</div>' +
                '</div>';

        mGtiApplication.Objects.get("mLogHistory").pop();
    },
    
    //Alle Tracks werden geloescht
    deleteAllTracks: function () {

        mGtiApplication.Objects.get("mLogHistory").push("mGtiTourViewTrackManagement.deleteAllTracks()");

        //Sicherheitsabfrage ob der Track wirklich geloescht werden soll
        var confirmDelete = window.confirm("Sind Sie sicher?");

        if(confirmDelete) {
        
            var collection = mGtiApplication.Objects.get("vTrackManagement").collection;

            //Leert die Collection aus
            collection.remove(collection.models);

            //Die Liste wird neu aufgebaut
            mGtiApplication.Objects.get("vTrackManagement").refreshList();

            $().toastmessage("showSuccessToast", "Alle Tracks wurden gelöscht");

            //Das Klick-Event des Home-Buttons wird aufgerufen
            $("#btn_home").click();

        }

        mGtiApplication.Objects.get("mLogHistory").pop();
    },
    
    //Alle Tracks werden versteckt
    hideAllTracks: function () {

        mGtiApplication.Objects.get("mLogHistory").push("mGtiTourViewTrackManagement.hideAllTracks()")

        var collection = mGtiApplication.Objects.get("vTrackManagement").collection;
        
        _(collection.models).each(function(track) { 
            
            //Loescht den Layer ueber welchen der Track dargestellt wird
            track.hideLayer();
        }, this);

        $().toastmessage("showSuccessToast", "Alle Tracks wurden versteckt");
        
        //Das Klick-Event des Home-Buttons wird aufgerufen
        $("#btn_home").click();

        mGtiApplication.Objects.get("mLogHistory").pop();
    },
    
    //Alle Tracks werden sichtbar gemacht
    showAllTracks: function () {

        mGtiApplication.Objects.get("mLogHistory").push("mGtiTourViewTrackManagement.showAllTracks()")

        var collection = mGtiApplication.Objects.get("vTrackManagement").collection;
        
        _(collection.models).each(function(track) { 
            
            //Loescht den Layer ueber welchen der Track dargestellt wird
            track.showLayer();
        }, this);

        $().toastmessage("showSuccessToast", "Alle Tracks werden angezeigt");
        
        //Das Klick-Event des Home-Buttons wird aufgerufen
        $("#btn_home").click();

        mGtiApplication.Objects.get("mLogHistory").pop();
    }
});
