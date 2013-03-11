//Das globale Application-Objekt ueber welches auf alle globalen Variablen zugeriffen werden muss
var mGtiApplication = {
    
    init: function() {
        //jQuery Mobile eingenes Event
        //Muss verwendet werden, wenn die Pages auf mehrere HTML-Files aufgeteilt wurden
        //Triggert jedes mal, wenn die Seite aufgerufen wird
        $('#settings').live('pageshow', function(event){mGtiApplication.Objects.get("vSettingspage").init()});
        $('#tracklist').live('pageshow', function(event){mGtiApplication.Objects.get("vShowtracks").loadTracklist()});
        $('#tracklist').live('pagecreate', function(event){mGtiApplication.Objects.get("vShowtracklist").init()});
        $('#trackdetails').live('pageshow', function(event){mGtiApplication.Objects.get("vTrackDetails").init()});
        $('#search').live('pageshow', function(event){mGtiApplication.Objects.get("cSearch").init()});
        $('#search').live('pagecreate', function(event){mGtiApplication.Objects.get("cSearch").create()});
        //Triggert jedes mal, wenn die Seite angezeigt wird
        $('#popup_waypoint').live('pageshow', function(event){mGtiApplication.Objects.get("cWaypointDialog").Init()});
        $('#div_main').live('pageshow', function(event){mGtiApplication.initMainPage()});
        $('#div_main').live('pagehide', function(event){mGtiApplication.finishMainPage()});
        $('#trackManagement').live('pageshow', function(event){mGtiApplication.Objects.get("vTrackManagement").render()});
        //Triggert wenn die Seite geschlossen wird
        $('#popup_waypoint').live('pagehide', function(event){mGtiApplication.Objects.get("cWaypointDialog").Finish()});
        $('#popup_mapDownload').live('pageshow', function(event){mGtiApplication.Objects.get("cMapDownload").init()});
        $('#popup_recording').live('pagebeforeshow', function(event){mGtiApplication.Objects.get("cRecordDialog").Init()});
        $('#popup_upload').live('pagebeforeshow', function(event){mGtiApplication.Objects.get("cUploadDialog").init()});
        $('#popup_upload').live('pagecreate', function(event){mGtiApplication.Objects.get("cUploadDialog").create()});

        //Event welches den Aufruf jeder Seite verfolgt
        //Passt den Aufzeichnungs-Button beim Seitenwechsel an
        $("div[data-role=page]").live("pagebeforeshow", function (evt) {

            //Passt das Aussehen des Buttons an
            //Je nachdem ob gerade aufgezeichnet wird oder nicht
            mGtiApplication.Objects.get("cBtnRecord").options.vBtnRecord.BtnRecordClickHandler();

            //Findet den Aufzeichnen-Button auf der neuen Seite
            var element = $("#" + evt.target.id + " #div_btn_record")[0];
            //Das Element auf welches der Controller fuer die Aufzeichnung reagiert,
            //wird geaendert
            mGtiApplication.Objects.get("cBtnRecord").setElement(element);
        });

        var useragent = navigator.userAgent.toLowerCase();
        //Falls es sich um einen Android 4.x Browser handelt,
        //muss der Resize Button angezeigt werden
        if(useragent.indexOf("android 4") > -1) {
            $("#div_resize").css("display", "");
        }

        //Deaktiviert die Übergangsanimationen bei Seitenwechseln und Dialogaufrufen
        $.mobile.defaultPageTransition = 'none';
        $.mobile.defaultDialogTransition = 'none';

        //Setzt die URL zu welcher der Home-Button zurueckfuehrt
        var link = "http://" + window.location.hostname + window.location.pathname;
        mGtiApplication.Objects.set("mainUrl", link);

        //Blendet den Zaehler des Info-Selects aus
        $('.ui-li-count').css("display", "none");

        //Bei einem Klick auf den Home-Button
        $('#btn_home').live('click', function(event) {
             //wird der Link des Buttons auf die Start-Url gesetzt
             $('#btn_home').attr("href", mGtiApplication.Objects.get("mainUrl"));
        });

        //Verhindert das freie Verschieben des Fensters
        $('body').bind('touchmove', mGtiApplication.BlockMove);

        //Event-Listener fuer das Manifest
        //Triggert falls eine neue Version zur Verfuegung steht
        var cache = window.applicationCache;
        cache.addEventListener('updateready', function() {
            $().toastmessage("showNoticeToast", "Es steht ein Update zur Verfügung. Laden Sie die Seite neu um es anzuwenden");
        }, false);

        //Initialisiert den LocalStorage fuer die Userdaten
        mGtiApplication.initLocalStorage();
        //Laedt die Benutzerdaten aus dem LocalStorage in das Settings-Objekt
        mGtiApplication.loadUserdata();

        //Anlegen der Models und Views der UI
        mGtiApplication.init_models_views();

        //Event welches getriggert wird wenn sich die Orientierung oder die Groesse des Fensters aendert
        //Ruft fixContentHeight() auf
        $(window).bind("orientationchange resize", mGtiApplication.fixContentHeight);

        //Funktion muss anfangs einmal aufgerufen werden
        mGtiApplication.fixContentHeight();

        mGtiApplication.Objects.get("mLogHistory").push("mGtiApplication.init()");

        //Der Layer fuer die Wegpunkte wird angelegt
        mGtiApplication.Objects.get('vMap').initMarkerLayer();

        //Wendet die Einstellungen an
        mGtiApplication.activateSettingsForStartup();

        //Initialisiert den GPS-Empfang
        mGtiApplication.initGeolocation();
        //Aktiviert den Kompass falls es in den Einstellungen steht
        if(mGtiApplication.Objects.get("settings").get("compass") != 0)
            mGtiApplication.Objects.get("mCompass").set({compass_activated: true});

        //Fuegt einen Event-Listener hinzu, welcher Positionsaenderungen in den LocalStorage schreibt
        mGtiApplication.Objects.get("vMap").addMoveEndEventListener();

        //Ueberprueft ob ein trackID-Parameter uebergeben wurde
        //Wenn ja, dann wird der Track geladen und der Karte hinzugefuegt
        var trackID = window.location.hash.slice(window.location.hash.indexOf('.') + 1);

        //Falls eine TrackID uebergeben wurde
        if(trackID != "") {

            //Nachdem die uebergebene TrackID ausgelesen wurde,
            //muss das Hash-Tag aus der URL entfernt werden
            window.location.href = window.location.href.replace(/#.*/,'#');

            mGtiApplication.Objects.set("parameterTrackID", trackID);
        }

        //Initialisiert die Datenbank
        //Nur falls der verwendete Browser Datenbanken unterstuezt, wird diese angelegt
        if(typeof window.openDatabase == "function" ? true : false) {
            //Initiieren der Datenbank
            mGtiApplication.Objects.get("mDatabase").init(
                //Success-Callback
                function() {

                    loadParameterTrack();

                    //Die Wegpunkte werden aus der Datenbank ausgelesen
                    mGtiApplication.Objects.get("mDatabase").getWaypoints();
                    //Die Tracks werden aus der Datenbank ausgelesen
                    mGtiApplication.Objects.get("mDatabase").getTracks();

                    //Ein neues CacheRead-Control wird angelegt
                    //und der Karte hinzugefuegt
                    var cacheRead = new mGtiMapModelCacheRead({
                        storage: mGtiApplication.Objects.get("mapStorage")
                    });
                    mGtiApplication.Objects.get("map").addControl(cacheRead);
                    cacheRead.activate();
                },
                //Error-Callback
                function() {

                    loadParameterTrack();
                }
            );
        }
        else {
            $().toastmessage('showErrorToast', "Die WebSQLite Datenbank wird von Ihrem Browser nicht unterstuezt");
            loadParameterTrack();
        }

        function loadParameterTrack() {

            //Falls eine Parameter-ID uebergeben wurde,
            //wird der Track heruntergeladen
            if(trackID != "") {
                //Laden des Tracks
                mGtiApplication.Objects.set("selectedTrackid", trackID);
                var url = "/api/v1/search.php?tours_keys[]=" + trackID;

                //Laden der Track Informationen
                mGtiApplication.Objects.get("mReadandRequestxml").getxml(
                    url,
                    mGtiApplication.Objects.get("mReadandRequestxml").parseTrackInfo
                );
            }
        }

        mGtiApplication.Objects.get("mLogHistory").pop();
    },
    
    init_models_views: function(){

        //Das View fuer die Karte hat eine Sonderstellung, da es auch von vielen Models benoetigt wird
        mGtiApplication.Objects.set("vMap", new mGtiMapViewOpenLayers({el: document.getElementById("div_map")}));
        
        //Models
        mGtiApplication.Objects.set("mLogger", new mGtiTestModelLogger());
        mGtiApplication.Objects.set("mLogHistory", new mGtiTestModelLogHistory());
        mGtiApplication.Objects.set("mCompass", new mGtiGpsModelCompass());
        mGtiApplication.Objects.set("mAltitude", new mGtiGpsModelAltitude({altitude: 0}));
        mGtiApplication.Objects.set("mSpeed", new mGtiGpsModelSpeed({speed: 0}));
        mGtiApplication.Objects.set("mAccuracy", new mGtiGpsModelAccuracy());
        mGtiApplication.Objects.set("mDistance", new mGtiUiModelDistance({distance: 0}));
        mGtiApplication.Objects.set("mDatabase", new mGtiDataModelDatabase({}));
        mGtiApplication.Objects.set("mJSON", new mGtiDataModelJson({}));
        mGtiApplication.Objects.set("mColors", new mGtiDataModelColors({}))
        mGtiApplication.Objects.set("mGeolocation", new mGtiGeolocationSimulation({errorRate: 0}));
        mGtiApplication.Objects.set("mUserWaypoints", new mGtiMapModelUserWaypoints());
        mGtiApplication.Objects.set("mDrag", new mGtiMapModelDrag());
        mGtiApplication.Objects.set("mMapDownload", new mGtiMapModelMapDownload());
        mGtiApplication.Objects.set("mProgressbar", new mGtiUiModelProgressbar());
        mGtiApplication.Objects.set("mReadandRequestxml", new mGtiDataModelReadandrequestxml());
        mGtiApplication.Objects.set("mRecord", new mGtiRecordingModelRecord());
        mGtiApplication.Objects.set("mapStorage", new OpenLayers.CacheDatabaseStorage());
        mGtiApplication.Objects.set("mWaypointCreation", new mGtiMapModelWaypointCreation());
        mGtiApplication.Objects.set("mCategories", new mGtiTourModelCategories());
        
        //Collections
        mGtiApplication.Objects.set("cWaypoints", new mGtiDataCollectionWaypoints({}));
        mGtiApplication.Objects.set("cTracklist", new mGtiTourCollectionTour());
        mGtiApplication.Objects.set("cTour", new mGtiTourCollectionTour());
        mGtiApplication.Objects.get("cTour").mColors = mGtiApplication.Objects.get("mColors");
        
        //Views
        mGtiApplication.Objects.set("vZoomPlus", new mGtiUiViewZoomPlus({el: $("#div_zoom_plus"), model: mGtiApplication.Objects.get("settings")}));
        mGtiApplication.Objects.set("vZoomMinus", new mGtiUiViewZoomMinus({el: $("#div_zoom_minus"), model: mGtiApplication.Objects.get("settings")}));
        mGtiApplication.Objects.set("vResize", new mGtiUiViewResize({el: $("#div_resize")}));
        mGtiApplication.Objects.set("vSelectInfo", new mGtiUiViewInfo({el: $("#div_info"), model: mGtiApplication.Objects.get("settings")}));
        mGtiApplication.Objects.set("vCompass", new mGtiGpsViewCompass());
        mGtiApplication.Objects.set("vAltitude",  new mGtiUiViewAltitude({el: $("#div_altitude")}));
        mGtiApplication.Objects.set("vSpeed", new mGtiUiViewSpeed({el: $("#div_speed")}));
        mGtiApplication.Objects.set("vAccuracy", new mGtiGpsViewAccuracy({model: mGtiApplication.Objects.get("mAccuracy")}));
        mGtiApplication.Objects.set("vTime", new mGtiUiViewTime({el: $("#div_time"), model: mGtiApplication.Objects.get("mRecord")}));
        mGtiApplication.Objects.set("vDistance", new mGtiUiViewDistance({el: $("#div_distance")}));
        mGtiApplication.Objects.set("vProgressbar", new mGtiUiViewProgressbar({el: $('#div_progressbar'), model: mGtiApplication.Objects.get("mProgressbar")}));
        mGtiApplication.Objects.set("vApp", new mGtiViewApp({tracker: mGtiApplication.Objects.get("historyStartingPoint")}));
        mGtiApplication.Objects.set("vBtnRecord", new mGtiRecordingViewBtnRecord());
        mGtiApplication.Objects.set("vShowtracks", new mGtiTourViewTracks());
        mGtiApplication.Objects.set("vTrackDetails", new mGtiTourViewTrackDetails());
        mGtiApplication.Objects.set("vSettingspage", new mGtiSettingsViewSettingspage());
        mGtiApplication.Objects.set("vUploadDialog", new mGtiTourViewUploadDialog());

        mGtiApplication.Objects.get("vMap").init();
        
        mGtiApplication.Objects.set("vTrackManagement", new mGtiTourViewTrackManagement({collection: mGtiApplication.Objects.get("cTour")}));

        //Controller

        //Der Controller fuer den Kompass
        mGtiApplication.Objects.set("cCompass", new mGtiGpsControllerCompass({
            el: $("#div_compass"),
            mCompass: mGtiApplication.Objects.get("mCompass"),
            vCompass: mGtiApplication.Objects.get("vCompass"),
            vMap: mGtiApplication.Objects.get("vMap"),
            mGeolocation: mGtiApplication.Objects.get("mGeolocation"),
            logHistory: mGtiApplication.Objects.get("mLogHistory"),
            settings: mGtiApplication.Objects.get("settings"),
            localStorage: mGtiApplication.Objects.get("localStorage")
        }));
        mGtiApplication.Objects.get("cCompass").init();
        //Der Controller fuer den Fortschrittsbalken des Karten-Downloads
        mGtiApplication.Objects.set("cProgressbar", new mGtiUiControllerProgressbar({
            el: $('#div_progressbar'),
            logHistory: mGtiApplication.Objects.get("mLogHistory"),
            mMapDownload: mGtiApplication.Objects.get("mMapDownload"),
            vProgressbar: mGtiApplication.Objects.get("vProgressbar"),
            mProgressbar: mGtiApplication.Objects.get("mProgressbar")
        }));
        mGtiApplication.Objects.get("cProgressbar").init();
        //Der Controller fuer die Suchen-Seite
        mGtiApplication.Objects.set("cSearch", new mGtiSearchControllerSearch({
            el: $("#search"),
            logHistory: mGtiApplication.Objects.get("mLogHistory"),
            mCompass: mGtiApplication.Objects.get("mCompass"),
            mCategories: mGtiApplication.Objects.get("mCategories"),
            mReadandRequestxml: mGtiApplication.Objects.get("mReadandRequestxml"),
            mGeolocation: mGtiApplication.Objects.get("mGeolocation"),
            settings: mGtiApplication.Objects.get("settings"),
            vShowtracks: mGtiApplication.Objects.get("vShowtracks"),
            vShowtracklist: mGtiApplication.Objects.get("vShowtracklist")
        }));
        //Der Controller fuer den Kartendownload
        mGtiApplication.Objects.set("cMapDownload", new mGtiMapControllerMapDownload({
            mMapDownload: mGtiApplication.Objects.get("mMapDownload"),
            mapStorage: mGtiApplication.Objects.get("mDatabase"),
            cTour: mGtiApplication.Objects.get("cTour")
        }));
        //Controller fuer den Aufzeichnen Button
        mGtiApplication.Objects.set("cBtnRecord", new mGtiRecordingControllerBtnRecord({
            el: document.getElementById("div_btn_record"),
            mRecord: mGtiApplication.Objects.get("mRecord"),
            vBtnRecord: mGtiApplication.Objects.get("vBtnRecord"),
            logHistory: mGtiApplication.Objects.get("mLogHistory"),
            cTour: mGtiApplication.Objects.get("cTour"),
            mJson: mGtiApplication.Objects.get("mJSON"),
            mDatabase: mGtiApplication.Objects.get("mDatabase"),
            mDistance: mGtiApplication.Objects.get("mDistance")
        }));
        mGtiApplication.Objects.get("cBtnRecord").init();
        //Controller fuer die Wegpunkterstellung
        mGtiApplication.Objects.set("cWaypointCreation", new mGtiUiControllerWaypointCreation({
            el: $("#div_map"),
            vMap: mGtiApplication.Objects.get("vMap"),
            mCompass: mGtiApplication.Objects.get("mCompass"),
            logHistory: mGtiApplication.Objects.get("mLogHistory"),
            mWaypointCreation: mGtiApplication.Objects.get("mWaypointCreation")
        }));
        mGtiApplication.Objects.get("cWaypointCreation").init();
        //Controller fuer den Wegpunkt-Dialog
        mGtiApplication.Objects.set("cWaypointDialog", new mGtiUiControllerWaypointDialog({
            el: document.getElementById("div_waypoint_dialog_controls"),
            logHistory: mGtiApplication.Objects.get("mLogHistory"),
            mUserWaypoints: mGtiApplication.Objects.get("mUserWaypoints"),
            mRecord: mGtiApplication.Objects.get("mRecord"),
            mWaypointCreation: mGtiApplication.Objects.get("mWaypointCreation"),
            map: mGtiApplication.Objects.get("map")
        }));
        //Controller fuer den Aufzeichnungs-Dialog
        mGtiApplication.Objects.set("cRecordDialog", new mGtiRecordingControllerRecordDialog({
            logHistory: mGtiApplication.Objects.get("mLogHistory"),
            mRecord: mGtiApplication.Objects.get("mRecord"),
            mDatabase: mGtiApplication.Objects.get("mDatabase"),
            mJson: mGtiApplication.Objects.get("mJSON"),
            cTour: mGtiApplication.Objects.get("cTour"),
            mDistance: mGtiApplication.Objects.get("mDistance")
        }));
        //Controller fuer den Upload-Dialog
        mGtiApplication.Objects.set("cUploadDialog", new mGtiTourControllerUploadDialog({
            logHistory: mGtiApplication.Objects.get("mLogHistory"),
            vUploadDialog: mGtiApplication.Objects.get("vUploadDialog"),
            mDatabase: mGtiApplication.Objects.get("mDatabase"),
            mCategories: mGtiApplication.Objects.get("mCategories"),
            mJson: mGtiApplication.Objects.get("mJSON"),
            cTour: mGtiApplication.Objects.get("cTour")
        }));

        //Wenn das Attribut "altitude" geaendert wird, triggert das ein Event und ruft die Refresh Funktion vom Altitude-View auf
        mGtiApplication.Objects.get("mAltitude").bind('change:altitude', mGtiApplication.Objects.get("vAltitude").refresh, mGtiApplication.Objects.get("vAltitude"));
        mGtiApplication.Objects.get("mSpeed").bind('change:speed', mGtiApplication.Objects.get("vSpeed").refresh, mGtiApplication.Objects.get("vSpeed"));
        mGtiApplication.Objects.get("mAccuracy").bind('change:accuracy', mGtiApplication.Objects.get("vAccuracy").resize, mGtiApplication.Objects.get("vAccuracy"));
        mGtiApplication.Objects.get("mRecord").bind('change:time', mGtiApplication.Objects.get("vTime").TimeChangedHandler, mGtiApplication.Objects.get("vTime"));
        mGtiApplication.Objects.get("mDistance").bind('change:distance', mGtiApplication.Objects.get("vDistance").refresh, mGtiApplication.Objects.get("vDistance"));
        mGtiApplication.Objects.get("cTour").bind('add', mGtiApplication.addedTrackToTour, mGtiApplication);
        //Die Einstellungen werden im LocalStorage gespeichert sobald sich das Settings-Objekt aendert
        mGtiApplication.Objects.get("settings").bind('change', mGtiApplication.Objects.get("localStorage").changeSettingsHandler, mGtiApplication.Objects.get("localStorage"));
    },

    //Weißt alle Events welche fuer das Geolocation-Objekt wichtig sind zu
    //und startet wichtige Funktionen
    initGeolocation: function() {

        mGtiApplication.Objects.get("mLogHistory").push("mGtiApplication.initGeolocation()");

        //Wenn die Orientierung aktualisiert wird, aktualisiert sich auch das Compass Model
        //Muss neu zugewiesen werden, da auch das mGeolocation Objekt neu angelegt wurde
        mGtiApplication.Objects.get("mGeolocation").bind('change:heading', mGtiApplication.Objects.get("cCompass").GeolocationHeadingChangedHandler, mGtiApplication.Objects.get("cCompass"));
        //mGtiApplication.Objects.get("mCompass").bind('change:heading', mGtiApplication.Objects.get("vMap").rotateMap, mGtiApplication.Objects.get("vMap"));
        //Falls sich die Position in mGeolocation veraendert, wird die Karte neu positioniert
        //Es muessen zwei Events erstellt werden, da Backbone es nicht unterstuetzt das Change-Event gleichzeitig auf mehrere Attribute anzuwenden
        mGtiApplication.Objects.get("mGeolocation").bind('change:latitude', mGtiApplication.Objects.get("vMap").locate, mGtiApplication.Objects.get("vMap"));
        mGtiApplication.Objects.get("mGeolocation").bind('change:longitude', mGtiApplication.Objects.get("vMap").locate, mGtiApplication.Objects.get("vMap"));
        //Wenn sich die Positionsgenauigkeit aendert muss das OpenLayers-Feature neu gezeichnet werden
        mGtiApplication.Objects.get("mGeolocation").bind('change:accuracy', mGtiApplication.Objects.get("mAccuracy").GetAccuracy, mGtiApplication.Objects.get("mAccuracy"));
        
        mGtiApplication.Objects.get("mGeolocation").bind('change:altitude', mGtiApplication.Objects.get("mAltitude").GetAltitude, mGtiApplication.Objects.get("mAltitude"));
        mGtiApplication.Objects.get("mGeolocation").bind('change:speed', mGtiApplication.Objects.get("mSpeed").GetSpeed, mGtiApplication.Objects.get("mSpeed"));
        
        //Falls zur Zeit kein watchProcess existiert
        if(mGtiApplication.Objects.get("watchProcess") == null) {

            //Die Position wird im angegebenen Intervall immer wieder erneuert
            mGtiApplication.Objects.get("mGeolocation").SetWatch();
        }

        //Wenn die Aufzeichnung aktiv ist muessen die Event-Listener auf das Geolocation-Model
        //wieder hinzugefuegt werden
        //mGtiApplication.Objects.get("cBtnRecord").AddOrRemoveGeolocationEventListeners();
        
        //Der Wert aendert sich auch schon direkt durch das Anlegen eines neuen Objektes
        mGtiApplication.Objects.get("cCompass").GeolocationHeadingChangedHandler();
        mGtiApplication.Objects.get("mAltitude").GetAltitude();
        mGtiApplication.Objects.get("mSpeed").GetSpeed();
        //Der Positionspfeil wird auf die aktuelle Drehung ausgerichtet
        mGtiApplication.Objects.get("vMap").rotateMarker();

        mGtiApplication.Objects.get("mLogHistory").pop();
    },
    
    initMainPage: function() {

        mGtiApplication.Objects.get("mLogHistory").push("mGtiApplication.initMainPage()");

        mGtiApplication.initGeolocation();
        //mGtiApplication.Objects.get("vMap").initMapDragEvents();
        //Wenn die Aufzeichnung aktiv ist, wird der Eventlistener der Aufzeichnung aktiviert
        mGtiApplication.Objects.get("cBtnRecord").AddOrRemoveGeolocationEventListeners();
        //Aktiviert wenn moeglich den Kompass
        //Darf nur aktiviert werden, wenn die Simulation nicht aktiv ist
        //und der Kompass bereits reagiert hat
        if(!mGtiApplication.Objects.get("settings").get("simulation") && mGtiApplication.Objects.get("settings").get("compass") != 0)
            mGtiApplication.Objects.get("mCompass").set({compass_activated: true});

        $('body').bind('touchmove', mGtiApplication.BlockMove);
        $(window).bind("orientationchange", mGtiApplication.fixContentHeight);
        $(window).bind("resize", mGtiApplication.fixContentHeight);
        
        //Funktion muss anfangs einmal aufgerufen werden
        mGtiApplication.fixContentHeight();

        mGtiApplication.Objects.get("mLogHistory").pop();
    },

    //Geolocation/Timer/usw.-Events werden beim verlassen der Hauptseite angehalten
    finishMainPage: function() {

        //Ermoeglicht das Scrollen auf der Seite
        $('body').unbind('touchmove', mGtiApplication.BlockMove);
        //Die Kartengroesse muss nur auf der Hauptseite neu berechnet werden
        $(window).unbind("orientationchange resize pageshow", mGtiApplication.fixContentHeight);
        //Entfernt alle Events vom Geolocation Objekt -->
        //Die Aktualisierung der Position wird gestoppt
        mGtiApplication.Objects.get("mGeolocation").unbind();
        mGtiApplication.Objects.get("mGeolocation").ClearWatch();
        //Deaktiviert den Kompass
        mGtiApplication.Objects.get("mCompass").set({compass_activated: false});
    },
    
    //Laedt die Benutzerdaten aus dem Settingsobjekt
    //und schreibt sie in die jeweiligen Controls in der Settings-Page
    loadUserDataIntoSettingsPage: function() {

        mGtiApplication.Objects.get("mLogHistory").push("mGtiApplication.loadUserDataIntoSettingsPage()");

        var settings = mGtiApplication.Objects.get("settings");
        
        $("#text_username").val(settings.get("username"));
        $("#text_password").val(settings.get("password"));

        if(settings.get("logging") == 1) {
            $("#check_logging").prop("checked",true).checkboxradio("refresh");
        }
        else {
            $("#check_logging").prop("checked",false).checkboxradio("refresh");
        }

        if(settings.get("simulation") == 1) {
            $("#check_simulation").prop("checked",true).checkboxradio("refresh");
        }
        else {
            $("#check_simulation").prop("checked",false).checkboxradio("refresh");
        }

        if(settings.get("compass") == 1) {
            $("#check_compass").prop("checked",true).checkboxradio("refresh");
        }
        else {
            $("#check_compass").prop("checked",false).checkboxradio("refresh");
        }

        if(settings.get("accuracy") == 1) {
            $("#check_accuracy").prop("checked",true).checkboxradio("refresh");
        }
        else {
            $("#check_accuracy").prop("checked",false).checkboxradio("refresh");
        }

        mGtiApplication.Objects.get("mLogHistory").pop();
    },
    
    //Laedt die Benutzerdaten und Einstellungen aus dem LocalStorage in das Settings-Model
    loadUserdata: function() {

        mGtiApplication.Objects.set("settings", new mGtiDataModelSettings);

        mGtiApplication.Objects.get('settings').set({username: mGtiApplication.Objects.get("localStorage").get("storage").username});
        mGtiApplication.Objects.get('settings').set({password: mGtiApplication.Objects.get("localStorage").get("storage").password});
        mGtiApplication.Objects.get('settings').set({maptype: mGtiApplication.Objects.get("localStorage").get("storage").maptype});
        mGtiApplication.Objects.get('settings').set({logging: mGtiApplication.Objects.get("localStorage").get("storage").logging});
        mGtiApplication.Objects.get('settings').set({compass: mGtiApplication.Objects.get("localStorage").get("storage").compass});
        mGtiApplication.Objects.get('settings').set({accuracy: mGtiApplication.Objects.get("localStorage").get("storage").accuracy});
        mGtiApplication.Objects.get('settings').set({speed: mGtiApplication.Objects.get("localStorage").get("storage").speed});
        mGtiApplication.Objects.get('settings').set({altitude: mGtiApplication.Objects.get("localStorage").get("storage").altitude});
        mGtiApplication.Objects.get('settings').set({distance: mGtiApplication.Objects.get("localStorage").get("storage").distance});
        mGtiApplication.Objects.get('settings').set({time: mGtiApplication.Objects.get("localStorage").get("storage").time});
        mGtiApplication.Objects.get('settings').set({zoom: mGtiApplication.Objects.get("localStorage").get("storage").zoom});
        mGtiApplication.Objects.get('settings').set({compassState: mGtiApplication.Objects.get("localStorage").get("storage").compassState});
        mGtiApplication.Objects.get('settings').set({lastMapLat: mGtiApplication.Objects.get("localStorage").get("storage").lastMapLat});
        mGtiApplication.Objects.get('settings').set({lastMapLon: mGtiApplication.Objects.get("localStorage").get("storage").lastMapLon});
    },

    activateSettingsForStartup: function() {

        mGtiApplication.Objects.get("mLogHistory").push("mGtiApplication.activateSettingsForStartup()");

        var settings = mGtiApplication.Objects.get("settings");

        mGtiApplication.Objects.get("mGeolocation").ClearWatch();

        //Falls die Simulation aktiviert ist, wird das Simulationsmodell als mGeolocation geladen
        if(settings.get("simulation") == 1) {

            mGtiApplication.Objects.set("mGeolocation", new mGtiGeolocationSimulation({errorRate: 0}));
        }
        //Ansonsten das echte Geolocation-Modell
        else {

            mGtiApplication.Objects.set("mGeolocation", new mGtiGeolocation({errorRate: 0}));
        }

        //Es wird die vom Benutzer ausgewaehlte Karte geladen
        //Kartentypen: 0... OpenStreetMap, 1... OpenCycleMap
        switch(settings.get("maptype")) {
            case "0":
                mGtiApplication.Objects.get("vMap").set_standard();
                break;
            case "1":
                mGtiApplication.Objects.get("vMap").set_cycle();
                break;
        }

        //Alle ausgewaehlten Info-Felder werden eingeblendet
        $("#sel-info option").each(function() {

            var option = this;
            //Falls die Option in den Einstellungen aktiviert wurde, wird sie sichtbar geschaltet
            if(settings.get(option.value) == 1) {
                document.getElementById("div_" + option.value).style.visibility="visible";
                $(option).attr("selected", true);
            }
            else {
                document.getElementById("div_" + option.value).style.visibility="hidden";
                $(option).removeAttr("selected");
            }
        });

        $("#sel-info").selectmenu('refresh');
        //Blendet den Zaehler des Info-Selects aus
        $('.ui-li-count').css("display", "none");

        //Es wird auf die gespeicherte Zoomstufe gezoomt
        mGtiApplication.Objects.get("map").zoomTo(settings.get("zoom"));

        //Der Kompass wird auf den gespeicherten Zustand gesetzt
        mGtiApplication.Objects.get("mCompass").set({state: settings.get("compassState")});
        var link = "./res/mainscreen/Kompass_" + (parseInt(settings.get("compassState")) + 1) + ".png";
        $("#compass").attr("src", link);

        //Wenn sich der Kompass im Zustand 0 befindet,
        //wird die Position auf die gespeicherte letzte Position gesetzt
        if(settings.get("compassState") == 0 && settings.get("lastMapLat") && settings.get("lastMapLon")) {

            //Die Position wird in das mGeolocation Model geschrieben
            //Dadurch springt die Karte nicht um, sobald echte Werte gefunden wurden
            mGtiApplication.Objects.get("mGeolocation").set({latitude: settings.get("lastMapLat")}, {silent: true});
            mGtiApplication.Objects.get("mGeolocation").set({longitude: settings.get("lastMapLon")}, {silent: true});
            //Setzt die Karte einmal auf die gespeicherte Position
            mGtiApplication.Objects.get("map").setCenter(new OpenLayers.LonLat(settings.get("lastMapLon"),
                settings.get("lastMapLat")).transform(mGtiApplication.Objects.get("map").displayProjection,
                mGtiApplication.Objects.get("map").projection));

        }

        mGtiApplication.Objects.get("mLogHistory").pop();
    },
    
    //Die Einstellungen werden angewandt
    activateSettings: function() {

        mGtiApplication.Objects.get("mLogHistory").push("mGtiApplication.activateSettings()");

        var settings = mGtiApplication.Objects.get("settings");
        
        mGtiApplication.Objects.get("mGeolocation").ClearWatch();

        //Falls die Simulation aktiviert ist, wird das Simulationsmodell als mGeolocation geladen
        if(settings.get("simulation") == 1) {

            mGtiApplication.Objects.set("mGeolocation", new mGtiGeolocationSimulation({errorRate: 0}));
        }
        //Ansonsten das echte Geolocation-Modell
        else {

            mGtiApplication.Objects.set("mGeolocation", new mGtiGeolocation({errorRate: 0}));
        }

        //Es wird die vom Benutzer ausgewaehlte Karte geladen
        //Kartentypen: 0... OpenStreetMap, 1... OpenCycleMap
        switch(settings.get("maptype")) {
            case "0":
                mGtiApplication.Objects.get("vMap").set_standard();
                break;
            case "1":
                mGtiApplication.Objects.get("vMap").set_cycle();
                break;
        }

        mGtiApplication.Objects.get("mLogHistory").pop();
    },

    //Wird immer aufgerufen wenn ein Track zur Tour-Collection hinzugefuegt wurde
    addedTrackToTour: function(track) {

        mGtiApplication.Objects.get("mLogHistory").push("mGtiApplication.addedTrackToTour()");

        mGtiApplication.Objects.get("map").events.register( "zoomend", track, track.mapZoomChangedHandler);

        //Falls die Boundings nicht im Datensatz enthalten waren (vor diesem Update)
        //muessen sie berechnet werden
        if(track.get("maxlon") == null && track.get("cTrackpoints").length > 0) {

            var minlat = track.get("cTrackpoints").at(0).get("lat"),
                minlon = track.get("cTrackpoints").at(0).get("lon"),
                maxlat = track.get("cTrackpoints").at(0).get("lat"),
                maxlon = track.get("cTrackpoints").at(0).get("lon");

            //Finden der kleinsten und groessten Laengen- und Breitengrade
            _(track.get("cTrackpoints").models).each(function(point) {

                if(point.get("lat") > maxlat)
                    maxlat = point.get("lat");
                if(point.get("lat") < minlat)
                    minlat = point.get("lat");
                if(point.get("lon") > maxlon)
                    maxlon = point.get("lon");
                if(point.get("lon") < minlon)
                    minlon = point.get("lon");
            });

            track.set({minlat: minlat});
            track.set({minlon: minlon});
            track.set({maxlat: maxlat});
            track.set({maxlon: maxlon});
        }

        mGtiApplication.Objects.get("mLogHistory").pop();
    },
    
    initLocalStorage: function () {
        
        mGtiApplication.Objects.set("localStorage", new mGtiDataModelLocalStorage());
        
        mGtiApplication.Objects.get("localStorage").set({storage: mGtiApplication.Objects.get("localStorage").getLocalStorage()});
        mGtiApplication.Objects.get("localStorage").init();
    },

    //Wenn sich die Groeße oder Ausrichtung des Fensters aendert
    //wird die Hoehe des Contents angepasst
    fixContentHeight: function() {

        if(mGtiApplication.Objects.get("mLogHistory"))
            mGtiApplication.Objects.get("mLogHistory").push("mGtiApplication.fixContentHeight()");

        window.scrollTo(0, 1);
        /*var footer = $("div[data-role='footer']"),
            content = $("div[data-role='content']"),*/
        var footer = $("#div_footer"),
            content = $("#div_content");
            //window.innerHeight MUSS statt $(window).height() verwendet werden
            //da jQuery auf iOS falsche Ergebnisse liefert

        //Die Hoehe der Seite ohne die Browserleiste
        var viewHeight = window.innerHeight;
        //Die Content-Hoehe sollte die Seitenhoehe ohne den Footer betragen
        var contentHeight = viewHeight - footer.height();

        content.height(contentHeight);

        
        mGtiApplication.SetMapSize();
        mGtiApplication.Objects.get("vZoomPlus").Reposition();
        mGtiApplication.Objects.get("vZoomMinus").Reposition();
        mGtiApplication.Objects.get("vResize").Reposition();

        if(mGtiApplication.Objects.get("mLogHistory"))
            mGtiApplication.Objects.get("mLogHistory").pop();

        //Damit auch jQuery Mobile das OrientationChange Event erfolgreich abfangen kann
        return true;
    },
    
    BlockMove: function(event) {
        
        event.preventDefault();
    },
    //Die notwendige Groeße des Karten-Div-Tags wird berechnet, so dass die Karte bei jeder moeglichen Drehung den gesamten Bildschirm ausfuellt
    SetMapSize: function() {

        if(mGtiApplication.Objects.get("mLogHistory"))
            mGtiApplication.Objects.get("mLogHistory").push("mGtiApplication.setMapSize()");

        //Berechnung der Hoehe und Breite
        //Die maximale Hoehe und Breite wird bei 45 Grad Drehung benoetigt und laesst sich ueber den Satz von Pythagoras berechnen
        $("#div_map").css("width", ((Math.sqrt(Math.pow(window.innerHeight, 2) + Math.pow(window.innerWidth, 2)) / window.innerWidth) * 100) + 20 + "%");
        $("#div_map").css("height", ((Math.sqrt(Math.pow(window.innerHeight, 2) + Math.pow(window.innerWidth, 2)) / (window.innerHeight - $("div[data-role='footer']").height())) * 100) + 20 + "%");

        if(window.innerHeight > window.innerWidth) {

            //Verschieben des Div-Tags, so dass es relativ zum Fenster zentriert ist
            $("#div_map").css("margin-left", ((($("#div_map").width() / window.innerWidth) * 100 - 100) / 2) * (-1) + "%");
            $("#div_map").css("margin-top", ((($("#div_map").height() / window.innerHeight) * 100 - 100) / 2) * (-1) + "%");
        }
        //Die Unterscheidung ist notwendig da margin immer relativ zur Breite angegeben wird
        //Wenn das Fenster breiter als hoch ist, muss der Prozentsatz auf die Breite umgerechnet werden
        else {

            //Verschieben des Div-Tags, so dass es relativ zum Fenster zentriert ist
            $("#div_map").css("margin-left", ((($("#div_map").width() / window.innerWidth) * 100 - 100) / 2) * (-1) + "%");
            $("#div_map").css("margin-top", ((($("#div_map").height() / window.innerHeight) * 100 - 100) / 2) * (-1)  * (window.innerHeight / window.innerWidth) + "%");
        }

        //Wenn die Groesse des Div-Tags der Map veraendert wird
        //muss diese Funktion aufgerufen werden
        mGtiApplication.Objects.get("map").updateSize();

        if(mGtiApplication.Objects.get("mLogHistory"))
            mGtiApplication.Objects.get("mLogHistory").pop();
    },
    //Liest alle URL-Parameter aus
    //Gibt ein Array mit allen Parametern zurueck
    getUrlParameters: function ()
    {

        mGtiApplication.Objects.get("mLogHistory").push("mGtiApplication.getURLParameters()");

        var vars = [], hash;
        var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
        for(var i = 0; i < hashes.length; i++)
        {
            hash = hashes[i].split('=');
            vars.push(hash[0]);
            vars[hash[0]] = hash[1];
        }

        mGtiApplication.Objects.get("mLogHistory").pop();

        return vars;
    }
};

//Fuer den Zugriff auf alle globalen Objekte
mGtiApplication.Objects = (function() {
    //Alle Objekte die global verfuegbar sein muessen
    var objects = {
        map: null,
        mapStorage: null,
        vMap: null,
        mMapDownload: null,
        cMapDownload: null,
        vMapDownload: null,
        mRecord: null,
        cBtnRecord: null,
        vBtnRecord: null,
        cRecordDialog: null,
        vRecordDialog: null,
        mCompass: null,
        vCompass: null,
        cCompass: null,
        mGeolocation: null,
        mGpx: null,
        mAltitude: null,
        mSpeed: null,
        mAccuracy: null,
        mTime: null,
        mDistance: null,
        mJSON: null,
        mLogger: null,
        mLogHistory: null,
        mDrag: null,
        mProgressbar: null,
        vProgressbar: null,
        watchProcess: null,
        refreshTime: 1000,
        position: null,
        marker: null,
        recording: false,
        parameterTrackID: null,
        mDatabase: null,
        waypoints: null,
        selectControl: null,
        mReadandRequestxml: null,
        vSelectInfo: null,
        cSearch: null,
        vSettingspage: null,
        vSaveUserdata: null,
        vCheckSimulation: null,
        vSelectMap: null,
        vZoomPlus: null,
        vZoomMinus: null,
        vRecord: null,
        vAltitude: null,
        vSpeed: null,
        vAccuracy: null,
        vTime: null,
        vDistance: null,
        vShowtracks: null,
        vShowtracklist: null,
        settings: null,
        localStorage: null,
        cWaypoints: null,
        vTrackManagement: null,
        vPopupWaypoint: null,
        vAddEditWaypoint: null,
        vDeleteWaypoint: null,
        selectedTrackid:null,
        cTracklist: null,
        vTrackDetails: null,
        checkedbutton: false,
        cTour: null,
        vApp: null,
        mainUrl: null,
        activeTrackCollection: null
    };
    return {
        //Mit dem Namen des Objektes kann es abgefragt werden
        get: function(name) {
          //Die if-Anweisugn prueft ob das Objekt existiert
          if(typeof objects[name] !== 'undefined') {
            return objects[name];
          } 
          //Wenn nicht, wird false zurueck geliefert
          else {
            return false;
          }
        },
        //Das Objekt kann auf einen neuen Wert gesetzt werden
        //Falls das Objekt nicht existiert wird ein neues angelegt
        set: function(name, value) {
          objects[name] = value;
        }
    };
})();

