
$(document).ready(function() {

    const CITIES = [
      {name: "Los Angeles", latLng: [34.05, -118.27]},
      {name: "Seattle", latLng: [47.61, -122.34]},
      {name: "Denver", latLng: [39.73, -104.96]},
      {name: "NYC", latLng: [40.78, -73.96]},
      {name: "Miami", latLng: [25.79, -80.21]}
    ];
    
    const FULL_EXTENT = L.latLngBounds(
        $.map(CITIES, function(value){return L.latLng(value.latLng);})
    );
    
    var _map = L.map("map", {center: [40.78, -95], zoom: 2})
        .addLayer(L.esri.basemapLayer("Streets"))
        .fitBounds(FULL_EXTENT, getPadding());
        
    _map.zoomIn = function(){
        this.setView(
            calcOffsetCenter(this.getCenter(), this.getZoom()+1, getPadding()),
            this.getZoom()+1
        );
    };

    _map.zoomOut = function(){
        this.setView(
            calcOffsetCenter(this.getCenter(), this.getZoom()-1, getPadding()),
            this.getZoom()-1
        );
    };
    
    var _layerGroup = L.layerGroup().addTo(_map);
    
    $.each(
      CITIES,
      function(index, value) {    
        $("<li>")
          .append(
            $("<input>")
              .attr({
                "type": "checkbox", "name": "city", "id": "check"+index,
                "value": value.name, "checked": true
              })
              .change(function(){loadMarkers();})
              .data(value)
          )
          .append($("<label>").attr("for", "check"+index).text(value.name))
          .appendTo($("div#controls ul"));
      }
    );
    

    noUiSlider.create(
        $("div#slider").get(0), 
        {start: [100], range: {'min': 1,'max': 100}}
    )
    .on("change", function(){loadMarkers();});
    loadMarkers();
    
    $("input[id='opacity']").change(function(){loadMarkers();});
    $("button#seattle").click(
        function() {
            _map.flyToBounds(L.latLng([47.61, -122.34]).toBounds(100000), getPadding());
        }
    );

    function loadMarkers()
    {
      _layerGroup.clearLayers();
      $.each(
        $.map(
          $.grep(
              $("input[type=checkbox]"), 
              function(value) {return $(value).prop("checked");}
          ),
          function(value) {return $(value).data();}
        ),  
        function(index, value) {
          var marker = L.marker(value.latLng)
            .addTo(_layerGroup)
            .bindPopup(value.name,{closeButton: false})
            .bindTooltip(value.name)
            .on("click", function(){$(".leaflet-tooltip").remove();});
          marker.properties = value;  
          marker.setOpacity(slider.noUiSlider.get(0)/100);
        }
      );
    }
    
    function calcOffsetCenter(center, targetZoom, paddingOptions)
    {
        var targetPoint = _map.project(center, targetZoom);
        if (targetZoom < _map.getZoom()) {
            targetPoint = targetPoint.subtract([
                (paddingOptions.paddingTopLeft[0] - paddingOptions.paddingBottomRight[0])/4,
                (paddingOptions.paddingTopLeft[1] - paddingOptions.paddingBottomRight[1])/4
            ]);
        } else {                
            targetPoint = targetPoint.add([
                (paddingOptions.paddingTopLeft[0] - paddingOptions.paddingBottomRight[0])/2,
                (paddingOptions.paddingTopLeft[1] - paddingOptions.paddingBottomRight[1])/2
            ]);
        }
        return _map.unproject(targetPoint, targetZoom);
    }    
    
    function getPadding()
    {
        return {
            paddingTopLeft: [
                $("div#controls").outerWidth() + $("div#controls").position().left,
                0
            ], 
            paddingBottomRight: [0,0]
        };
    }
    
});