var mGtiDataModelColors = Backbone.Model.extend({

    defaults: function() {
        return {
            colors: new Array(
                //Weinrot
                {"color": "#A40004", "complement": "#078600"},
                //GPS-Tour.info Orange
                {"color": "#e99600", "complement": "#0F429A"},
                //Schlammgelb
                {"color": "#A68C00", "complement": "#240672"},
                //Wiesengruen
                {"color": "#76AF2C", "complement": "#A3295C"},
                //Dunkelgruen
                {"color": "#007F16", "complement": "#A60C00"},
                //Tuerkis
                {"color": "#08A65E", "complement": "#A63308"},
                //Hellblau
                {"color": "#8EB0FF", "complement": "#FFD581"},
                //Dunkelblau
                {"color": "#103DA6", "complement": "#A67108"},
                //Violet
                {"color": "#4A0FA6", "complement": "#A69508"},
                //Lila
                {"color": "#A063FF", "complement": "#FFED53"}
            )
        };
    }
});


