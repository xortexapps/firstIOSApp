var mGtiSettingsViewMap = Backbone.View.extend({

   events: {
       'change #select-map': 'Select'
   },

   //Aendert die aktive Karte auf den ausgewaehlten Wert
   Select: function() {

        mGtiApplication.Objects.get("mLogHistory").push("mGtiSettingsViewMap.Select()");

        //Wenn sich der ausgewaehlte Werte aendert
        //wird auf die entsprechende Karte gewechselt
        $("#select-map option:selected").each(function () {

            if(this.value =="Standard") {
                mGtiApplication.Objects.get("vMap").set_standard();
            }
            else {
                mGtiApplication.Objects.get("vMap").set_cycle();
            }
        });
        //Schreibt den ausgewaehlten Index in die Einstellungen
        mGtiApplication.Objects.get('settings').set({maptype: $("#select-map").prop("selectedIndex")});

       mGtiApplication.Objects.get("mLogHistory").pop();
   }
});