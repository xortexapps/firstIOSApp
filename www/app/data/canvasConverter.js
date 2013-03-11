var mGtiDataCanvasConverter = {

    //Wandelt ein Image-Objekt in eine Canvas
    //Data-URI um und gibt diese zurueck
    //Erwartet zusaetzlich den Datantyp des Bildes als String
    //z.B. "image/png" oder "image/jpg"
    convertToDataUri: function(image, image_type) {

        mGtiApplication.Objects.get("mLogHistory").push("mGtiDataCanvasConverter.convertToDataUri()");

        //Anlegend es Canvas Objekts
        var canvas = document.createElement("canvas"),
            context = canvas.getContext("2d");
        //Das Canvas-Objekt muss genauso gross sein wie das Bild
        canvas.width = image.width;
        canvas.height = image.height;
        //Das Bild wird in das Canvas gezeichnet
        context.drawImage(image, 0, 0, image.width, image.height);

        mGtiApplication.Objects.get("mLogHistory").pop();

        return canvas.toDataURL(image_type);
    },

    //Schreibt die uebergebene Farbe in alle nicht vollstaendig durchsichtigen Pixel des Bildes
    //Die Farben muessen als CSS-Farbcodes uebergeben werden (z.B. #FFAA00)
    //Gibt die DataURI des veraenderten Bildes zurueck
    exchangeColor: function(image, newColor) {

        //Die uebergenen Farbcodes muessen auf einzelne Integerwerte umgerechnet werden
        //RGB
        var newCol = new Array(0, 0, 0);

        newCol[0] = h2d(newColor.substr(1, 2));
        newCol[1] = h2d(newColor.substr(3, 2));
        newCol[2] = h2d(newColor.substr(5, 2));

        //Wandelt einen Hexadezimalwert in einen dezimalen Wert um
        function h2d(val) {
            return parseInt(val, 16);
        }

        //Anlegend es Canvas Objekts
        var canvas = document.createElement("canvas"),
            context = canvas.getContext("2d");
        //Das Canvas-Objekt muss genauso gross sein wie das Bild
        canvas.width = image.width;
        canvas.height = image.height;
        //Das Bild wird in das Canvas gezeichnet
        context.drawImage(image, 0, 0, image.width, image.height);

        //Die Pixeldaten werden ausgelesen
        var imageData = context.getImageData(0, 0, image.width, image.height);

        //console.log(imageData);
        var valueCounter = 0;
        var pixelCounter = 0;

        //Es wird jeder Pixel durchlaufen
        _.each(imageData.data, function(colorValue) {

            //console.log((pixelCounter + 1) * 4);
            //Ueberprueft ob das Pixel sichtbar ist
            if(imageData.data[(pixelCounter + 1) * 4] != 0 && valueCounter < 3) {

                //Ueberschreiben des Farbwertes
                //Die Transparenz wird nicht veraendert
                imageData.data[pixelCounter * 4 + valueCounter] = newCol[valueCounter];
            }
            if(valueCounter < 3) {
                valueCounter += 1;
            }
            else {
                pixelCounter += 1;
                valueCounter = 0;
            }
        });

        //Die Bilddaten werden in das Canvas zurueckgeschrieben
        context.putImageData(imageData, 0, 0);

        return canvas.toDataURL("image/png");
    }
}