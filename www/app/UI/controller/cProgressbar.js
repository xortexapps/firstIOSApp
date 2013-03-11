var mGtiUiControllerProgressbar = Backbone.View.extend({

    /**** Parameter ****
     * logHistory
     * downloadMap
     * mProgressbar
     * vProgressbar
     */

    init: function() {

        this.options.logHistory.push("mGtiUiControllerProgressbar.init()");

        //Zuweisen der Objekte zu den Models und Views
        this.options.mProgressbar.set({logHistory: this.options.logHistory});
        this.options.mProgressbar.set({downloadMap: this.options.mMapDownload});
        this.options.vProgressbar.el = this.options.el;
        this.options.vProgressbar.model = this.options.mProgressbar;

        //Wenn sich der trackPointCounter aendert muss der Fortschritt neu berechnet werden
        this.options.mMapDownload.bind('change:trackPointCounter', this.ChangeProgressCounterHandler, this);
        //this.options.mMapDownload.bind('change:zoomCounter', this.ChangeProgressCounterHandler, this);
        //Wenn sich der Fortschritt aendert muss die Anzeige des Progressbar geaendert werden
        this.options.mProgressbar.bind('change:progress', this.options.vProgressbar.ChangeProgressHandler, this.options.vProgressbar);


        this.options.logHistory.pop();
    },

    ChangeProgressCounterHandler: function() {

        this.options.logHistory.push("mGtiUiControllerProgressbar.ChangeProgressCounterHandler()");

        //Es muss zur Zeit ein Download aktiv sein
        if(this.options.mMapDownload.get("track") != null) {
            var numZoom = this.options.mMapDownload.get("zoomLevels").length;
            var numPoints = this.options.mMapDownload.get("track").get("cTrackpoints").length;
            var numMaps = this.options.mMapDownload.get("mapTypes").length;
            var curZoom = this.options.mMapDownload.get("zoomCounter");
            var curPoints = this.options.mMapDownload.get("trackPointCounter");
            var curMap = this.options.mMapDownload.get("mapTypeCounter");

            //Berechnung und Setzen des aktuellen Download-Fortschritts
            this.options.mProgressbar.set({progress:
                (((curPoints + 1) + (curZoom * numPoints) + (curMap * numPoints * numZoom)) / (numPoints * numZoom * numMaps)) * 100
            });
        }
        else {
            this.options.mProgressbar.set({progress: 0});
        }

        this.options.logHistory.pop();
    }
});