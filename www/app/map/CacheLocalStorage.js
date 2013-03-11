/* Copyright (c) 2006-2012 by OpenLayers Contributors (see authors.txt for
 * full list of contributors). Published under the 2-clause BSD license.
 * See license.txt in the OpenLayers distribution or repository for the
 * full text of the license. */

/**
 * @requires OpenLayers/Class.js
 */

/**
 * Class: OpenLayers.CacheLocalStorage
 *
 * A class used to create a Cache, using the LocalStorage-Object.
 * It offers a similar functionality and API as LocalStorage but
 * works with Success and Error Callbacks.
 * It uses the same API as <OpenLayers.CacheDatabaseStorage>.
 *
 * Inherits from:
 *  - <OpenLayers.Class>
 */
OpenLayers.CacheLocalStorage = OpenLayers.Class({

    /**
     * Property: storage
     * {Object LocalStorage}
     *     Property in which the class will store
     *     the HTML5 LocalStorage Object.
     */
    storage: null,

    /**
     * Constructor: OpenLayers.CacheLocalStorage
     *
     * Parameters:
     * options - {Object} Object with API properties for this control.
     */
    initialize: function(options) {

        var self = this;

        //Check if LocalStorage is supported
        if(window.localStorage) {
            self.storage = window.localStorage;
            window.setTimeout(function() {
                    options.onSuccess(options.arguments); }
                , 0);
        }
        else {
            window.setTimeout(
                function() {
                    options.onError(null);
                },
                0);
        }
    },

    /**
     * Method: removeItem
     * Deletes the row with the stated key.
     *
     * Parameters:
     * key - {String}
     * onSuccess - {Function}
     * onError - {Function}
     * arguments - {Object}
     */
    removeItem: function(key, onSuccess, onError, arguments) {

        var self = this;
        var arg = arguments;
        try {

            self.storage.removeItem(key);
            window.setTimeout(
                function() {
                    onSuccess(arg);
                },
                0);
        }
        catch (error) {
            window.setTimeout(
                function() {
                    onError(error);
                },
                0);
        }
    },

    /**
     * Method: getItem
     * Searches for a row with the stated key
     * in the database and returns it.
     * Will call onSuccess(arguments) after a successful operation.
     * Will call onError(errorMessage) if the operation fails.
     *
     * Parameters:
     * key - {String}
     * onSuccess - {Function}
     * onError - {Function}
     * arguments - {Object}
     */
    getItem: function(key, onSuccess, onError, arguments) {

        var self = this;
        var arg = arguments;
        try {

            var item = self.storage.getItem(key);
            window.setTimeout(
                function() {
                    onSuccess(arg);
                },
                0);
        }
        catch (error) {
            window.setTimeout(
                function() {
                    onError(error);
                },
                0);
        }
    },

    /**
     * Method: setItem
     * Searches for a row with the stated key
     * and updates the value column with the
     * new value.
     * Will call onSuccess(arguments) after a successful operation.
     * Will call onError(errorMessage) if the operation fails.
     *
     * Parameters:
     * key - {String}
     * value - {String}
     * onSuccess - {Function}
     * onError - {Function}
     * arguments - {Object}
     */
    setItem: function(key, value, onSuccess, onError, arguments) {

        var self = this;
        var arg = arguments;
        try {
            self.storage.setItem(key, value);
            window.setTimeout(
                function() {
                    onSuccess(arg);
                },
                0);
        }
        catch (error) {
            window.setTimeout(
                function() {
                    onError(error);
                },
                0);
        }
    },

    /**
     * Method: clear
     * Searches for keys which contain the stated
     * key part. If no key part is given, all rows
     * will be deleted.
     * Will call onSuccess(arguments) after a successful operation.
     * Will call onError(errorMessage) if the operation fails.
     *
     * Parameters:
     * key_part - {String}
     * onSuccess - {Function}
     * onError - {Function}
     * arguments - {Object}
     */
    clear: function(key_part, onSuccess, onError, arguments) {

        var self = this;
        var arg = arguments;
        try {
            key_part = (key_part) ? key_part : "";
            var i, key;
            for (i=self.storage.length-1; i>=0; --i) {
                key = self.storage.key(i);
                if (key_part === "" || (key.substr(0, key_part.length) === key_part)) {
                    self.storage.removeItem(key);
                }
            }
            window.setTimeout(
                function() {
                    //alert("hallo");
                    onSuccess(arg);
                },
                0);
        }
        catch (error) {
            window.setTimeout(
                function() {
                    onError(error);
                },
                0);
        }
    },

    CLASS_NAME: "OpenLayers.CacheLocalStorage"
});
