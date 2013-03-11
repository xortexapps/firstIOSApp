var mGtiSearchControllerSearch = Backbone.View.extend({

    /**** Parameter ****
     * el
     * mReadandRequestxml
     * mCategories
     * vShowtracks
     * vExtendedOptions
     * logHistory
     * settings
     */

    init: function() {

        this.options.logHistory.push("mGtiSearchControllerSearch.init()");

        //Fuer die Suchen-Seite gibt es einen eigenen Home-Button,
        //da sie im Cache gespeichert wird und sonst einen Fehler verursachen wuerde
        $("#btn_home_search").attr("href", mGtiApplication.Objects.get("mainUrl"));

        //View fuer die erweiterten Optionen wird angelegt
        this.options.vExtendedOptions = new mGtiSearchViewExtendedOptions({el: $("#div_extended_options"), model: this.options.logHistory});

        $('#list_searchoptions').listview('refresh');

        this.options.logHistory.pop();
    },

    //Wird beim ersten Erzeugen der Seite aufgerufen
    create: function() {

        var categories = this.options.mCategories.getSelectListOptions();
        $("#select-category").html(categories);

        //Zuweisen der Events
        $("#btn_showtracks").bind("click", {this: this}, this.btnShowTracksClickHandler);
        $("#check_only_favourites").bind("change", {this: this}, this.ChangeCheckFavouriteHandler);
    },

    btnShowTracksClickHandler: function(evt) {

        evt.data.this.options.logHistory.push("mGtiSearchControllerSearch.btnShowTracksClickHandler()");

        //Es wird ueberprueft ob Benutzerdaten eingegeben worden sind
        if(evt.data.this.options.settings.get("username") != "" &&
            evt.data.this.options.settings.get("password") != "") {

            mGtiApplication.Objects.set("vShowtracklist", new mGtiTourViewTracklist());
            evt.data.this.options.vShowtracks.reset();
            evt.data.this.options.mReadandRequestxml = new mGtiDataModelReadandrequestxml();
            mGtiApplication.Objects.set("checkedbutton", false);
        }
        else {
            $().toastmessage('showWarningToast', "Bitte Benutzerdaten in der Einstellungsseite angeben");
            //Damit wird der Link des Buttons unterdrueckt
            return false;
        }

        evt.data.this.options.logHistory.pop();
    },

    //Reagiert auf Veraenderungen der Checkbox fuer die Favouriten
    ChangeCheckFavouriteHandler: function(evt) {

        evt.data.this.options.logHistory.push("mGtiSearchControllerSearch.ChangeCheckFavouriteHandler()");

        evt.data.this.options.vExtendedOptions.ChangeCheckFavouriteHandler();

        evt.data.this.options.logHistory.pop();
    }
});


