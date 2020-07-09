(function () {

	"use strict";

    $(document).ready(function() {

        const CITIES = [
          {name: "L.A.", latLng: [34.05, -118.27]},
          {name: "Seattle", latLng: [47.61, -122.34]},
          {name: "Denver", latLng: [39.73, -104.96]},
          {name: "NYC", latLng: [40.78, -73.96]},
          {name: "Miami", latLng: [25.79, -80.21]}
        ];
        
        // build out UI (this part should be map library independent)
		
		var _table = $(new Table($("div#controls ul").get(0)))
		   .on("itemActivate", table_onItemActivate)
		   .on("itemHide", table_onItemHide)
		   .get(0);		
		
		_table.load($.map(CITIES, function(value){return {record: value, html: value.name};}));

		$("button#rate").click(
			function() {
				$("div#modal").css("display", "flex");
				$("div.noUi-handle.noUi-handle-lower").focus();
			}
		);
		$("div#modal button#cancel").click(function(){$("div#modal").css("display", "none");});
		$("div#modal button#apply").click(
			function(){
				$("div#modal").css("display", "none");
				$("button#rate").empty();
				for (var i=0; i<parseInt(slider.noUiSlider.get(0)); i++) {
					$("button#rate").append($("<div>").addClass("octopus"));
				}
			}
		);
		        
        noUiSlider.create(
            $("div#slider").get(0), 
            {start: [1], range: {'min': 1,'max': 5}, step: 1}
        );    
		for (var i=0; i < slider.noUiSlider.options.range.max; i++) {
			$("div#octopodes").append($("<img>").attr("src", "resources/octopus.png"));
		}
		$("div#octopodes img:nth-of-type(1)").show();
        slider.noUiSlider.on(
            "slide", 
            function(values){
				$.each(
					$("div#octopodes img"),
					function(index, value) {
						$(value).css("display", index < parseInt(values[0]) ? "block" : "none");
					}
				);
			}
        );

        /********** All map specific stuff below this line *****************/

        // create map

        var _map = L.map(
                "map", 
                {center: [40, -95], zoom: 2, zoomControl: false, attributionControl: false}
            )
            .addLayer(L.esri.basemapLayer("Streets"))
            .addControl(L.control.zoom({position: "topright"}))
            .addControl(L.control.attribution({position: "bottomleft"}))
			.on("click", map_onClick);
            
        // override the methods called when zoom control buttons are clicked.  doing this
        // in order to account for padding due to absolutely positioned div#controls

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

        // load markers
        
        var _layerMarkers = L.featureGroup().addTo(_map).on("click", marker_onClick);
        loadMarkers();

        // zoom to initial extent

        L.easyButton({
            states:[
                {
                    icon: "fa fa-home",
                    onClick: function(btn, map){
                        _map.fitBounds(_layerMarkers.getBounds(), getPadding());
                    },
                    title: "Full extent"
                }
            ],
            position: "topright"
        }).addTo(_map);			        
        _map.fitBounds(_layerMarkers.getBounds(), getPadding());
        
		function map_onClick()
		{
			_table.clearActive();
			loadMarkers();
			_map.fitBounds(_layerMarkers.getBounds(), getPadding());
		}
		
		function marker_onClick(e)
		{
			var data = e.layer.properties;
			$(".leaflet-tooltip").remove();			
			_table.activate(data);
			loadMarkers();
			_map.flyToBounds(
				L.latLng(data.latLng).toBounds(2000000), 
				getPadding()
			);
			$.grep(
				_layerMarkers.getLayers(), 
				function(layer){return layer.properties === data;}
			).shift().openPopup();
		}
		
        // table event handlers

        function table_onItemActivate(event, data, reset) {
            loadMarkers();
            if (reset) {
                _map.fitBounds(_layerMarkers.getBounds(), getPadding());
            } else {
                _map.flyToBounds(
                    L.latLng(data.latLng).toBounds(2000000), 
                    getPadding()
                );
                $.grep(
                    _layerMarkers.getLayers(), 
                    function(layer){return layer.properties === data;}
                ).shift().openPopup();
            }            
        }
        
        function table_onItemHide(event) {
            loadMarkers();
            if (_table.getVisibleRecords().length === 1) {
				var data = _table.getVisibleRecords().shift();
                _map.flyToBounds(
                    L.latLng(data.latLng).toBounds(2000000), 
                    getPadding()
                );
            } else {
                _map.fitBounds(_layerMarkers.getBounds(), getPadding());
            }
        }

        /************************** Functions ****************************/
        
        function loadMarkers()
        {
            _layerMarkers.clearLayers();
            $.each(
                _table.getVisibleRecords(),
                function(index, data) {
                    var marker = L.marker(data.latLng)
                        .addTo(_layerMarkers)
                        .bindPopup(data.name,{closeButton: false})
                        .bindTooltip(data.name);
                    marker.properties = data;  
                    if (_table.getActive() && data !== _table.getActive()) {
						marker.setOpacity(0.5);
					}
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
        
        // helper function    
        
        function getPadding()
        {
            return {
                paddingTopLeft: [
                    $("div#controls").outerWidth() + parseInt($("div#controls").position().left),
                    24
                ], 
                paddingBottomRight: [
                    40,
                    $("div#map").outerHeight() - $("button#rate").position().top
                ]
            };
        }
        
    });

})();