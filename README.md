# map-activity-center-esri-leaflet
A sample that represents map activity common to many applications I develop.

https://leebock.github.io/map-activity-center-esri-leaflet/

Common tasks include:

* Selectively turning a feature on / off (or adding to / removing it from the map).
* Selectively changing the opacity / symbology of a feature.
* Presenting a **compact** popup, either:
  * in response to clicking on the feature, or
  * programmatically
* Showing tooltip for a feature on mouseover.
* Fitting the map at a specific extent while accounting for offsets due to UI elements on top of the map.
* Executing zoom in and out (using the +/- buttons) such that offsets are accounted for.

Additionally, it's important that the map library plays well with other 3rd party libraries.  To illustrate this, I threw in a gratuitous slider widget. 
  
