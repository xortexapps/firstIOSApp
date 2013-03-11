var mGtiTourViewTracks = Backbone.View.extend({
    //el: $('#div_showtracks'),
    
    initialize: function(){

        mGtiApplication.Objects.get("mLogHistory").push("mGtiTourViewTrackss.render()");

        _.bindAll(this, 'render', 'addItem'); // remember: every function that uses 'this' as the current object should be in here

        this.collection = new mGtiTourCollectionTour();

        this.render();

        mGtiApplication.Objects.get("mLogHistory").pop();
    }, 
    
    //Fuer jedes Model in der Tracklist-Collection wird der Liste ein Element hinzugefuegt
    render: function(){

        mGtiApplication.Objects.get("mLogHistory").push("mGtiTourViewTrackss.render()");

      _(this.collection.models).each(function(track){ // in case collection is not empty
        mGtiApplication.Objects.get("vShowtracklist").appendItem(track);
      }, this);

        mGtiApplication.Objects.get("mLogHistory").pop();
    },
    
    //Die Tracklist-Collection wird geleert
    reset: function () {
        this.collection.reset();
        mGtiApplication.Objects.set("cTracklist", this.collection);
    },
    
    //Startet den Ajax-Request und laedt die Trackliste
    loadTracklist: function() {

        mGtiApplication.Objects.get("mLogHistory").push("mGtiTourViewTrackss.loadTracklist()");

        $('#h_InfoTag').html("Lade Trackliste...");
        //In der Collection darf sich nichts befinden
        var length = this.collection.length;
        if(length == 0) {
            
            mGtiApplication.Objects.get("mReadandRequestxml").getxml(
                mGtiApplication.Objects.get("mReadandRequestxml").get("url"),
                mGtiApplication.Objects.get("mReadandRequestxml").parsexml
            );
        }
        else {
            //Entfernt den Inhalt des Info-Tags auf der Tracklist Seite
            //welches anzeigt das die Tracks geladen werden
            $('#h_InfoTag').html("");
        }

        mGtiApplication.Objects.get("mLogHistory").pop();
    },
    
    //Legt ein neues Track-Model an und und fuegt dieses der Collection und der Liste hinzu
    addItem: function(m_title, m_id, m_cat, m_image, m_trackrank,  m_distance, m_height, m_circuit, m_day, m_hour, m_min, m_profile, m_download){

        mGtiApplication.Objects.get("mLogHistory").push("mGtiTourViewTrackss.addItem()");

        var track = new mGtiTourModelTrack();
        track.set({
            title: m_title,
            id: m_id,
            cat: m_cat,
            image: m_image,
            trackrank: m_trackrank,
            distance: m_distance,
            height: m_height,
            circuit: m_circuit,
            day: m_day,
            hour: m_hour,
            min: m_min,
            profile: m_profile,
            download: m_download// modify item defaults
        });

        this.collection.add(track);
        mGtiApplication.Objects.get("vShowtracklist").appendItem(track);
        mGtiApplication.Objects.set("cTracklist", this.collection);

        mGtiApplication.Objects.get("mLogHistory").pop();
    }
});
