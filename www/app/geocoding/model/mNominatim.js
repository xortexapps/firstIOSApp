var mGtiGeocodingModelNominatim = Backbone.Model.extend({

    defaults: function() {
        return {
        };
    },

    //Startet einen Request auf den Nominatim Server
    //Uebergibt der Callback-Funktion ein json-Objekt mit der Addresse
    SendRequest: function(lon, lat, onSuccess, onError) {

        var url = "http://nominatim.openstreetmap.org/reverse?";

        url += "format=json";
        url += "&addressdetails=1";
        url += "&limit=1";
        url += "&zoom=15";
        url += "&accept-language=de";
        url += "&lon=" + lon;
        url += "&lat=" + lat;


        $.ajax({
            type: "POST",
            url: url,
            dataType: "json",
            success: function(json) {
                onSuccess(json);
            },
            error: function(jqXHR, ajaxSettings, thrownError) {

                onError(thrownError);
            }
        });
    }
});