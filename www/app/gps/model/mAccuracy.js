var mGtiGpsModelAccuracy = Backbone.Model.extend({

    defaults: function() {
        return {
            oldAccuracy: null,
            accuracy: null
        };
    },
    //Die Positionsgenauigkeit wird ausgelesen und die vorhergehende gespeichert
    GetAccuracy: function() {

        mGtiApplication.Objects.get("mLogHistory").push("mGtiGpsModelAccuracy.GetAccuracy()");

        var self = mGtiApplication.Objects.get("mAccuracy");

        //Die aktuelle Positionsgenauigkeit wird ausgelesen
        //und die vorhergehende zwischengespeichert
        self.set({oldAccuracy: self.get("accuracy")});

        //Die Positionsgenauigkeit darf maximal 300m betragen
        var accuracy = (mGtiApplication.Objects.get("mGeolocation").get("accuracy") < 300) ?
            mGtiApplication.Objects.get("mGeolocation").get("accuracy") : 300;

        self.set({accuracy: accuracy});

        mGtiApplication.Objects.get("mLogHistory").pop();
    }
});