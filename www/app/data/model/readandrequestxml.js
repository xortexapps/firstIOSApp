var mGtiDataModelReadandrequestxml = Backbone.Model.extend({
    defaults: function() {
        return {
            url: ''            
        };
    },

    //Liesst alle angegebenen Informationen aus den Eingabefeldern aus
    //und baut daraus die URL fuer den AJAX-Request zusammen
    buildSearchUrl: function() {

        mGtiApplication.Objects.get("mLogHistory").push("mGtiDataModelReadandrequestxml.httprequest()");

        var url = null;
        var ne_lat = 0;
        var ne_lng = 0;
        var sw_lat = 0;
        var sw_lng = 0;
        var tr_min = 0;
        var hm_min = 0;
        var hm_max = 0;
        var km_min = 0;
        var km_max = 0;
        var categories = new Array();
        var search_words = '';
        var only_circuits = 0;
        var only_favourites = 0;
        var tag = "";

        url = "/api/v1/search.php?"
        //Die Kartenmitte wird in LonLat-Werte umgewandelt
        var position = mGtiApplication.Objects.get("map").getCenter().transform(mGtiApplication.Objects.get("map").projection,
            mGtiApplication.Objects.get("map").displayProjection);
        ne_lat =  parseFloat(position.lat) +  parseFloat(($("#umkreis").val()/111));
        url += "ne_lat=" + ne_lat;

        ne_lng = parseFloat(position.lon) + parseFloat(($("#umkreis").val()/111));
        url += "&ne_lng=" + ne_lng;

        sw_lat = parseFloat(position.lat) - parseFloat(($("#umkreis").val()/111));
        url += "&sw_lat=" + sw_lat;
        sw_lng = parseFloat(position.lon) - parseFloat(($("#umkreis").val()/111));
        url += "&sw_lng=" + sw_lng;

        tr_min = $("#trackrank").val();
        url += "&tr_min=" + tr_min;

        hm_max = $("#hoehemax").val();
        url += "&hm_max=" + hm_max;

        hm_min = $("#hoehemin").val();
        url += "&hm_min=" + hm_min;

        km_min = $("#distancemin").val();
        url += "&km_min=" + km_min;

        km_max = $("#distancemax").val();
        url += "&km_max=" + km_max;


        categories = $("#select-category").val();
        if (categories != null)
        {
            for (i = 0; i < categories.length; i++) {
                 url += "&categories[]=" + categories[i];
            }
        }

        search_words = $("#searchword").val();
        var new_search_words = "";
        for (i = 0; i < search_words.length; i++) {
            if (search_words[i]== ' ')
            {
                new_search_words +='_'
            }
            else
            {
                new_search_words += search_words[i];
            }
        }
        url += "&search_words[]=" + new_search_words;

        if($("#check_only_circuits").attr("checked"))
            only_circuits = 1;
        url += "&only_circuits=" + only_circuits;

        if($("#check_only_favourites").attr("checked")) {
            only_favourites = 1;
            tag = $("#txt_tag").val();
            url += "&tags[]=" + tag;
        }
        url += "&only_favorites=" + only_favourites;

        //Ueberprueft ob nur eigene Touren zurueckgeliefert werden sollen
        if($("#check_only_my_tours").attr("checked")) {

            var username = mGtiApplication.Objects.get("settings").get("username");
            url += "&user_ids[]=" + username;
        }

        //Kodiert die URL und setzt sie dem Model
        this.set({url: encodeURI(url)});

        mGtiApplication.Objects.get("mLogHistory").pop();
    },
    
    //Der Ajax-Request an den Server wird durchgefuert
    getxml: function(new_url, onSuccess) {

        mGtiApplication.Objects.get("mLogHistory").push("mGtiDataModelReadandrequestxml.getxml()");

        var username = (mGtiApplication.Objects.get("settings").get("username") != null) ? mGtiApplication.Objects.get("settings").get("username") : "";
        var password = (mGtiApplication.Objects.get("settings").get("password") != null) ? mGtiApplication.Objects.get("settings").get("password") : "";

        $.ajax({
            type:"GET",
            url: new_url,
            dataType: "xml",
            //Wenn der Request erfolgreich war wird die Funktion aufgerufen
            //um die Daten aus dem File auszulesen
            dataFilter:mGtiApplication.Objects.get("mReadandRequestxml").getXmlValues,
            success:onSuccess,
            beforeSend: mGtiDataTransferAjax.beforeSendAuthorizationHeader,
            error:function (jqXHR, ajaxSettings, thrownError) {
              $().toastmessage('showWarningToast', "Fehler: Trackliste konnte nicht geladen werden.");
            }
        });

        mGtiApplication.Objects.get("mLogHistory").pop();
    },

    parsexml: function (infoTracks) {

        mGtiApplication.Objects.get("mLogHistory").push("mGtiDataModelReadandrequestxml.parsexml()");

        _(infoTracks).each(function(track) {
            //Fuer jeden ausgelesenen Track wird der Trackliste ein neues Element hinzugefuegt
            mGtiApplication.Objects.get("vShowtracks").addItem(
                track.m_title, track.m_id, track.m_cat, track.m_image,
                track.m_trackrank, track.m_distance, track.m_height,
                track.m_circuit, track.m_day, track.m_hour,
                track.m_min, track.m_profile, track.m_download
            );
        });
        //Entfernt den Inhalt des Info-Tags auf der Tracklist Seite
        //welches anzeigt das die Tracks geladen werden
        $('#h_InfoTag').html("");

        mGtiApplication.Objects.get("vShowtracklist").listviewrefr();

        mGtiApplication.Objects.get("mLogHistory").pop();
    },

    //Das XML-File wird ausgelesen
    getXmlValues: function(xml) {

        var trackArray = new Array();

        var m_id = 0;
        var m_title = null;
        var m_cat;
        var m_image;
        var m_trackrank;
        var m_distance;
        var m_height;
        var m_circuit;
        var m_day;
        var m_min;
        var m_hour;
        var m_profile;
        var m_download;

        $(xml).find("tracks").each(function(){
            //Alle Trackpoints innerhalb eines Tracks werden gefunden
            $(this).find("track").each(function(){
                m_id  = $(this).attr("id");
                m_title = $(this).find("title").text();
                m_cat = $(this).find("cat").text();
                m_image = $(this).find("image").text();
                m_profile = $(this).find("profile").text();
                m_trackrank = $(this).attr("tr");
                m_distance = $(this).attr("km");
                m_height = $(this).attr("hm");
                m_circuit = $(this).attr("circuit");
                m_download =$(this).find("download").text();
                $(this).find("time").each(function(){
                    m_day = $(this).find("d").text();
                    m_hour = $(this).find("h").text();
                    m_min = $(this).find("m").text();
                });

                trackArray.push({
                    m_title: m_title, m_id: m_id, m_cat: m_cat,
                    m_image: m_image, m_trackrank: m_trackrank,
                    m_distance: m_distance, m_height: m_height,
                    m_circuit: m_circuit, m_day: m_day,
                    m_hour: m_hour, m_min: m_min,
                    m_profile: m_profile, m_download: m_download
                });
            });
        });

        return trackArray;
    },

    //Liest die Daten fuer einen einzelnen Track aus
    //Wird aufgerufen wenn ein Track durch einen Uebergabeparameter geladen wird
    parseTrackInfo: function(infoTrack) {

        //Erstellen eines neuen Track-Models
        var track = new mGtiTourModelTrack();
        track.set({
            title: infoTrack[0].m_title,
            id: infoTrack[0].m_id,
            image: infoTrack[0].m_image,
            trackrank: infoTrack[0].m_trackrank,
            distance: infoTrack[0].m_distance,
            height: infoTrack[0].m_height,
            circuit: infoTrack[0].m_circuit,
            day: infoTrack[0].m_day,
            hour: infoTrack[0].m_hour,
            min: infoTrack[0].m_min,
            profile: infoTrack[0].m_profile,
            download: infoTrack[0].m_download
        });

        //Hinzufuegen des Track-Models zur cTracklist-Collection
        mGtiApplication.Objects.get("cTracklist").add(track);

        //Der Download-Link wird zusammengebaut und gesetzt
        mGtiApplication.Objects.get("vTrackDetails").downloadlink = "/tours/download/gpx.php?key=" + track.get("id") + "&version=opt";
        //Herunterladen des Tracks
        //Wenn der Download abgeschlossen wurde und der Track der Tour hinzugefuegt wurde
        //muss er als aktiver Track gesetzt werden
        mGtiApplication.Objects.get("vTrackDetails").downloadtrack(function(model_track) {

            mGtiApplication.Objects.get("cTour").activeTrack = model_track;

            //Liest die lat und lon Werte des ersten Trackpunktes des Tracks aus
            var lon = model_track.get("cTrackpoints").at(0).get("lon");
            var lat = model_track.get("cTrackpoints").at(0).get("lat");

            //Zentriert die Karte auf den Start des angezeigten Track
            mGtiApplication.Objects.get("map").setCenter(new OpenLayers.LonLat(lon, lat)
                .transform(mGtiApplication.Objects.get("map").displayProjection,
                mGtiApplication.Objects.get("map").projection));
        }, function() {});
    }

});


