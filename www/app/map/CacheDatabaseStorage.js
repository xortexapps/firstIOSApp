/* Copyright (c) 2006-2012 by OpenLayers Contributors (see authors.txt for
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/**
 * @requires OpenLayers/Class.js
 */

/**
 * Class: OpenLayers.CacheDatabaseStorage
 *
 * A class used to create a HTML5 Web Database, which imitates the localStorage.
 * It offers a similar API as the localStorage object and recreates a
 * similar functionality. On initialization, a database with a table
 * called "KeyValuePair" will be created if possible.
 * Offers the same API as <OpenLayers.CacheLocalStorage>
 *
 * Inherits from:
 *  - <OpenLayers.Class>
 */
OpenLayers.CacheDatabaseStorage = OpenLayers.Class({

    /**
     * Property: storage
     * {Object Database}
     *     Property in which the class will store
     *     a HTML5 Database Object.
     */
    storage: null,
    /**
     * APIProperty: databaseName
     * {String} The database name is needed in order to create
     * and/or open the database. Default value is "default".
     */
    databaseName: "default",
    /**
     * APIProperty: databaseDisplayName
     * {String} The database display name will be shown to the user.
     * Default value is "default".
     */
    databaseDisplayName: "default",
    /**
     * APIProperty: databaseVersion
     * {String} The version number of the database.
     * If the database already exists and the stated version is
     * higher than the current version, the database will be rebuilt.
     * Default value is "1.0".
     */
    databaseVersion: "1.0",
    /**
     * APIProperty: databaseEstimatedSize
     * {Number} The estimated storage size the database will need.
     * If the value is bigger than 5MB, some browsers may prompt the
     * user to allow the storage usage. The users will also be
     * prompted if the database needs more than 5MB at a later point.
     * Default value is 5*1024*1024 (5MB).
     */
    databaseEstimatedSize: 5*1024*1024,

    TrackIdBuffer: null,
    TrackIdCounter: 0,
    EntryBuffer: null,
    EntryCounter: 0,

    /**
     * Constructor: OpenLayers.CacheDatabaseStorage
     *
     * Parameters:
     * options - {Object} Object with API properties for this control.
     */
    initialize: function(options) {

        var self = this;

        self.storage = mGtiApplication.Objects.get("mDatabase").get("db");
    },

    //Kuemmert sich um die Migration der Datenbank
    databaseMigration: function(onSuccess, onError, arguments) {

        var self = this;

        $().toastmessage("showNoticeToast", "Datenbankmigration gestartet. App nicht beenden!");

        self.TrackIdBuffer = new Array();

        var onSuccess = onSuccess;
        var onError = onError;

        //arguments.onSuccess = onSuccess;
        //Die neue Tabelle wird angelegt
        //self.createTables(migrateDatabase, onError, arguments);

        //function migrateDatabase(onSuccess, onError, arguments) {

            var arg = arguments;
            //Alle TrackIDs aus dem LocalStorage auslesen,
            //und in den TrackIdBuffer schreiben
            for(var i = 0; i < window.localStorage.length; i++) {
                var trackID = window.localStorage.key(i);
                //Bei dem Eintrag muss es sich um eine Zahl handeln
                if(!isNaN(trackID)) {
                    self.TrackIdBuffer.push(trackID);
                }
            }

            //Wird nur ausgefuehrt wenn sich auch Kartenmaterial im Speicher befindet
            if(self.TrackIdBuffer.length > 0) {
                //Der erste Track wird ausgelesen
                SelectQuery(self, onSuccess, onError, arguments);
            }
            //Ansonsten werden die alten Tabellen entfernt
            else {

                self.storage.transaction(function(t) {
                    t.executeSql("DROP TABLE IF EXISTS KeyValuePair;")
                }, function() {}, function() {});
                //Es muessen keine Daten uebernommen werden
                onSuccess();
            }

            //Sucht alle Eintraege fuer den naechsten Track aus der Datenbank
            function SelectQuery(parent, onSuccess, onError, arguments) {

                var self = parent;
                var arg = arguments;
                var trackID = self.TrackIdBuffer[self.TrackIdCounter];

                var searchParameter = trackID + "%";
                //Alle Datenbankeintraege fuer die TrackID auslesen
                self.oldStorage.transaction(function(t) {
                    t.executeSql("SELECT * FROM KeyValuePair WHERE key LIKE (?);",
                        [searchParameter],
                        //Jeder Eintrag wird in der neuen Tabelle gesetzt
                        function(t, result) {

                            self.EntryBuffer = result.rows;

                            //Der erste Eintrag des Tracks wird ausgelesen
                            SetQuery(self, onSuccess, onError, arg);
                        },
                        function(t, error) {
                            onError(error);
                        });
                });
            }

            //Alle Eintraege zum aktuellen Track werden ausgelesen
            //und danach wird auf den naechsten Track gewechselt
            function SetQuery(parent, onSuccess, onError, arguments) {

                var self = parent;
                var arg = arguments;
                //Die TrackID muss aus dem Key entfernt werden
                var url = self.EntryBuffer.item(self.EntryCounter).key;
                url = url.slice(url.indexOf("_") + 1);

                self.setItem(
                    url,
                    self.TrackIdBuffer[self.TrackIdCounter],
                    self.EntryBuffer.item(self.EntryCounter).value,
                    //Der Success-Callback fuer die Datenbankanfrage
                    function(parent) {

                        var self = parent;

                        //Der Counter fuer die Eintraege wird um 1 erhoeht
                        self.EntryCounter += 1;
                        //Wenn noch nicht alle Eintraege des aktuellen Tracks abgearbeitet wurden,
                        //wird die Funktion wieder aufgerufen
                        if(self.EntryCounter < self.EntryBuffer.length) {
                            SetQuery(self, onSuccess, onError, arg);
                        }
                        //Ansonsten wird der Counter fuer die Tracks um 1 erhoeht und
                        //und entweder der naechste Track ausgelesen oder
                        //der Success-Callback aufgerufen
                        else {
                            self.TrackIdCounter += 1;

                            //Wenn noch Tracks ausgelesen werden muessen,
                            //wird die Funktion SelectQuery aufgerufen
                            if(self.TrackIdCounter < self.TrackIdBuffer.length) {
                                //Der Counter fuer die Eintraege wird zurueckgesetzt
                                self.EntryCounter = 0;
                                SelectQuery(self, onSuccess, onError, arg);
                            }
                            //Ansonsten ist die Migration abgeschlossen,
                            //und der Success-Callback kann aufgerufen werden,
                            //nachdem die Datenbank Version umgeschrieben wurde
                            //und die alte Tabelle entfernt wurde
                            else {

                                self.oldStorage.transaction(function(t) {
                                    t.executeSql("DROP TABLE IF EXISTS KeyValuePair;")
                                }, function() {}, function() {
                                    onSuccess(arg);
                                });
                            }
                        }
                    },
                    function() {}, self
                );
            }
        //}
    },

    /**
     * Method: getItem
     * Searches for a row with the stated key
     * in the database and returns it.
     * Will call onSuccess(arguments) after a successful transaction.
     * Will call onError(errorMessage) if the transaction fails.
     *
     * Parameters:
     * key - {String}
     * onSuccess - {Function}
     * onError - {Function}
     * arguments - {Object}
     */
    getItem: function(url, onSuccess, onError, arguments) {

        var self = this;
        var arg = (arguments != null) ? arguments : {};

        self.storage.transaction(function(t) {
            t.executeSql("SELECT * FROM Tile WHERE url = ?;",
                [url],
                //Parsing the retrieved item
                function(t, result) {
                    //Only one value can and must be retrieved
                    var item;
                    if(result.rows.length > 0)
                        item = result.rows.item(0).data;

                    onSuccess(item, arg);
                },
                function(t, error) {
                    onError(error);
                });
        });
    },

    /**
     * Method: setItem
     *
     *
     * Parameters:
     * key - {String}
     * value - {String}
     * onSuccess - {Function}
     * onError - {Function}
     * arguments - {Object}
     */
    setItem: function(url, trackId, data, onSuccess, onError, arguments) {

        var self = this;
        var onSuccess = onSuccess;
        var onError = onError;
        var arg = (arguments != null) ? arguments : {};

        //Es wird wenn moegliche ein neuer Eintrag in der Tile-Tabelle angelegt
        self.storage.transaction(function(t) {
            t.executeSql("INSERT INTO Tile (url, data) VALUES (?, ?);" ,
                [url, data],
                //Success-Callback
                function(t, result) {

                    insertIntoTrackTile(url, trackId);

                },
                function(t, error) {
                    //Error-Code 1 sagt aus, dass der Eintrag bereits vorhanden ist
                    if(error.code == 1) {
                        //Der Eintrag muss auch angelegt werden wenn der Tile-Eintrag bereits vorhanden ist
                        insertIntoTrackTile(url, trackId);
                    }
                    else {
                        onError(error);
                    }
                }
            );
        });

        function insertIntoTrackTile(tileId, trackId) {

            //Es wird, wenn moeglich, ein neuer Eintrag in der Zuweisungstabelle TrackTile angelegt
            self.storage.transaction(function(t) {
                t.executeSql("INSERT INTO TrackTile (tileId, trackId) VALUES (?, ?);" ,
                    [tileId, trackId],
                    //Success-Callback
                    function(t, result) {
                        onSuccess(arg);
                    },
                    function(t, error) {
                        //Error-Code 1 sagt aus, dass der Eintrag bereits vorhanden ist
                        if(error.code != 1) {
                            onError(error);
                        }
                    }
                );
            });
        }
    },

    /**
     * Method: clear
     * Searches for keys which contain the stated
     * key part. If no key part is given, all rows
     * will be deleted.
     * Will call onSuccess(arguments) after a successful transaction.
     * Will call onError(errorMessage) if the transaction fails.
     *
     * Parameters:
     * key_part - {String}
     * onSuccess - {Function}
     * onError - {Function}
     * arguments - {Object}
     */
    clear: function(trackId, onSuccess, onError, arguments) {

        var self = this;
        var arg = (arguments != null) ? arguments : {};
        arg.cache_self = self;

        //Falls eine TrackID uebergeben wurde muss danach gesucht werden
        if(trackId != null) {
            self.storage.transaction(function(t) {

                //Loescht alle Eintraege mit der gegebenen TrackID aus der Zuweisungstabelle
                t.executeSql("DELETE FROM TrackTile WHERE trackId = ?;",
                    [trackId],
                    //Success-Callback
                    function(t, result) {

                        //Loescht alle Eintraege aus der Tile-Tabelle,
                        //welche keine Zuweisung mehr in der TrackTile-Tabelle besitzen
                        self.storage.transaction(function(t) {
                            t.executeSql("DELETE FROM Tile WHERE url NOT IN (SELECT tileId FROM TrackTile);",
                                [],
                                function(t, result) {
                                    onSuccess(arg);
                                },
                                function(t, error) {
                                    onError(error);
                                }
                            );
                        });
                    },
                    function(t, error) {
                        onError(error);
                    }
                );
            });
        }
        //Ansonsten wird einfach die gesamte Tabelle geloescht
        else {
            self.storage.transaction(function(t) {
                t.executeSql("DROP TABLE IF EXISTS Tile;")
            }, function() {});
        }
    },

    CLASS_NAME: "OpenLayers.CacheDatabaseStorage"
});
