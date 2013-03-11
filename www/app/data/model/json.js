var mGtiDataModelJson = Backbone.Model.extend({

    defaults: function() {
        return {

        };
    },

    //Erzeugt einen JSON-String aus einenm uebergebenen Objekt
    createJSONString: function(object) {

        var jsonString = "";

        jsonString = JSON.stringify(object);

        return jsonString;
    },

    //Wertet einen uebergebenen JSON-String aus
    //und gibt ein Objekt zurueck
    parseJSONString: function(jsonString) {

        var object = JSON.parse(jsonString);

        return object;
    }
});