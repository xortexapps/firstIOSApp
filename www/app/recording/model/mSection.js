var mGtiRecordingModelSection = Backbone.Model.extend({

    defaults: function() {

        return {
            sectionNumber: 0,
            trackPoints: null
        };
    },

    //Berechnet den am weitesten Entfernten Punkt des Abschnitts
    //und gibt ein Objekt mit der Distanz (in Metern) und dem Index des Punktes zurueck
    getFurthestPoint: function() {

        var self = this;

        //Die Start und Endpunkte werden auf Meter umgerechnet
        var start = new OpenLayers.LonLat(
            self.get("trackPoints").at(0).get("lon"),
            self.get("trackPoints").at(0).get("lat")
        ).transform(mGtiApplication.Objects.get("map").displayProjection,
            mGtiApplication.Objects.get("map").projection);
        var end = new OpenLayers.LonLat(
            self.get("trackPoints").at(self.get("trackPoints").length - 1).get("lon"),
            self.get("trackPoints").at(self.get("trackPoints").length - 1).get("lat")
        ).transform(mGtiApplication.Objects.get("map").displayProjection,
            mGtiApplication.Objects.get("map").projection);

        var distance = 0;
        var index = 0;

        //Die Werte des Start und Endpunktes werden auf ganzzahlige Integer umgewandelt
        start.lon =  parseInt(start.lon);
        start.lat =  parseInt(start.lat);
        end.lon =  parseInt(end.lon);
        end.lat =  parseInt(end.lat);

        //Der Anfangspunkt dient als Nullstelle
        var xa = 0;
        var ya = 0;
        var za = 0;

        //Der Endpunkt muss relativ zum Startpunkt angegeben werden
        var xe = end.lon - start.lon;
        var ye = end.lat - start.lat;
        var ze = self.get("trackPoints").at(self.get("trackPoints").length - 1).get("ele") - self.get("trackPoints").at(0).get("ele");

        //Es wird fuer jeden Punkt die Distanz berechnet und gesetzt falls sie groesser ist
        //Der erste und letzte Punkt werden ignoriert
        for(var i = 1; i < self.get("trackPoints").length - 1; i++) {

            //Der Punkt wird auf Meter umgerechnet
            var mid = new OpenLayers.LonLat(
                self.get("trackPoints").at(i).get("lon"),
                self.get("trackPoints").at(i).get("lat")
            ).transform(mGtiApplication.Objects.get("map").displayProjection,
                mGtiApplication.Objects.get("map").projection);

            //Die Werte werden auf ganzzahlige Integer umgewandelt
            mid.lon =  parseInt(mid.lon);
            mid.lat =  parseInt(mid.lat);

            //Der Punkt muss relativ zum Startpunkt angegeben werden
            var xm = mid.lon - start.lon;
            var ym = mid.lat - start.lat;
            var zm = self.get("trackPoints").at(i).get("ele") - self.get("trackPoints").at(0).get("ele");

            //Die Normalebene des Vektors zwischen Start und Endpunkt wird auf den aktuellen Punkt gelegt
            var d = xe * xm + ye * ym + ze * zm;

            var xe2 = Math.pow(xe, 2),
                ye2 = Math.pow(ye, 2),
                ze2 = Math.pow(ze, 2);

            //Ebene wird mit dem Vektor zwischen Start und Ende geschnitten
            var alpha = (d - xe2 - ye2 - ze2) / (xe2 + ye2 + ze2);

            //Der Schnittpunkt
            var xs = xe + alpha * xe,
                ys = ye + alpha * ye,
                zs = ze + alpha * ze;

            //Die Distanz zwischen Schnittpunkt und aktuellem Punkt wird berechnet
            var dist = Math.sqrt(Math.pow(xm - xs, 2) + Math.pow(ym - ys, 2) + Math.pow(zm - zs, 2));

            //Falls die neue Distanz groesser ist, wird sie als neue maximale Distanz gesetzt
            if(dist > distance) {
                distance = dist;
                index = i;
            }
        }

        return {
            distance: distance,
            index: index
        };
    }
});


