var mGtiRecordingViewBtnRecord = Backbone.View.extend({
   
   //Veraendert das angezeigte Button-Symbol
    BtnRecordClickHandler: function() {

        var button = $('#btn_record .ui-icon');

        if(this.model.get("recording")) {
            //Das Icon des Buttons wird geaendert um die Aktivierung zu verdeutlichen
            button.css('background', 'url(./res/Icons/Button-Leiste-Rec.png) 50% 50% no-repeat');
            button.css('background-size', '48px 40px');
            $('#btn_record .ui-btn-text').text("Pause");
            //$('#btn_record .ui-btn-active').removeClass("ui-btn-active");
        }
        else {
            //Das Icon des Buttons wird geaendert um die Deaktivierung zu verdeutlichen
            button.css('background', 'url(./res/Icons/Button-Leiste-Rec-Grau.png) 50% 50% no-repeat');
            button.css('background-size', '48px 40px');
            $('#btn_record .ui-btn-text').text("Aufzeichnen");
            //$('#btn_record .ui-btn-active').removeClass("ui-btn-active");
        }
   }
});

