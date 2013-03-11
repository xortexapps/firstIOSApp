var mGtiMapControllerMapDownload = Backbone.View.extend({

    /**** Parameter ****
     * mMapDownload
     ****/

    events: {
        'click #btnDownloadMap': 'btnDownloadMapClickHandler'
    },

    init: function() {

        //Mit der Funktion setElement(), kann das DOM-Element der View
        //nachtraeglich geaendert werden
        this.setElement(document.getElementById("div_mapDownloadControls"));
    },

    //Startet den Kartendownload
    btnDownloadMapClickHandler: function() {

        var self = this;

        if(self.options.mapStorage != null) {
            //Sucht in der Collection den ausgewaehlten Track
            var model_track = self.options.cTour.get(mGtiApplication.Objects.get("selectedTrackid"));
            //Liest aus welche Zoomlevels ausgewaehlt wurden
            var zoom_levels = new Array();
            //Fuegt dem Zoom-Levels Array alle ausgewaehlten Zoom-Levels hinzu
            $("#selectDownloadZoomLevels option:selected").each(function () {

                switch(this.value) {
                    case "selNear":
                        zoom_levels.push(18);
                        break;
                    case "selNormal":
                        zoom_levels.push(16);
                        break;
                    case "selFar":
                        zoom_levels.push(13);
                        break;
                    case "selOverview":
                        zoom_levels.push(-1);
                        break;
                }
            });

            //Die benoetigte Groesse der Karte wird berechnet
            var size = (Math.sqrt(Math.pow(window.innerHeight, 2) + Math.pow(window.innerWidth, 2)) + (window.innerWidth * 0.2) + "px");
            var map_types = new Array();

            //Fuegt dem Array fuer die Kartentypen, alle ausgewaehlten Kartentypen hinzu
            $("#selectDownloadMaps option:selected").each(function () {

                switch(this.value) {
                    case "selStreetMap":
                        map_types.push(0);
                        break;
                    case "selCycleMap":
                        map_types.push(1);
                        break;
                }
            });

            //Es muss mindest ein Zoomlevel und ein Kartentyp ausgewaehlt sein
            if(map_types.length > 0 && zoom_levels.length > 0) {
                self.options.mMapDownload.init(map_types, model_track, size, zoom_levels);
                $("#popup_mapDownload").dialog("close");
            }
            else {
                $().toastmessage("showErrorToast", "Ungültige Auswahl!");
            }
        }
        else {

            $().toastmessage("showErrorToast", "Datenbank existiert nicht");
        }
    }
});