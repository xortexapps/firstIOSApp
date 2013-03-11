var mGtiGpsViewCompass = Backbone.View.extend({

   //Parameter
   model: null,
   el: null,

   ChangeCompassStateHandler: function() {

       this.model.get("logHistory").push("mGtiGpsViewCompass.ChangeCompassStateHandler()");

       switch(this.model.get('state')) {
           case 0:
               this.el.attr("src", "./res/mainscreen/Kompass_1.png");
               break;
           case 1:
               this.el.attr("src", "./res/mainscreen/Kompass_2.png");
               break;
           case 2:
               this.el.attr("src", "./res/mainscreen/Kompass_3.png");
               break;
       }

       this.model.get("logHistory").pop();
   },

   //Dreht den Kompass, falls er sich im richtigen Zustand befindet
   Rotate: function() {

       var self = this;
       self.model.get("logHistory").push("mGtiGpsViewCompass.Rotate()");

       //Dient dem aktivieren und deaktivieren der Animation
       /*if(Math.abs(self.model.get("previous_heading") - self.model.get("heading")) < 270) {
           mGtiApplication.Objects.get("cCompass").activateCompassAnimation();
       }
       else {
           mGtiApplication.Objects.get("cCompass").deactivateCompassAnimation();
       }*/

       //Liest die Ausrichtung des Kompass aus und rechnet die Geraeteausrichtung hinzu
       //Der Wert wird von 360° abgezogen, weil der Kompass immer nach Norden zeigen muss und nicht in die
       //derzeitige Bewegungsrichtung
       var heading;
       if(mGtiApplication.Objects.get("mCompass").get('heading') != 0)
            heading = 360 - self.model.get("deviceOffset") - Math.ceil(mGtiApplication.Objects.get("mCompass").get('heading')) - ((window.orientation != null) ? window.orientation : 0);
       else
            heading = 0;
       //Die Orientierung wird fuer alle moeglichen Browser geaendert
       this.el.css("-webkit-transform","rotate(" + heading + "deg)");
       this.el.css("-moz-transform","rotate(" + heading + "deg)");
       this.el.css("transform","rotate(" + heading + "deg)");

       self.model.get("logHistory").pop();
   }
});


