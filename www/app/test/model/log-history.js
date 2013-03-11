var mGtiTestModelLogHistory = Backbone.Model.extend({

    defaults: function() {
        return {
            layer: 0
        };
    },

    //Legt den Log-Eintrag an
    //und zaehlt eine Ebene nach oben
    push: function(entry) {

        var self = mGtiApplication.Objects.get("mLogHistory");

        //Generierung des Platzhalters
        var space = "";
        for(var i = 0; i < self.get("layer"); i++) {
            space += "--";
        }

        //Schreibt den Eintrag mit dem entsprechenden Platzhalter in den Log
        mGtiApplication.Objects.get("mLogger").log(space + entry);

        self.set({layer: self.get("layer") + 1});
    },

    //Zaehlt eine Ebene nach unten
    pop: function() {

        var self = mGtiApplication.Objects.get("mLogHistory");
        self.set({layer: self.get("layer") - 1});
    }
});