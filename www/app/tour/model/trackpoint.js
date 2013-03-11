var mGtiTourModelTrackpoint = Backbone.Model.extend({
    
    defaults: function() {
        
      return {
          
        lat: 0,
        lon: 0,
        
        name: "",
        ele: 0,
        time: null
      };
    } 
});


