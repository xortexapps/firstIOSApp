var mGtiMapViewHeading = Backbone.View.extend({

  render: function() {
    var heading = this.model.get("heading");
    var transform = "rotate(" + heading + "deg)";
    this.el.style.WebkitTransform = transform;
    this.el.style.MozTransform = transform;

    this.el.style.MozTransformOrigin = 'center';
    this.el.style.WebkitTransformOrigin = 'center';
    return this;
  }

});