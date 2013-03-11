var mGtiUiViewZoomMinus = Backbone.View.extend({
   
   events: {
       'click #zoom_minus': 'ZoomOut'
   },
   
   ZoomOut: function() {
       mGtiApplication.Objects.get("map").zoomOut();
       this.model.set({zoom: mGtiApplication.Objects.get("map").getZoom()});
   },
   
   //Der Button wird immer 5% der Displayhoehe ueber dem footer platziert
   Reposition: function() {
      /*if($(document).height() > $(document).width())
      {
        $("#zoom_minus").css("bottom",
        ((($("#div_footer").height() * 100) / $(document).height())+22.5) + "%");
      }
      else
      {
        $("#zoom_minus").css("bottom",
        (($("#div_footer").innerHeight() * 100) / ($("#div_content").innerHeight() + $("#div_footer").innerHeight())) + "%");
           
           
      }*/
      mGtiApplication.Objects.get("mLogHistory").push("mGtiUiViewZoomMinus.Reposition()");

      $("#zoom_minus").css("bottom",
        (($("#div_footer").innerHeight() * 100) / ($("#div_content").innerHeight() + $("#div_footer").innerHeight())) + 5 + "%");

      mGtiApplication.Objects.get("mLogHistory").pop();
    }
});


