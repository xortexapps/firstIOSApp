var mGtiSearchViewExtendedOptions = Backbone.View.extend({

    //Reagiert auf Veraenderungen der Checkbox fuer die Favouriten
    ChangeCheckFavouriteHandler: function() {

        this.model.push("mGtiSearchViewExtendedOptions.ChangeCheckFavouriteHandler()");

        //Wenn die Checkbox gecheckt wird, muss das Feld fuer die Tags aktiviert werden
        if($("#check_only_favourites").attr("checked")) {
            $("#txt_tag").removeClass("ui-disabled");
        }
        else {
            $("#txt_tag").addClass("ui-disabled");
        }

        this.model.pop();
    }
});




