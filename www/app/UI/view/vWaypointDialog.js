var mGtiUiViewWaypointDialog = Backbone.View.extend({

   //Fuehrt alle noetigen optischen Anpassungen durch
   init: function() {

       var self = this;

       //Es wird in der Ueberschrift angezeigt ob der Wegpunkt zum aufzuzeichnenden Track hinzugefuegt wird

       var str_lon;
       var str_lat;

       //Falls ein clickedMarker existiert,
       //wurde die Seite aufgerufen um den Marker zu bearbeiten
       if(self.model.get("clickedFeature") != null) {

           $("#headline").text("Bearbeiten");

           //Alle Wegpunkte besitzen die lon und lat-Attribute
           str_lon = self.model.get("clickedFeature").attributes.lon;
           str_lat = self.model.get("clickedFeature").attributes.lat;

           //Wenn der Wegpunkt eine ID besitzt, wurde er vom Benutzer angelegt
           //Wenn er die Eigenschaft cid besitzt, gehoert er zu einem aufgezeichneten Track
           if(self.model.get("clickedFeature").attributes.id != null
               || self.model.get("clickedFeature").attributes.cid != null) {

               //Der Loeschen-Button und der Bearbeiten-Button werden aktiviert
               //Die Klasse wird nur dann entfernt wenn sie auch existiert
               $("#btn_deleteWaypoint").removeClass("ui-disabled");
               $("#btn_addEditWaypoint").removeClass("ui-disabled");

               //Die Werte des Wegpunktes werden in die Textfelder eingefuegt
               $("#title").val(self.model.get("clickedFeature").attributes.name);
               $("#description").val(self.model.get("clickedFeature").attributes.desc);
           }
           else {

               $("#btn_deleteWaypoint").removeClass("ui-disabled");
               $("#btn_addEditWaypoint").removeClass("ui-disabled");
               //Der Loeschen-Button wird deaktiviert
               $("#btn_deleteWaypoint").addClass("ui-disabled");
               $("#btn_addEditWaypoint").addClass("ui-disabled");

               //Die Werte des Wegpunktes werden in die Textfelder eingefuegt
               $("#title").val(self.model.get("clickedFeature").attributes.name);
               $("#description").val(self.model.get("clickedFeature").attributes.desc);
           }

       }
       else {

           //Die Checkbox fuer die eigene Position wird eingefuegt
           $("#divMyPosition").html('<label><input type="checkbox" name="checkMyPosition" id="checkMyPosition" /> Aktueller Standort </label>');
           $("#divMyPosition").trigger("create");

           if(self.options.mRecord.get("recording")) {
               $("#headline").text("Trackaufzeichnung");
           }
           //oder ein eigener Wegpunkt angelegt wird
           else {
               $("#headline").text("Wegpunkt");
           }

           $("#btn_deleteWaypoint").removeClass("ui-disabled");
           //Der Loeschen-Button wird deaktiviert
           $("#btn_deleteWaypoint").addClass("ui-disabled");
           $("#btn_addEditWaypoint").removeClass("ui-disabled");

           $("#title").val("");
           $("#description").val("");

           str_lon = Math.round(self.options.mWaypointCreation.get("lon") * 100000) / 100000;
           str_lat = Math.round(self.options.mWaypointCreation.get("lat") * 100000) / 100000;
       }

       //Die gedrueckte Position wird angezeigt
       $('#p_longitude').text(str_lon);
       $('#p_latitude').text(str_lat);
   },

   //Entfernt die Checkbox fuer die eigene Position
   removeCheckMyPosition: function() {

       //Die Checkbox fuer die eigene Position wird eingefuegt
       $("#divMyPosition").html('');
       $("#divMyPosition").trigger("create");
   }
});


