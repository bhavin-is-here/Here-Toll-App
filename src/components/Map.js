
import React, { useEffect, useRef } from "react";

const Map = ({ polyline, tollbooths = [] }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null); // To store the map instance
  const polylineLayer = useRef(null); // To store the polyline layer
  const tollboothMarkers = useRef([]); // To store tollbooth markers

  useEffect(() => {
    const H = window.H;

    if (mapRef.current && !mapInstance.current) {
      const platform = new H.service.Platform({
        apikey: "18I6Z4D0vtembHHD7PiPnrRb8o7P-8Vu-Hot2FoSHaQ",
      });
      const engineType = H.Map.EngineType["HARP"];

      const defaultLayers = platform.createDefaultLayers({ engineType });
      const map = new H.Map(mapRef.current, defaultLayers.vector.normal.map, {
        engineType,
        center: { lat: 0, lng: 0 },
        zoom: 2.5,
        pixelRatio: window.devicePixelRatio || 1,
      });

      // Add UI controls
      const ui = H.ui.UI.createDefault(map, defaultLayers);
      ui.removeControl("scalebar");

      // Restrict zoom level
      map.addEventListener("mapviewchange", () => {
        const zoom = map.getZoom();
        if (zoom < 2.5) {
          map.setZoom(2.5);
        }
      });

      // Enable map interaction
      const mapEvents = new H.mapevents.MapEvents(map);
      new H.mapevents.Behavior(mapEvents);

      mapInstance.current = map;

      // Cleanup function
      return () => {
        map.dispose();
        mapInstance.current = null;
        polylineLayer.current = null;
        tollboothMarkers.current.forEach((marker) => map.removeObject(marker));
        tollboothMarkers.current = [];
      };
    }
  }, []);

  useEffect(() => {
    if (polyline && mapInstance.current) {
      const H = window.H;

      // Decode the polyline into a series of geographic points
      const decodedPolyline = H.geo.LineString.fromFlexiblePolyline(polyline);

      // If there is an existing polyline layer, remove it
      if (polylineLayer.current) {
        mapInstance.current.removeObject(polylineLayer.current);
      }

      // Create a polyline and add it to the map
      const routeLine = new H.map.Polyline(decodedPolyline, {
        style: { lineWidth: 4, strokeColor: "blue" },
      });
      polylineLayer.current = routeLine;
      mapInstance.current.addObject(routeLine);

      // Adjust the map viewport to fit the polyline
      mapInstance.current.getViewModel().setLookAtData({
        bounds: routeLine.getBoundingBox(),
      });

      // Add markers at the start and end of the polyline
      const points = decodedPolyline.getLatLngAltArray();
      if (points.length > 0) {
        const startCoords = { lat: points[0], lng: points[1] };
        const endCoords = { lat: points[points.length - 3], lng: points[points.length - 2] };

        // Remove existing markers (optional cleanup)
        if (polylineLayer.current.startMarker) {
          mapInstance.current.removeObject(polylineLayer.current.startMarker);
        }
        if (polylineLayer.current.endMarker) {
          mapInstance.current.removeObject(polylineLayer.current.endMarker);
        }

        // Create markers
        const startMarker = new H.map.Marker(startCoords);
        const endMarker = new H.map.Marker(endCoords);

        // Add markers to the map
        mapInstance.current.addObject(startMarker);
        mapInstance.current.addObject(endMarker);

        // Store markers for cleanup
        polylineLayer.current.startMarker = startMarker;
        polylineLayer.current.endMarker = endMarker;
      }
    }
  }, [polyline]); // Update when polyline changes

  useEffect(() => {
    if (mapInstance.current) {
      const H = window.H;

      // Remove old tollbooth markers
      tollboothMarkers.current.forEach((marker) => mapInstance.current.removeObject(marker));
      tollboothMarkers.current = [];

      // Add tollbooth markers
      tollbooths.forEach((tollbooth) => {
        const marker = new H.map.Marker({ lat: tollbooth.lat, lng: tollbooth.lng });
        mapInstance.current.addObject(marker);
        tollboothMarkers.current.push(marker);
      });
    }
  }, [tollbooths]); // Update when tollbooths change

  return <div ref={mapRef} style={{ width: "100%", height: "100vh", position: "relative" }} />;
};

export default Map;




