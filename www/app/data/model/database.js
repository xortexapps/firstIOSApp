var mGtiDataModelDatabase = Backbone.Model.extend({
    
    defaults: function() {
        return {
            db: null,
            addedWaypointLon: null,
            addedWaypointLat: null
        };
    },

    //Anlegen der Datenbank falls sie noch nicht existiert
    init: function(onSuccess, onError) {

        var self = this;
        var onSuccess = onSuccess;
        var onError = onError;

        mGtiApplication.Objects.get("mLogHistory").push("mGtiDataModelDatabase.init()");

        //Die Datenbank wird angelegt oder geöffnet
        mGtiApplication.Objects.get("mDatabase").set({db: openDatabase('mGti', '', 'mGti-Database', 45*1024*1024)});
        //Der Klasse fuer den Kartendownload muss die Datenbank gesetzt werden
        mGtiApplication.Objects.get("mapStorage").storage = mGtiApplication.Objects.get("mDatabase").get("db");


        /////Versionsverwaltung der Datenbank

        var db = mGtiApplication.Objects.get("mDatabase").get("db");

        //Falls die Datenbank noch nicht existiert werden die Tabellen angelegt
        if(db.version == "") {

            //Wegen eines Fehlers im letzten Release,
            //kann es sein, dass die Datenbank auf dem Geraet nie eine Version zugewiesen bekommen hat
            //Es muss daher ueber das Schema ueberprueft werden, ob es sich um eine Version 1.1 Datenbank handelt
            db.transaction(function(t) {
                t.executeSql("SELECT * FROM Track;"
                    , null,
                    function(t, result) {

                        //Es muss mindestens ein Eintrag vorhanden sein
                        if(result.rows.length > 0) {
                            var data = result.rows.item(0).data;
                            //Das "data" Feld muss existieren und ungleich null sein
                            //Dann handelt es sich um Version 1.1 und die Datenbank kann migriert werden
                            if(data && data != null) {
                                migrate11To12();
                            }
                        }
                        //Ansonsten wird die alte Datenbank verworfen
                        //und die Tabellen neu angelegt
                        else {

                            //Die Tabellen werden zuerst geloescht und dann neu angelegt
                            self.dropTables();
                            self.createTables();
                            onSuccess();
                        }
                    },
                    //Wenn die Abfrage einen Fehler zurueckliefert,
                    //hat die Tabelle Track noch nicht existiert
                    //und die Datenbank muss neu angelegt werden
                    function(error) {

                        db.changeVersion("", "1.2", function() {
                            self.createTables();
                            onSuccess();
                        });
                    });
            });

        }
        //Falls es sich um die Version 1.0 der Datenbank handelt,
        //werden alle Tabellen geloescht und danach neu angelegt
        //Es erfolgt keine Datenbankmigration
        else if(db.version == "1.0") {
            var version = db.version;
            //Aendern der Datenbankversion
            db.changeVersion(version, "1.2", function() {
                //Die Tabellen werden zuerst geloescht und dann neu angelegt
                self.dropTables();
                self.createTables();
                onSuccess();
            });
        }
        //Die Kartentabellen muessen angelegt und die Kartenteile in die neue Datenbank migriert werden
        else if (db.version == "1.1") {

            migrate11To12();
        }
        else if(db.version == "1.2") {
            //Die Tabellen koennen theoretisch geloescht werden,
            //daher muessen sie notfalls neu angelegt werden
            self.createTables();
            onSuccess();
        }

        function migrate11To12() {

            self.createTables();

            var mapCache = mGtiApplication.Objects.get("mapStorage");

            //This will either create a new database or open an existing one,
            //depending if it already exists, or not.
            mapCache.oldStorage = openDatabase(
                "mapTiles",
                "",
                "mGti Maps",
                40 * 1024 * 1024
            );

            if(window.confirm("Wollen Sie ihr Kartenmaterial in die neue Datenbankversion übertragen? (Kann einige Minuten dauern)")) {

                if(mapCache != null) {

                    mapCache.databaseMigration(
                        //Success-Callback
                        function() {

                            db.changeVersion(db.version, "1.2");
                            $().toastmessage("showSuccessToast", "Datenbankmigration erfolgreich abgeschlossen");
                            onSuccess();
                        },
                        //Error-Callback
                        function() {
                            onError();
                        },
                        //Argumente
                        {}
                    );
                }
            }
            //Wenn der Benutzer die Kartenmaterialien nicht uebertragen will,
            //wird die alte Tabelle geloescht und die neuen Tabellen werden angelegt
            else {

                mapCache.oldStorage.transaction(function(t) {
                    t.executeSql("DROP TABLE IF EXISTS KeyValuePair;")
                    },
                    function(error) {}
                );

                self.createTables();
                db.changeVersion(db.version, "1.2");

                onSuccess();
            }
        }

        mGtiApplication.Objects.get("mLogHistory").pop();
    },

    //Legt die Tabellen an, falls sie noch nicht existieren
    createTables: function() {

        //Die Tabelle fuer die Wegpunkte
        mGtiApplication.Objects.get("mDatabase").get("db").transaction(function(t) {
            t.executeSql("CREATE TABLE IF NOT EXISTS Waypoint (id INTEGER PRIMARY KEY AUTOINCREMENT, data TEXT NOT NULL);")
        }, mGtiApplication.Objects.get("mDatabase").CreationError);

        //Die Tabelle fuer die Tracks
        mGtiApplication.Objects.get("mDatabase").get("db").transaction(function(t) {
            t.executeSql("CREATE TABLE IF NOT EXISTS Track (" +
                " id INTEGER PRIMARY KEY," +
                " data TEXT NOT NULL);")
        }, mGtiApplication.Objects.get("mDatabase").CreationError);

        //Die Tabelle fuer die Kartenteile
        mGtiApplication.Objects.get("mDatabase").get("db").transaction(function(t) {
            t.executeSql("CREATE TABLE IF NOT EXISTS Tile (" +
                " url TEXT PRIMARY KEY," +
                " data TEXT NOT NULL);")
        }, mGtiApplication.Objects.get("mDatabase").CreationError);

        //Zuweisungstabelle zwischen Tracks und Kartenteilen
        mGtiApplication.Objects.get("mDatabase").get("db").transaction(function(t) {
            t.executeSql("CREATE TABLE IF NOT EXISTS TrackTile (" +
                " tileId TEXT," +
                " trackId INTEGER," +
                " FOREIGN KEY(tileId) REFERENCES Tile(url)," +
                " FOREIGN KEY(trackId) REFERENCES Track(id)," +
                " PRIMARY KEY (tileId, trackId));"
            )
        }, mGtiApplication.Objects.get("mDatabase").CreationError);
    },

    //Loescht die Tabellen aus der Datenbank (von Version 1.1)
    dropTables: function() {

        mGtiApplication.Objects.get("mDatabase").get("db").transaction(function(t) {
            t.executeSql("DROP TABLE IF EXISTS waypoint;")
        }, mGtiApplication.Objects.get("mDatabase").CreationError);

        mGtiApplication.Objects.get("mDatabase").get("db").transaction(function(t) {
            t.executeSql("DROP TABLE IF EXISTS Track;")
        }, mGtiApplication.Objects.get("mDatabase").CreationError);
    },
    
    CreationError: function(error) {

        mGtiApplication.Objects.get("mLogHistory").push("mGtiDataModelDatabase.CreationError()");

        console.log("creationError: " + error.message);
        //Laesst den Fehlercode auswerten und gibt die entsprechende Fehlermeldung aus
        var message = mGtiApplication.Objects.get("mDatabase").AnalyzeErrorCode(error.code);
        $().toastmessage('showErrorToast', message);

        mGtiApplication.Objects.get("mLogHistory").pop();
    },

    //Wertet den uebergebenen Fehlercode der Datenbank aus
    //und gibt die entsprechende Fehlermeldung zurueck
    AnalyzeErrorCode: function(code) {

        mGtiApplication.Objects.get("mLogHistory").push("mGtiDataModelDatabase.AnalyzeErrorCode()");

        var error = "";

        switch(code) {

            case 0:
                error = "Datenbank-Error! Ein unbekannter Fehler, beim Ausführen einer Datenbanktransaktion, ist aufgetreten";
                break;
            case 1:
                error = "Datenbank-Error! Unbekannter Datenbankfehler aufgetreten";
                break;
            case 2:
                error = "Datenbank-Error! Die Datenbankversion entspricht nicht der erwarteten Version";
                break;
            case 3:
                error = "Datenbank-Error! Es wurden zu viele Sätze zurückgegeben";
                break;
            case 4:
                error = "Datenbank-Error! Der verfügbare Datenbankspeicher ist aufgebraucht";
                break;
            case 5:
                //error = "Datenbank-Error! Syntax Error beim Ausführen einer Transaktion aufgetreten";
                break;
            case 6:
                error = "Datenbank-Error! Eine Transaktion konnte wegen eines Constraints nicht durchgeführt werden";
                break;
            case 7:
                error = "Datenbank-Error! Timeout";
                break;
        }

        mGtiApplication.Objects.get("mLogHistory").pop();

        return error;
    },
    
    StatementError: function(t, error) {

        mGtiApplication.Objects.get("mLogHistory").push("mGtiDataModelDatabase.StatementError()");

        //Laesst den Fehlercode auswerten und gibt die entsprechende Fehlermeldung aus
        var message = mGtiApplication.Objects.get("mDatabase").AnalyzeErrorCode(error.code);
        console.log(error);
        //var message = error.message;
        $().toastmessage('showErrorToast', message);

        mGtiApplication.Objects.get("mLogHistory").pop();
    },
    
    StatementSuccess: function(t, result) {
        
    },

    //Wird aufgerufen wenn ein Wegpunkt erfolgreich angelegt wurde
    AddWaypointSuccess: function(t, result) {

        mGtiApplication.Objects.get("mLogHistory").push("mGtiDataModelDatabase.AddWaypointSuccess()");

        //Auslesen der temporaer gespeicherten Position
        var lon =  mGtiApplication.Objects.get("mDatabase").get("addedWaypointLon");
        var lat =  mGtiApplication.Objects.get("mDatabase").get("addedWaypointLat");

        //Fuegt den Wegpunt der Wegpunkt-Collection hinzu
        var waypoint = new mGtiTourModelWaypoint({});
            
        waypoint.set({lon: lon});
        waypoint.set({lat: lat});
        waypoint.set({name: $("#title").val()});
        waypoint.set({desc: $("#description").val()});
        waypoint.set({id: result.insertId});
        
        mGtiApplication.Objects.get("cWaypoints").add([waypoint]);
        
        //Fuegt den Wegpunkt der Karte hinzu
        //Muss hier aufgerufen werden da Datenbankabfragen asynchron sind
        //und weil die Zeilen-ID des Wegpunktes benoetigt wird
        mGtiApplication.Objects.get("vMap").addMarker(lon, lat, $("#title").val(), $("#description").val(), result.insertId);

        mGtiApplication.Objects.get("mLogHistory").pop();
    },
    //Laedt alle in der Datenbank gespeicherten Wegpunkte
    getWaypoints: function() {

        mGtiApplication.Objects.get("mLogHistory").push("mGtiDataModelDatabase.getWaypoints()");

        //Duerfen nur ausgelesen werden, falls die Datenbank existiert
        if(this.get("db") != null) {
            mGtiApplication.Objects.get("mDatabase").get("db").transaction(function(t) {
               t.executeSql("SELECT * FROM Waypoint;"
               , null, mGtiApplication.Objects.get("mDatabase").readWaypoints, mGtiApplication.Objects.get("mDatabase").StatementError);
            });
        }

        mGtiApplication.Objects.get("mLogHistory").pop();
    },
    //Die Wegpunkte werden aus der Datenbank ausgelesen
    readWaypoints: function(t, result) {

        mGtiApplication.Objects.get("mLogHistory").push("mGtiDataModelDatabase.readWaypoints()");

        var i, row;
        
        for(i = 0; i < result.rows.length; i++)
        {
            row = result.rows.item(i);

            var data = mGtiApplication.Objects.get("mJSON").parseJSONString(row.data);
            
            var waypoint = new mGtiTourModelWaypoint({});
            
            waypoint.set({lon: data.lon});
            waypoint.set({lat: data.lat});
            waypoint.set({name: data.name});
            waypoint.set({desc: data.desc});
            waypoint.set({id: row.id});
            
            mGtiApplication.Objects.get("cWaypoints").add([waypoint]);
        }
        
        //Die Marker werden in die Karte eingebunden
        //Muss hier aufgerufen werden da die Datenbankabfrage asynchron durchgefuehrt wird
        mGtiApplication.Objects.get("vMap").loadWaypoints();

        mGtiApplication.Objects.get("mLogHistory").pop();
    },
    
    //Fuegt einen neuen Wegpunkt in die entsprechende Tabelle hinzu
    AddWaypoint: function(waypoint) {

        mGtiApplication.Objects.get("mLogHistory").push("mGtiDataModelDatabase.AddWaypoint()");

        //Duerfen nur angelegt werden, falls die Datenbank existiert
        if(this.get("db") != null) {

            var data = mGtiApplication.Objects.get("mJSON").createJSONString(waypoint);

            //Die Position des Wegpunktes muss temporaer gespeichert werden
            //damit sie in der AddWaypointSuccess Methode verfuegbar ist
            this.set({addedWaypointLon: waypoint.lon});
            this.set({addedWaypointLat: waypoint.lat});

            //Einfuegen eines neuen Satzes in die Tabelle der Wegpunkte
            this.get("db").transaction(function(t) {
               t.executeSql("INSERT INTO waypoint (data) VALUES (?);"
               , [data], mGtiApplication.Objects.get("mDatabase").AddWaypointSuccess, mGtiApplication.Objects.get("mDatabase").StatementError);
            });
        }
        else {

            $().toastmessage('showWarningToast', "Datenbank existiert nicht");
        }

        mGtiApplication.Objects.get("mLogHistory").pop();
    },

    //Speichert einen neuen Track mit den uebergebenen Parametern in der Datenbank
    AddTrack: function(trackID, data) {

        mGtiApplication.Objects.get("mLogHistory").push("mGtiDataModelDatabase.AddTrack()");

        //Duerfen nur angelegt werden, falls die Datenbank existiert
        if(this.get("db") != null) {

            //Einfuegen eines neuen Satzes in die Tabelle der Tracks
            this.get("db").transaction(function(t) {
                t.executeSql("INSERT INTO Track (id, data) VALUES (?, ?);"
                    , [trackID, data],
                    mGtiApplication.Objects.get("mDatabase").AddTrackSuccess,
                    mGtiApplication.Objects.get("mDatabase").StatementError);
            });
        }
        else {

            $().toastmessage('showWarningToast', "Datenbank existiert nicht");
        }

        mGtiApplication.Objects.get("mLogHistory").pop();
    },

    //Success-Handler fuer die AddTrack-Datenbanktransaktion
    AddTrackSuccess: function(t, result) {

        //window.alert("Track wurde gespeichert");
    },

    //Liesst alle gespeicherten Tracks aus der Datenbank aus
    getTracks: function() {

        mGtiApplication.Objects.get("mLogHistory").push("mGtiDataModelDatabase.getTracks()");

        //Duerfen nur ausgelesen werden, falls die Datenbank existiert
        if(this.get("db") != null) {
            mGtiApplication.Objects.get("mDatabase").get("db").transaction(function(t) {
                t.executeSql("SELECT * FROM Track;"
                    , null, mGtiApplication.Objects.get("mDatabase").readTracks, mGtiApplication.Objects.get("mDatabase").StatementError);
            });
        }

        mGtiApplication.Objects.get("mLogHistory").pop();
    },

    //Wertet die zurueckgegebenen Tracks aus
    readTracks: function(t, result) {

        mGtiApplication.Objects.get("mLogHistory").push("mGtiDataModelDatabase.readTracks()");

        var i, row;

        for(i = 0; i < result.rows.length; i++)
        {
            row = result.rows.item(i);
            //Fuer jeden gefunden Track wird die Funktion parseTrackFromDatabase aufgerufen
            mGtiApplication.Objects.get("cTour").parseTrackFromDatabase(row);
        }

        mGtiApplication.Objects.get("mLogHistory").pop();
    },

    //Weisst die Kartenteile einer neuen TrackID zu
    updateMapToTrackRelations: function(currentId, newId) {

        var self = this;

        if(self.get("db") != null) {
            self.get("db").transaction(function(t) {
                t.executeSql("UPDATE TrackTile SET trackId = ? WHERE trackId = ?;"
                    , [newId, currentId], function() {}, mGtiApplication.Objects.get("mDatabase").StatementError);
            });
        }
    }
});




