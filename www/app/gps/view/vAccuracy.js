var mGtiGpsViewAccuracy = Backbone.View.extend({

    //Hier wird der Vektor-Layer fuer das Feature gespeichert
    layer: null,
    //Das Vektor-Feature zur Anzeige der Positionsgenauigkeit
    feature: null,

    //Der Vektor-Layer wird angelegt und der Karte hinzugefuegt
    //Das Feature wird angelegt und dem Layer hinzugefuegt
    init: function() {

        mGtiApplication.Objects.get("mLogHistory").push("mGtiGpsViewAccuracy.init()");

        var self = mGtiApplication.Objects.get("vAccuracy");

        //Anlegen des Layers fuer die Positionsgenauigkeit
        self.layer = new OpenLayers.Layer.Vector("Accuracy");

        //Anlegen und setzen des Features fuer die Genauigkeit
        //Benoetigt eine Position, einen Radius und die Anzahl der Seiten
        var circle = OpenLayers.Geometry.Polygon.createRegularPolygon(
            new OpenLayers.Geometry.Point(mGtiApplication.Objects.get("mGeolocation").get('longitude'),
                mGtiApplication.Objects.get("mGeolocation").get('latitude')
            ).transform(
                mGtiApplication.Objects.get("map").displayProjection,
                mGtiApplication.Objects.get("map").projection
            ),
            //Der Radius des Kreises
            self.model.get('accuracy'),
            30
        );

        //Aus der Geometrie "Circle" wird ein Feature erstellt
        var style = {
          fill: true,
          fillColor: '#E38100',
          fillOpacity: 0.2,
          strokeWidth: 1,
          strokeColor: '#FFFFFF',
          strokeOpacity: 0.6
        };
        self.feature = new OpenLayers.Feature.Vector(circle,{},style);

        //Das Feature fuer die Genauigkeit wird dem Layer hinzugefuegt
        self.layer.addFeatures([self.feature]);

        //Fuegt der Karte die beiden Vector-Layer hinzu
        mGtiApplication.Objects.get("map").addLayer(self.layer);

        //Setzt die beiden neuen Layer auf die obersten z-Index
        mGtiApplication.Objects.get("vMap").raiseLayerToTop(self.layer);
        mGtiApplication.Objects.get("vMap").raiseLayerToTop(mGtiApplication.Objects.get("position"));

        self.layer.redraw();

        mGtiApplication.Objects.get("mLogHistory").pop();
    },

    //Passt die Groesse des Positions-Genauigkeits-Features an
    resize: function() {

        mGtiApplication.Objects.get("mLogHistory").push("mGtiGpsViewAccuracy.resize()");

        var self = mGtiApplication.Objects.get("vAccuracy");

        //Die Position muss verfuegbar sein und exitieren
        if(mGtiApplication.Objects.get("mGeolocation").locationAvailable() &&
            mGtiApplication.Objects.get("settings").get("accuracy") != 0)
        {
            //Wenn das Feature noch nicht existiert, muss es angelegt werden
            if (self.feature == null)
            {
                self.init();
            }
            //Ansonsten muss die Groesse angepasst werden
            else {

                //Der Layer wird versteckt falls die Genauigkeit unter 10m liegt
                if(self.model.get("accuracy") < 15) {
                    self.hide();
                }
                else {
                    self.show();

                    var scale = self.model.get("accuracy") / self.model.get("oldAccuracy");
                    console.log(scale);
                    var origin = new OpenLayers.Geometry.Point(mGtiApplication.Objects.get("mGeolocation").get('longitude'),
                        mGtiApplication.Objects.get("mGeolocation").get('latitude')
                    ).transform(
                        mGtiApplication.Objects.get("map").displayProjection,
                        mGtiApplication.Objects.get("map").projection
                    );

                    self.feature.geometry.resize(scale, origin);
                    self.layer.redraw();
                }
            }
        }

        mGtiApplication.Objects.get("mLogHistory").pop();
    },

    //Versetzt das Vector-Feature auf die uebergebene Position
    move: function(position) {

        mGtiApplication.Objects.get("mLogHistory").push("mGtiGpsViewAccuracy.move()");

        var self = mGtiApplication.Objects.get("vAccuracy");
        //Darf nur verschoben werden, falls das Feature existiert
        if(self.feature)
            self.feature.move(position);

        mGtiApplication.Objects.get("mLogHistory").pop();
    },

    //Zeigt den Layer auf der Karte an
    show: function() {
        mGtiApplication.Objects.get("vAccuracy").layer.setVisibility(true);
    },

    //Versteckt den Layer
    hide: function() {
        mGtiApplication.Objects.get("vAccuracy").layer.setVisibility(false);
    },

    reset: function() {

        if(mGtiApplication.Objects.get("vAccuracy").layer != null) {
            mGtiApplication.Objects.get("vAccuracy").layer.removeAllFeatures();
            mGtiApplication.Objects.get("vAccuracy").feature = null;
            mGtiApplication.Objects.get("vAccuracy").layer.redraw();
        }
    }
});


