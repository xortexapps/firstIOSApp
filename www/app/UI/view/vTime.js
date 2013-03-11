var mGtiUiViewTime = Backbone.View.extend({
    
   TimeChangedHandler: function() {

       var self = this;

       var hours = 0,
           minutes = 0,
           seconds = 0;
       
       seconds = self.model.get("time");
       hours = Math.floor(self.model.get("time") / 3600);
       seconds = seconds - (hours * 3600);
       minutes = Math.floor(seconds / 60);
       seconds = seconds - minutes * 60;

       hours = self.Pad(hours.toString());
       minutes = self.Pad(minutes.toString());
       seconds = self.Pad(seconds.toString());

       $("#p_time").html( hours + ":" + minutes + ":" + seconds);
   },

   //Fuegt dem String eine redundante Null am Anfang an,
   //falls er einstellig ist
   Pad: function(string) {

       string = (string.length > 1) ? string : "0" + string;

       return string;
   }
});


