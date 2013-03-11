var mGtiUiControllerWaypointDialog = Backbone.View.extend({

    /***** Parameter *****
     * el
     * mRecord
     * mUserWaypoints
     * mWaypointCreation
     * map
     * logHistory
     */

    vDialog: null,

    events: {
        'click #btn_addEditWaypoint': 'BtnAddEditWaypointClickHandler',
        'click #btn_deleteWaypoint': 'BtnDeleteWaypointClickHandler',
        'click #btn_cancel': 'BtnCancelClickHandler'
    },

    //Wird beim Anzeigen des PopUps aufgerufen
    Init: function() {

        var self = this;
        self.options.logHistory.push("mGtiUiControllerWaypointDialog.Init()");

        //Die View wird angelegt
        self.vDialog = new mGtiUiViewWaypointDialog({
            model: self.options.mUserWaypoints,
            mRecord: self.options.mRecord,
            mWaypointCreation: self.options.mWaypointCreation,
            logHistory: self.options.logHistory
        });

        //Die Menueelemente werden initialisiert und angepasst
        self.vDialog.init();

        $("#checkMyPosition").bind("change", { parent: self }, self.checkMyPositionChangedHandler);

        self.options.logHistory.pop();
    },

    checkMyPositionChangedHandler: function(evt) {

        var self = evt.data.parent;

        if($("#checkMyPosition").attr("checked")) {

            var lon = mGtiApplication.Objects.get("mGeolocation").get('longitude');
            var lat = mGtiApplication.Objects.get("mGeolocation").get('latitude');

            //Die eigene Position wird angezeigt
            $('#p_longitude').text(lon);
            $('#p_latitude').text(lat);
        }
        else {

            var lon = Math.round(self.options.mWaypointCreation.get("lon") * 100000) / 100000;
            var lat = Math.round(self.options.mWaypointCreation.get("lat") * 100000) / 100000;

            //Die gedrueckte Position wird angezeigt
            $('#p_longitude').text(lon);
            $('#p_latitude').text(lat);
        }
    },

    BtnCancelClickHandler: function() {
        //Schliesst den Dialog
        $('#popup_waypoint').dialog('close');
    },

    BtnAddEditWaypointClickHandler: function() {

        this.options.logHistory.push("mGtiUiControllerWaypointDialog.BtnAddEditWaypointClickHandler()");

        var self = this;
        var mRecord = this.options.mRecord;
        var mGeolocation = mGtiApplication.Objects.get('mGeolocation');

        //Unterscheidet ob ein Feature ausgewaehlt wurde
        if(self.options.mUserWaypoints.get("clickedFeature") != null) {

            //Wenn die Eigenschaft cid existiert, gehoert der Wegpunkt zu einem aufgezeichneten Track
            if(self.options.mUserWaypoints.get("clickedFeature").attributes.cid != null) {

                var waypoint = mRecord.get("track").get("cWaypoints").getByCid(self.options.mUserWaypoints.get("clickedFeature").attributes.cid);
                //Bearbeitet einen existierenden Wegpunkt des aufzeichnenden Tracks
                self.options.mUserWaypoints.EditTrackWaypoint(
                    waypoint,
                    $("#title").val(),
                    $("#description").val()
                );
            }
            //Wenn nicht muss ein allgemeiner Wegpunkt bearbeitet werden
            else {
                self.options.mUserWaypoints.EditUserWaypoint();
            }
        }
        //oder ein neuer Wegpunkt angelegt werden soll
        else {

            var lon,
                lat;
            //Es muss unterschieden werden, ob die eigenen Position,
            //oder die gedrueckte Position verwendet werden soll
            if($("#checkMyPosition").attr("checked")) {

                lon = mGtiApplication.Objects.get("mGeolocation").get('longitude');
                lat = mGtiApplication.Objects.get("mGeolocation").get('latitude');
            }
            else {

                lon = self.options.mWaypointCreation.get("lon");
                lat = self.options.mWaypointCreation.get("lat");
            }

            //Wenn kein Feature ausgewaehlt wurde und zur Zeit aufgezeichnet wird
            //muss dem Track ein neuer Wegpunkt hinzugefuegt werden
            if(mRecord.get("recording")) {
                //Fuegt dem aufzeichnenden Track einen neuen Wegpunkt hinzu
                self.options.mUserWaypoints.AddTrackWaypoint(
                    mRecord.get("track"),
                    lon,
                    lat,
                    mGeolocation.get("altitude"),
                    $("#title").val(),
                    $("#description").val()
                );
            }
            //Wenn kein Track aufgezeichnet wird,
            //muss ein allgemeiner Wegpunkt angelegt werden
            else {

                self.options.mUserWaypoints.AddUserWaypoint(
                    lon,
                    lat,
                    $("#title").val(),
                    $("#description").val()
                );
            }
        }

        //Schliesst den Dialog
        $('#popup_waypoint').dialog('close');

        this.options.logHistory.pop();
    },

    BtnDeleteWaypointClickHandler: function() {

        var self = this;

        this.options.logHistory.push("mGtiUiControllerWaypointDialog.BtnDeleteWaypointClickHandler()");

        //Wenn die Eigenschaft cid existiert, gehoert der Wegpunkt zu einem aufgezeichneten Track
        if(self.options.mUserWaypoints.get("clickedFeature").attributes.cid != null) {

            var track = self.options.mUserWaypoints.get("track");
            var waypoint = track.get("cWaypoints").getByCid(self.options.mUserWaypoints.get("clickedFeature").attributes.cid);
            this.options.mUserWaypoints.DeleteTrackWaypoint(waypoint, track);
        }
        //Ansonsten handelt es sich um einen allgemeinen Wegpunkt
        else {

            this.options.mUserWaypoints.DeleteUserWaypoint();
        }

        this.options.mUserWaypoints.set({clickedFeature: null});
        //Schliesst den Dialog
        $('#popup_waypoint').dialog('close');

        this.options.logHistory.pop();
    },

    //Fuehrt alle abschließenden Operationen durch,
    //welche nach dem Schließen des Dialogs anfallen
    Finish: function() {

        var self = this;

        self.options.logHistory.push("mGtiUiControllerWaypointDialog.Finish()");

        //Clicked-Marker wird wieder null gesetzt
        //Sonst kann kein neues Wegpunkt-Feature angelegt werden
        self.options.mUserWaypoints.set({clickedFeature: null});
        //Entfernt die Checkbox fuer die eigene Position
        self.vDialog.removeCheckMyPosition();
        //Entfernt die View aus dem DOM
        self.vDialog.remove();

        self.options.mWaypointCreation.set({startPosX: null});
        self.options.mWaypointCreation.set({startPosY: null});
        self.options.mWaypointCreation.set({posX: null});
        self.options.mWaypointCreation.set({posY: null});
        self.options.mWaypointCreation.set({pageX: null});
        self.options.mWaypointCreation.set({pageY: null});

        $("#checkMyPosition").unbind("change", self.checkMyPositionChangedHandler);

        self.options.logHistory.pop();
    }
});


