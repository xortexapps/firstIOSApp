var mGtiTourModelWaypoint = Backbone.Model.extend({
    
    defaults: function() {
        return {
            lon: null,
            lat: null,
            ele: null,
            //Name-Titel
            name: "",
            //Beschreibung
            desc: "",
            //Das Darstellungssymbol
            sym: null,
            //ID in der Datenbank
            id: null
        };
    },
    
    //Der Titel und die Beschreibung des Wegpunktes werden auf die neuen Werte geaendert
    editWaypoint: function(id, data, database) {

        mGtiApplication.Objects.get("mLogHistory").push("mGtiTourModelWaypoint.editWaypoint()");
        
        database.get("db").transaction(function(t) {
           t.executeSql("UPDATE Waypoint SET data = ? WHERE id = ?;" ,
           [data, id],
           database.StatementSuccess,
           database.StatementError);
        });

        mGtiApplication.Objects.get("mLogHistory").pop();
    },
    
    //Loescht den uebergebenen Wegpunkt aus der Datenbank
    deleteWaypointFromDatabase: function(waypoint, database) {

        mGtiApplication.Objects.get("mLogHistory").push("mGtiTourModelWaypoint.deleteWaypointFromDatabase()");

        database.get("db").transaction(function(t) {
           t.executeSql("DELETE FROM Waypoint WHERE id = ?" ,
           [waypoint.attributes.id],
           database.StatementSuccess,
           database.StatementError);
        });

        mGtiApplication.Objects.get("mLogHistory").pop();
    }
});


