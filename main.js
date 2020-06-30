
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
        .fitBounds(FULL_EXTENT, {paddingTopLeft: [275,0]});
    var _layerGroup = L.layerGroup().addTo(_map);
    
    $.each(
      CITIES,
      function(index, value) {    
        $("<li>")
          .append(
            $("<input>")
              .attr({
                "type": "checkbox", 
                "name": "city", "id": 
                "check"+index, 
                "value": value.name, 
                "checked": true
              })
              .change(function(){loadMarkers();})
              .data(value)
          )
          .append(
            $("<label>")
              .attr("for", "check"+index)
              .text(value.name)
          )
          .appendTo($("div#controls ul"));
      }
    );
    
    loadMarkers();
    
    $("input[id='opacity']").change(function(){loadMarkers();});

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
          marker.setOpacity($("input[id='opacity']").val()/100);
        }
      );
    }
    
});