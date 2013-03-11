var mGtiTourModelCategories = Backbone.Model.extend({

    defaults: function() {
        return {
            categories: new Array(
                "ATV-Quad",
                "Bergtour",
                "Boot und Kanu",
                "Fahrrad Touring",
                "Gleitschirm und Drachen",
                "Inlineskates",
                "Klettersteig",
                "Langlauf",
                "Laufen",
                "Motorrad",
                "Mountainbike",
                "Nordic Walking",
                "Reiten",
                "Rennrad",
                "Rodeln",
                "Schneeschuh",
                "Sightseeing",
                "Skitour",
                "Transalp",
                "Trekkingbike",
                "Wandern"
            )
        };
    },

    getSelectListOptions: function() {

        var list = '<option>Kategorien</option>';
        var self = this;

        //Baut den HTML String fuer ein Select-Menue zusammen
        _.each(self.get("categories"), function(cat) {

            list += '<option value="' + cat + '">' + cat + '</option>';
        });

        return list;
    }
});