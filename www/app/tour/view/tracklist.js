var mGtiTourViewTracklist = Backbone.View.extend({ 

    init: function() {

        mGtiApplication.Objects.get("mLogHistory").push("mGtiTourViewTracklist.init()");

        //Ermoeglicht das Scrollen auf der Seite
        $('body').unbind('touchmove', mGtiApplication.BlockMove);

        if (mGtiApplication.Objects.get("checkedbutton") == false) {

            mGtiApplication.Objects.get("mReadandRequestxml").buildSearchUrl();
            mGtiApplication.Objects.set("checkedbutton", true);
        }
        else {

            mGtiApplication.Objects.get("vShowtracks").render();
        }

        $("#ul_track").delegate('li', 'click', function () {

            mGtiApplication.Objects.set("selectedTrackid",  $(this).attr('id') );
            //Die aktive Trackcollection wird auf die Tracklist Collection gesetzt
            mGtiApplication.Objects.set("activeTrackCollection", mGtiApplication.Objects.get("cTracklist"));

            //Das ButtonTemplate, welches beim Laden der Detailseite geladen wird, wird geaendert
            mGtiApplication.Objects.get("vTrackDetails").buttonTemplate = '<a href="" data-role="button" id="btn_download">Download</a>';
        });

        mGtiApplication.Objects.get("mLogHistory").pop();
    },

    //Veraendert das Theme eines Listenelements und
    //baut die Liste danach neu auf
    adjustListItemTheme: function(track, theme) {

        $("#ul_track #" + track.get("id")).replaceWith(
            '<li id="' + track.get("id")+ '" + data-theme=' + theme + '><a href="track_details.html">' +
                '<img id="tlImage_' + track.get("id") + '" src="' + track.get("image")+ '"/>' +
                '<h3>'+ track.get("id") + " - " + track.get("title") + '</h3>' +
                '<p>Rank: '+ track.get("trackrank") + ', Kat: ' + track.get("cat")
                    + '<br />' + 'Laenge: ' + track.get("distance") + ' km, Hoehe: ' + track.get("height") + ' m</p>' +
            '</a></li>');

        $("#ul_track").listview('refresh');
    },

    appendItem: function(track){

        var collection = mGtiApplication.Objects.get("cTour");
        var datatheme = "d";

        //Ueberprueft ob der Track bereits heruntergeladen wurde
        if(collection.get(track.get("id")) != null) {
            datatheme = "e";
        }

        $("#ul_track").append(
            '<li id="' + track.get("id")+ '" + data-theme=' + datatheme + '><a href="track_details.html">' +
                    '<img id="tlImage_' + track.get("id") + '" src="' + track.get("image")+ '"/>' +
                    '<h3>'+ track.get("id") + " - " + track.get("title") + '</h3>' +
                    '<p>Rank: '+ track.get("trackrank") + ', Kat: ' + track.get("cat")
                        + '<br />' + 'Laenge: ' + track.get("distance") + ' km, Hoehe: ' + track.get("height") + ' m</p>' +
            '</a></li>');
    },
    
    listviewrefr: function() {
        $("#ul_track").listview('refresh');  
    }
});