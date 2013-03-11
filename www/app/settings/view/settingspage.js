var mGtiSettingsViewSettingspage = Backbone.View.extend({
   
   init: function() {

        mGtiApplication.Objects.get("mLogHistory").push("mGtiSettingsViewSettingspage.init()");

        //Wenn zur Zeit ein Track heruntergeladen wird,
        //kann der Download hier abgebrochen werden
        if(mGtiApplication.Objects.get("mMapDownload").get("track") != null) {

            $("#li_options").prepend(
                '<div data-role="none" id="div_abort_download">' +
                    '<a id="btn_abort_download" href="" data-role="button" data-inline="true" style="background: red;">Download abbrechen</a>' +
                '</div>'
            );
            //$("#ul_settings").listview('refresh');
            $("#ul_settings").trigger('create');
        }

        mGtiApplication.Objects.set("vCheckOptions", new mGtiSettingsViewOptions({el: $("#div_simulation")}));
        //View fuer den Download-Abbrechen-Button
        mGtiApplication.Objects.set("vAbortDownload", new mGtiSettingsViewAbortDownload({el: $("#div_abort_download")}));

        //View fuer den Userdata-Button anlegen
        mGtiApplication.Objects.set("vSaveUserdata", new mGtiSettingsViewUserdata({el: $("#div_userdata")}));

        mGtiApplication.loadUserDataIntoSettingsPage();

        //View fuer das Map-Select anlegen
        mGtiApplication.Objects.set("vSelectMap", new mGtiSettingsViewMap({el: $("#div_mapselect")}));

        //Alle Auswahlen aufheben
        $("#select-map option:selected").prop("selected", false);

        //Kartentypen: 0... OpenStreetMap, 1... OpenCycleMap
        var index = mGtiApplication.Objects.get("settings").get("maptype");
        //Der Kartentyp am geladenen Index wird ausgewaehlt
        $("#select-map").prop("selectedIndex", index);
        //Die Anzeige wird aktualisiert
        $("#select-map").selectmenu("refresh");

        //Vorbereiten des Feedback-Links
        var href = "mailto:kontakt@gps-tour.info?";
        var subject = "Feedback mGti WebApp";
        href += "subject=" + subject;
        var body = "\r\n\r\nGeraeteinformationen:\r\n" +
           "  UserAgent: " + navigator.userAgent +
           " \r\nEinstellungen:" +
           " \r\n  Maptype: " + mGtiApplication.Objects.get("settings").get("maptype") +
           " \r\n  Compass: " + mGtiApplication.Objects.get("settings").get("compass") +
           " \r\n  Accuracy: " + mGtiApplication.Objects.get("settings").get("accuracy") +
           " \r\n  Logging: " + mGtiApplication.Objects.get("settings").get("logging") +
           " \r\n  Username: " + mGtiApplication.Objects.get("settings").get("username");
        href += "&body=" + body;

        href = encodeURI(href);

        //Weist dem a-Tag den Email-Link zu
        $("#a_feedback").attr("href", href);

        mGtiApplication.Objects.get("mLogHistory").pop();
   }
});

