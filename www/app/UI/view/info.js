var mGtiUiViewInfo = Backbone.View.extend({
   
   events: {
       
       'change #sel-info': 'SelectedInfoFieldsChangedHandler'
   },

   initialize: function() {

       //Auf mobilen Geraeten soll aus Performancegruenden wenn moeglich das native Select-Menue verwendet werden
       //var useragent = navigator.userAgent.toLowerCase();
       //if(useragent.indexOf("android") > -1 || useragent.indexOf("iphone") > -1 || useragent.indexOf("ipad") > -1) {

       /*$("#sel-info").selectmenu({nativeMenu: "true"});
        $("#sel-info").selectmenu('refresh', true);*/
       // }
       //$("#sel-info").children().children().next().removeClass('ui-select');
   },
   
   //Wird aufgerufen wenn die Auswahl veraendert wird
    SelectedInfoFieldsChangedHandler: function() {

       mGtiApplication.Objects.get("mLogHistory").push("mGtiUiViewInfo.SelectedInfoFieldsChangedHandler()");

        var self = this;

        //Alle Info-Felder werden versteckt
        document.getElementById("div_speed").style.visibility="hidden";
        document.getElementById("div_time").style.visibility="hidden";
        document.getElementById("div_distance").style.visibility="hidden";
        document.getElementById("div_altitude").style.visibility="hidden";
        self.model.set({speed: 0}, {silent: true});
        self.model.set({distance: 0}, {silent: true});
        self.model.set({altitude: 0}, {silent: true});
        self.model.set({time: 0}, {silent: true});
        
        //Alle ausgewaehlten Info-Felder werden wieder eingeblendet
        $("#sel-info option:selected").each(function () {

            if(this.value =="speed"){
                document.getElementById("div_speed").style.visibility="visible";
                self.model.set({speed: 1}, {silent: true});
            }
            else if(this.value=="distance"){
                document.getElementById("div_distance").style.visibility="visible";
                self.model.set({distance: 1}, {silent: true});
            }
            else if(this.value=="altitude"){
                document.getElementById("div_altitude").style.visibility="visible";
                self.model.set({altitude: 1}, {silent: true});
            }
            else if(this.value=="time"){
                document.getElementById("div_time").style.visibility="visible";
                self.model.set({time: 1}, {silent: true});
            }
        });
       
        
        //Es werden neue Views fuer die Elemente angelegt und diese platziert
        vDistance = new mGtiUiViewDistance({el: document.getElementById("div_distance")});
        if (document.getElementById("div_time").style.visibility=="hidden")
        {
            vDistance.replace();
        }
        else
        {
            vDistance.place();
        }

        vSpeed = new mGtiUiViewSpeed({el: document.getElementById("div_speed")});
        if (document.getElementById("div_altitude").style.visibility=="hidden")
        {
            vSpeed.replace();
        }
        else
        {
            vSpeed.place();
        }

       //Blendet den Zaehler des Info-Selects aus
       $('.ui-li-count').css("display", "none");

       //Loest das Change-Event des Settings-Models aus, damit die Werte gespeichert werden
       self.model.change();

       mGtiApplication.Objects.get("mLogHistory").pop();
   }
});


