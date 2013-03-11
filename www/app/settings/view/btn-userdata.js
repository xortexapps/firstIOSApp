var mGtiSettingsViewUserdata = Backbone.View.extend({
   
   events: {
       'click #btn_userdata': 'Save'
   },
   
   //Speichert die Benutzerdaten im LocalStorage
   Save: function() {

        mGtiApplication.Objects.get("mLogHistory").push("mGtiSettingsViewUserdata.Save()");

        //Auslesen der Werte
        var username = $("#text_username").val();
        var password = $("#text_password").val();

        //Die neuen Werte werden in das Settings-Objekt uebertragen
        mGtiApplication.Objects.get("settings").set({username: username});
        mGtiApplication.Objects.get("settings").set({password: password});

        //Speichert die Benutzerdaten im LocalStorage ab
        mGtiApplication.Objects.get("localStorage").saveLoginData();

        mGtiApplication.Objects.get("mLogHistory").pop();
   }
});




