var mGtiSettingsViewOptions = Backbone.View.extend({

    events: {
        'change #check_logging': 'logging',
        'change #check_simulation': 'simulation',
        'change #check_compass': 'compass',
        'change #check_accuracy': 'accuracy'
    },

    //Aktiviert die Simulation wenn moeglich
    //und gibt ansonsten eine Fehlermeldung aus
    logging: function() {

        if($("#check_logging").prop("checked")) {
            mGtiApplication.Objects.get("settings").set({logging: 1});
        }
        else
            mGtiApplication.Objects.get("settings").set({logging: 0});

    },

    //Aktiviert die Simulation wenn moeglich
    //und gibt ansonsten eine Fehlermeldung aus
    simulation: function() {

        mGtiApplication.Objects.get("mLogHistory").push("mGtiSettingsViewOptions.simulation()");

        if(mGtiApplication.Objects.get("cTour").activeTrack != null) {

            //Umschreiben des Einstellungsobjektes
            //Wenn die Checkbox gecheckt wurde, muss die Simulation aktiviert werden
            if($("#check_simulation").prop("checked"))
                mGtiApplication.Objects.get("settings").set({simulation: 1});
            else
                mGtiApplication.Objects.get("settings").set({simulation: 0});

            //Die zurueckgelegte Distanz wird auf 0 gesetzt
            mGtiApplication.Objects.get("mDistance").set({distance: 0});
            mGtiApplication.Objects.get("vAccuracy").reset();
            mGtiApplication.activateSettings();
        }
        //Es gibt keinen aktiven Track
        else {
            //Fehlermeldung wird ausgegeben und die Checkbox zurückgesetzt
            $().toastmessage('showErrorToast', "Kein aktivierter Track vorhanden");
            $("#check_simulation").prop("checked",false).checkboxradio("refresh");
        }

        mGtiApplication.Objects.get("mLogHistory").pop();
    },

    //Legt fest ob der Kompass verwendet werden soll
    compass: function() {

        if($("#check_compass").prop("checked")) {
            mGtiApplication.Objects.get("settings").set({compass: 1});
        }
        else {
            mGtiApplication.Objects.get("settings").set({compass: 0});
        }
    },

    //Legt fest ob die Genauigkeitsanzeige fuer die Position verwendet werden soll
    accuracy: function() {

        if($("#check_accuracy").prop("checked")) {
            mGtiApplication.Objects.get("settings").set({accuracy: 1});
            mGtiApplication.Objects.get("vAccuracy").resize();
        }
        else {
            mGtiApplication.Objects.get("settings").set({accuracy: 0});
            mGtiApplication.Objects.get("vAccuracy").reset();
        }
    }
});




