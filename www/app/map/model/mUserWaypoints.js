var mGtiMapModelUserWaypoints = Backbone.Model.extend({

    defaults: function() {
        return {
            //Der Layer auf welchem die eigenen Wegpunkte liegen
            waypointLayer: null,
            //Gibt an zu welchem Track das ausgewaehlte Feature gehoert
            track: null,
            //Das ausgewaehlte Feature
            clickedFeature: null
        };
    },

    //Fuegt der Datenbank und dem Layer fuer die eigenen Wegpunkte
    //ein neues Element hinzu
    AddUserWaypoint: function(lon, lat, title, desc) {

        var waypoint = {
            lon: lon,
            lat: lat,
            name: title,
            desc: desc
        };

        //Der neue Marker wird in der Datenbank abgespeichert
        //und der Karte hinzugefuegt
        mGtiApplication.Objects.get('mDatabase').AddWaypoint(waypoint);

        this.set({clickedFeature: null});
    },

    //Bearbeitet einen selbst angelegten Wegpunkt
    EditUserWaypoint: function() {

        var self = this;

        //Sucht in der Collection das Waypoint-Model mit der entsprechenden ID
        var model_waypoint = mGtiApplication.Objects.get("cWaypoints").get(self.get("clickedFeature").attributes.id);

        var waypoint = {
            name: $("#title").val(),
            desc: $("#description").val(),
            lon: model_waypoint.get("lon"),
            lat: model_waypoint.get("lat")
        };

        var data = mGtiApplication.Objects.get("mJSON").createJSONString(waypoint);
        //Die editWaypoint Funktion des Wegpunkt-Models wird aufgerufen -->
        //der Datenbankeintrag wird angepasst
        model_waypoint.editWaypoint(
            self.get("clickedFeature").attributes.id,
            data,
            mGtiApplication.Objects.get("mDatabase")
        );

        //Anpassen des Models an die neuen Werte
        model_waypoint.set({name: $("#title").val()});
        model_waypoint.set({name: $("#description").val()});

        //Anpassen des Features an die neuen Werte
        var feature = self.get("clickedFeature");

        feature.attributes.name = $("#title").val();
        feature.attributes.desc = $("#description").val();
        //Die Style-Eigenschaft fuer das Label muss angepasst werden
        feature.style.label = $("#title").val();
        feature.layer.redraw();
    },

    DeleteUserWaypoint: function() {

        var self = this;

        var feature = self.get("clickedFeature");
        //Entfernt das ausgewaehlte Feature aus dem Marker-Layer
        self.get("waypointLayer").removeFeatures([feature]);

        //Sucht in der Collection das Waypoint-Model mit der entsprechenden ID
        var model_waypoint = mGtiApplication.Objects.get("cWaypoints").get(feature.attributes.id);

        model_waypoint.deleteWaypointFromDatabase(feature, mGtiApplication.Objects.get("mDatabase"));
    },

    //Fuegt dem uebergebenen Track-Model einen Wegpunkt mit den uebergebenen Eigenschaften hinzu
    AddTrackWaypoint: function(track, lon, lat, ele, name, desc) {

        var model_waypoint = new mGtiTourModelWaypoint({
            name: name,
            desc: desc,
            lon: lon,
            lat: lat,
            ele: ele
        });

        track.get("cWaypoints").add(model_waypoint);

        var size = new OpenLayers.Size(16,26);
        //var icon = new OpenLayers.Icon('res/Icons/marker.png', size, offset);
        var icon = 'res/Icons/marker_green.png';
        //Der Markerstyle braucht die meisten Eigenschaften der Stylemap des Layers ebenfalls,
        //da die Stylemap nicht angewendet wird, wenn ein eigener Style vorhanden ist
        var markerstyle = {
            graphicWidth:size.w,
            graphicHeight:size.h,
            graphicXOffset:-(size.w/2),
            graphicYOffset:-size.h,
            externalGraphic:icon,
            //Das Label erhaelt das Text-Attribut der Features als Text
            label : name,
            //Gruenton
            fontColor: "#1AFF1A",
            fontSize: "14px",
            fontFamily: "Helvetica, 'Helvetica Neue', Arial, sans-serif",
            fontWeight: "bold",
            labelAlign: "lb",
            labelXOffset: size.w,
            labelYOffset: size.h / 2,
            //Rotton
            labelOutlineColor: "#FF1A1A",
            labelOutlineWidth: 3
        };

        //Ein neuer Marker wird erzeugt
        //Erhaelt zusaetzlich noch den Titel, die Beschreibung und die Zeilen-ID als Attribute
        var marker = new OpenLayers.Feature.Vector(new OpenLayers.Geometry.Point(lon, lat).transform(
            mGtiApplication.Objects.get("map").displayProjection,
            mGtiApplication.Objects.get("map").projection)
        );
        marker.style = markerstyle;
        marker.attributes = {
            name: name,
            desc: desc,
            lon: lon,
            lat: lat,
            //Nur Wegpunkte von aufgezeichneten Tracks besitzen diese Eigenschaft
            //Wird automatisch jedem Backbone-Model hinzugefuegt
            cid: model_waypoint.cid
        };

        track.get("vector_layer").addFeatures([marker]);
    },

    //Passt das uebergebenen Waypoint-Model an die uebergebenen Werte an
    EditTrackWaypoint: function(waypoint, name, desc) {

        var self = this;

        waypoint.set({name: name});
        waypoint.set({desc: desc});

        //Das ausgewaehlte Feature wird ausgelesen
        var feature = self.get("clickedFeature");
        //Die Style-Eigenschaft fuer das Label muss angepasst werden
        feature.style.label = name;
        //Die Attribute muessen veraendert werden
        feature.attributes.name = name;
        feature.attributes.desc = desc;
        feature.layer.redraw();
    },

    //Loescht das Wegpunkt-Model aus dem uebergebenen Track
    DeleteTrackWaypoint: function(waypoint, track) {

        var self = this;

        //Entfernt das Model aus der Collection
        track.get("cWaypoints").remove(waypoint);
        //Entfert das zugehoerige Feature vom Layer
        track.get("vector_layer").removeFeatures(self.get("clickedFeature"));
    }
});