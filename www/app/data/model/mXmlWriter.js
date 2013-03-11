var mGtiDataModelXmlWriter = Backbone.Model.extend({

    defaults: function() {
        return {
            document: null,
            documentString: "",
            nodeStack: new Array()
        };
    },

    setHeader: function(header) {

    },

    //Legt ein neues Knotenelement an und legt den Typ im nodeStack ab
    //Parameter: type - String, attributes - Object
    beginNode: function(type, attributes) {

        //Anlegen des neuen Knotens
        var node = "<" + type;
        //Anfuegen der Eigenschaften
        var keys = Object.keys((attributes) ? attributes: {});
        _(keys).each(function(key) {
            node += " " + key + '="' + attributes[key] + '"';
        });
        node += ">";
        //Der Knoten wird dem String angefuegt
        this.set({documentString: this.get("documentString") + node});
        //Der Knotentyp wird dem Stack hinzugefuegt
        this.get("nodeStack").push(type);
    },

    //Schliesst den letzten Knoten und loescht den Eintrag aus dem Stack
    endNode: function() {

        var node = "</" + this.get("nodeStack").pop() + ">";
        this.set({documentString: this.get("documentString") + node});
    },

    //Setzt den Wert des derzeitigen Knotens
    setValue: function(value) {

        //Der Wert wird in einen CDATA-Abschnitt eingeschlossen,
        //um Sonderzeichen zu ermoeglichen
        this.set({documentString: this.get("documentString") + "<![CDATA[" + value + "]]>"});
    },

    //Gibt die generierte XML Datei zurueck
    getFile: function() {

        if(window.DOMParser) {
            var parser = new DOMParser();
            var doc = parser.parseFromString(this.get("documentString"), "text/xml");
            return doc;
        }
        else {
            return false;
        }
    }
});