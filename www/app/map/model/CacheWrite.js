/**
 * @requires OpenLayers/Control.js
 * @requires OpenLayers/Request.js
 * @requires OpenLayers/Console.js
 */

/**
 * Class: OpenLayers.Control.CacheWrite
 * A control for caching image tiles in the browser's local storage. The
 * <OpenLayers.Control.CacheRead> control is used to fetch and use the cached
 * tile images.
 *
 * Note: Before using this control on any layer that is not your own, make sure
 * that the terms of service of the tile provider allow local storage of tiles.
 *
 * Inherits from:
 *  - <OpenLayers.Control>
 */
var mGtiMapModelCacheWrite = OpenLayers.Class(OpenLayers.Control, {

    /**
     * APIProperty: events
     * {<OpenLayers.Events>} Events instance for listeners and triggering
     *     control specific events.
     *
     * To register events in the constructor, configure <eventListeners>.
     *
     * Register a listener for a particular event with the following syntax:
     * (code)
     * control.events.register(type, obj, listener);
     * (end)
     *
     * Supported event types (in addition to those from <OpenLayers.Control.events>):
     * cachefull - Triggered when the cache is full. Listeners receive an
     *     object with a tile property as first argument. The tile references
     *     the tile that couldn't be cached.
     */

    /**
     * APIProperty: eventListeners
     * {Object} Object with event listeners, keyed by event name. An optional
     *     scope property defines the scope that listeners will be executed in.
     */

    /**
     * APIProperty: layers
     * {Array(<OpenLayers.Layer.Grid>)}. Optional. If provided, caching
     *     will be enabled for these layers only, otherwise for all cacheable
     *     layers.
     */
    layers: null,

    /**
     * APIProperty: imageFormat
     * {String} The image format used for caching. The default is "image/png".
     *     Supported formats depend on the user agent. If an unsupported
     *     <imageFormat> is provided, "image/png" will be used. For aerial
     *     imagery, "image/jpeg" is recommended.
     */
    imageFormat: "image/png",

    /**
     * APIProperty: storage
     * {Object (<OpenLayers.Storage>) or Object (<window.localStorage>)}
     *     Optional property to define the storage used as cache.
     *     Default is Object (<window.localStorage>).
     */
    storage: null,

    /**
     * APIProperty: prefix
     * {String} Optional property to set the prefix, put at the
     * start of all keys. Default is "olCache_".
     */
    trackId: "",

    /**
     * Property: quotaRegEx
     * {RegExp}
     */
    quotaRegEx: (/quota/i),

    /**
     * Constructor: OpenLayers.Control.CacheWrite
     *
     * Parameters:
     * options - {Object} Object with API properties for this control.
     */

    /**
     * Method: setMap
     * Set the map property for the control.
     *
     * Parameters:
     * map - {<OpenLayers.Map>}
     */
    setMap: function(map) {
        OpenLayers.Control.prototype.setMap.apply(this, arguments);
        var i, layers = this.layers || map.layers;
        for (i=layers.length-1; i>=0; --i) {
            this.addLayer({layer: layers[i]});
        }
        if (!this.layers) {
            map.events.on({
                addlayer: this.addLayer,
                removeLayer: this.removeLayer,
                scope: this
            });
        }
    },

    /**
     * Method: addLayer
     * Adds a layer to the control. Once added, tiles requested for this layer
     *     will be cached.
     *
     * Parameters:
     * evt - {Object} Object with a layer property referencing an
     *     <OpenLayers.Layer> instance
     */
    addLayer: function(evt) {
        evt.layer.events.on({
            tileloadstart: this.makeSameOrigin,
            tileloaded: this.cache,
            scope: this
        });
    },

    /**
     * Method: removeLayer
     * Removes a layer from the control. Once removed, tiles requested for this
     *     layer will no longer be cached.
     *
     * Parameters:
     * evt - {Object} Object with a layer property referencing an
     *     <OpenLayers.Layer> instance
     */
    removeLayer: function(evt) {
        evt.layer.events.un({
            tileloadstart: this.makeSameOrigin,
            tileloaded: this.cache,
            scope: this
        });
    },

    /**
     * Method: makeSameOrigin
     * If the tile does not have CORS image loading enabled and is from a
     * different origin, use OpenLayers.ProxyHost to make it a same origin url.
     *
     * Parameters:
     * evt - {<OpenLayers.Event>}
     */
    makeSameOrigin: function(evt) {
        if (this.active) {
            var tile = evt.tile;
            if (tile instanceof OpenLayers.Tile.Image &&
                !tile.crossOriginKeyword &&
                tile.url.substr(0, 5) !== "data:") {
                var sameOriginUrl = OpenLayers.Request.makeSameOrigin(
                    tile.url, OpenLayers.ProxyHost
                );
                mGtiMapModelCacheWrite.urlMap[sameOriginUrl] = tile.url;
                tile.url = sameOriginUrl;
            }
        }
    },

    /**
     * Method: cache
     * Adds a tile to the cache. When the cache is full, the "cachefull" event
     * is triggered.
     *
     * Parameters:
     * obj - {Object} Object with a tile property, tile being the
     *     <OpenLayers.Tile.Image> with the data to add to the cache
     */
    cache: function(obj) {
        var self = this;
        if (this.active) {
            var tile = obj.tile;
            if (tile instanceof OpenLayers.Tile.Image &&
                tile.url.substr(0, 5) !== 'data:') {
                var canvasContext = tile.getCanvasContext();
                if (canvasContext) {
                    var urlMap = mGtiMapModelCacheWrite.urlMap;
                    var url = urlMap[tile.url] || tile.url;
                    self.storage.setItem(
                        url,
                        this.trackId,
                        canvasContext.canvas.toDataURL(this.imageFormat),
                        function(arg) {},
                        function(e) {
                            // local storage full or CORS violation
                            var reason = e.name || e.message;
                            if (reason && self.quotaRegEx.test(reason)) {
                                self.events.triggerEvent("cachefull", {tile: tile});
                            } else {
                                OpenLayers.Console.error(e.toString());
                            }
                        },
                        null
                    );
                    delete urlMap[tile.url];
                }
            }
        }
    },

    /**
     * Method: destroy
     * The destroy method is used to perform any clean up before the control
     * is dereferenced.  Typically this is where event listeners are removed
     * to prevent memory leaks.
     */
    destroy: function() {
        if (this.layers || this.map) {
            var i, layers = this.layers || this.map.layers;
            for (i=layers.length-1; i>=0; --i) {
                this.removeLayer({layer: layers[i]});
            }
        }
        if (this.map) {
            this.map.events.un({
                addlayer: this.addLayer,
                removeLayer: this.removeLayer,
                scope: this
            });
        }
        OpenLayers.Control.prototype.destroy.apply(this, arguments);
    },

    CLASS_NAME: "OpenLayers.Control.CacheWrite"
});

/**
 * APIFunction: OpenLayers.Control.CacheWrite.clearCache
 * Clears all tiles cached with <OpenLayers.Control.CacheWrite> from the cache.
 *
 * Parameters:
 * storage - {Object (<OpenLayers.Storage>) or Object (<window.localStorage>)}
 *     Optional property to define the storage to empty.
 *
 * prefix - {String} Optional property to set the prefix searched for in
 *     the storage.
 */
mGtiMapModelCacheWrite.clearCache = function(storage, trackId, onSuccess, onError, arguments) {

    trackId = (trackId != null) ? trackId : "";
    onSuccess = (typeof onSuccess == "function") ? onSuccess : function(arguments) {};
    onError = (typeof onError == "function") ? onError : function(error) {};

    if(storage != null) {
        //console.log("Clearing cache");
        storage.clear(trackId, onSuccess, onError, arguments);
    }
};

/**
 * Property: OpenLayers.Control.CacheWrite.urlMap
 * {Object} Mapping of same origin urls to cache url keys. Entries will be
 *     deleted as soon as a tile was cached.
 */
mGtiMapModelCacheWrite.urlMap = {};