var mGtiSettingsViewAbortDownload = Backbone.View.extend({

    events: {
        'click #btn_abort_download': 'Abort'
    },

    //Speichert die Benutzerdaten im LocalStorage
    Abort: function() {

        mGtiApplication.Objects.get("mLogHistory").push("mGtiSettingsViewAbortDownload.Abort()");

        //Bricht das Laden der Kartenteile ab
        mGtiApplication.Objects.get("mMapDownload").stopCaching();

        $().toastmessage("showNoticeToast", "Download abgebrochen");
        //Auf die Hauptseite zurueckwechseln
        $.mobile.changePage(mGtiApplication.Objects.get("mainUrl"));

        mGtiApplication.Objects.get("mLogHistory").pop();
    }
});