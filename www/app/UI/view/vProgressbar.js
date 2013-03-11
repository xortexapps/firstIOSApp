var mGtiUiViewProgressbar = Backbone.View.extend({

    el: null,
    model: null,

    ChangeProgressHandler: function() {

        this.model.get("logHistory").push("mGtiUiViewProgressbar.ChangeProgressHandler()");

        var self = this;
        //Anpassen der Breite an den derzeitigen Fortschritt
        $(self.el).css("width", self.model.get("progress") + "%");

        this.model.get("logHistory").pop();
    }
});