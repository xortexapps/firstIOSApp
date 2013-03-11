var mGtiTourViewUploadDialog = Backbone.View.extend({

    /**** Parameter *****
     */

    Init: function() {

        var self = this;

        $("#uploadTitle").val(self.model.get("title"));
        $("#uploadCountry").val(self.model.get("country"));
        $("#uploadState").val(self.model.get("state"));
        $("#uploadCounty").val(self.model.get("county"));

        var info = "";

        var day = self.model.get("day").toString();
        var hour = self.Pad(self.model.get("hour").toString());
        var min = self.Pad(self.model.get("min").toString());

        var time =  day + " Tage, " + hour + ":" + min + " h";

        info += "Länge: " + self.model.get("distance") + " km  <br />";
        info += "Höhenmeter: " + self.model.get("height") + " m <br />";
        info += "Dauer: " + time + " <br />";

        $("#divUploadTrackInfo").html("<p>" + info + "</p>");
    },

    //Fuegt dem String eine redundante Null am Anfang an,
    //falls er einstellig ist
    Pad: function(string) {

        string = (string.length > 1) ? string : "0" + string;

        return string;
    }
});