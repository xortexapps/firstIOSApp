var mGtiUiViewResize = Backbone.View.extend({
   
   events: {
       'click #btn_resize': 'Resize'
   },
   
   //Der Content wird an die Seitengroesse angepasst
   Resize: function() {
       mGtiApplication.Objects.get("mLogHistory").push("mGtiUiViewResize.Resize()");

       mGtiApplication.fixContentHeight();

       mGtiApplication.Objects.get("mLogHistory").pop();
   },
   
   //Der Resize Button wird 10% ueber dem Zoom-Plus Button positioniert
   Reposition: function() {

       mGtiApplication.Objects.get("mLogHistory").push("mGtiUiViewResize.Reposition()");

       $("#btn_resize").css("top",
        ($("#zoom_plus").position().top - 2 * $("#btn_resize").height()) + "px"
            //(($("#div_content").innerHeight() + $("#div_footer").innerHeight()) / 10)
       );

       mGtiApplication.Objects.get("mLogHistory").pop();
   }
});

