var mGtiUiModelProgressbar = Backbone.Model.extend({

    defaults: function() {
        return{
            progress: 0,
            downloadMap: null,
            logHistory: null
        };
    }
});