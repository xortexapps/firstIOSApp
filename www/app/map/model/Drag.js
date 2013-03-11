var mGtiMapModelDrag = Backbone.Model.extend({

    defaults: function() {
        return{
            previous_x: null,
            previous_y: null,
            mouseMoved: false
        };
    },

    //Aendert den Wert von previous_x und y auf die uebergenen Werte
    SetPosition: function(x, y) {

        this.set({previous_x: x});
        this.set({previous_y: y});
    }
});
