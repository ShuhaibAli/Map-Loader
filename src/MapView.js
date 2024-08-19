import React, { useEffect, useRef, useState, useCallback } from 'react';
import 'ol/ol.css';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import VectorLayer from 'ol/layer/Vector';
import OSM from 'ol/source/OSM';
import VectorSource from 'ol/source/Vector';
import { fromLonLat, toLonLat } from 'ol/proj';
import GeoJSON from 'ol/format/GeoJSON';
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style';
import Overlay from 'ol/Overlay';
import './Popup.css';

const MapView = ({ geoJsonData, editGeoJsonData, currentMode, onAddIcon, clearUnsavedFeature }) => {
  const mapElement = useRef(null);
  const map = useRef(null);
  const editLayer = useRef(null);
  const popupContainer = useRef(null);
  const [unsavedFeature, setUnsavedFeature] = useState(null);
  const [dialogContent, setDialogContent] = useState(null);
  const [popupPosition, setPopupPosition] = useState([0, 0]);

  const handleMapClick = useCallback((event) => {
    if (currentMode === 'edit') {
      const coordinates = toLonLat(event.coordinate);
      const newFeature = onAddIcon(coordinates);
      if (unsavedFeature) {
        const editSource = editLayer.current.getSource();
        editSource.removeFeature(unsavedFeature);
      }
      setUnsavedFeature(newFeature);
    } else if (currentMode === 'view') {
      const features = map.current.getFeaturesAtPixel(event.pixel);
      if (features.length > 0) {
        const feature = features[0];
        if (feature.get('icon') === 'red-circle') {
          setDialogContent('Hello World');
          const coordinate = fromLonLat(feature.getGeometry().getCoordinates());
          setPopupPosition(coordinate);
        } else {
          setDialogContent(null);
        }
      } else {
        setDialogContent(null);
      }
    }
  }, [currentMode, onAddIcon, unsavedFeature]);

  useEffect(() => {
    if (!map.current && mapElement.current) {
      map.current = new Map({
        target: mapElement.current,
        layers: [
          new TileLayer({
            source: new OSM(),
          }),
        ],
        view: new View({
          center: fromLonLat([0, 0]),
          zoom: 2,
        }),
      });

      const overlay = new Overlay({
        element: popupContainer.current,
        positioning: 'bottom-center',
        stopEvent: false,
        offset: [0, -10],
      });
      map.current.addOverlay(overlay);
    }
  }, []);

  useEffect(() => {
    if (currentMode === 'edit') {
      map.current.on('click', handleMapClick);
    } else {
      map.current.un('click', handleMapClick);
      if (currentMode === 'view' && unsavedFeature) {
        const editSource = editLayer.current.getSource();
        editSource.removeFeature(unsavedFeature);
        setUnsavedFeature(null);
        clearUnsavedFeature();
      }
    }
  }, [currentMode, handleMapClick, unsavedFeature, clearUnsavedFeature]);

  useEffect(() => {
    if (geoJsonData && map.current) {
      const vectorSource = new VectorSource({
        features: new GeoJSON().readFeatures(geoJsonData, {
          featureProjection: 'EPSG:3857',
        }),
      });
      const vectorLayer = new VectorLayer({
        source: vectorSource,
      });
      map.current.addLayer(vectorLayer);
      map.current.getView().fit(vectorSource.getExtent(), { duration: 1000 });
    }
  }, [geoJsonData]);

  useEffect(() => {
    if (editGeoJsonData && map.current) {
      if (editLayer.current) {
        map.current.removeLayer(editLayer.current);
      }
      const editVectorSource = new VectorSource({
        features: new GeoJSON().readFeatures(editGeoJsonData, {
          featureProjection: 'EPSG:3857',
        }),
      });
      editLayer.current = new VectorLayer({
        source: editVectorSource,
        style: (feature) => {
          if (feature.get('icon') === 'red-circle') {
            return new Style({
              image: new CircleStyle({
                radius: 5,
                fill: new Fill({ color: 'red' }),
                stroke: new Stroke({ color: 'white', width: 1 }),
              }),
            });
          }
        },
      });
      map.current.addLayer(editLayer.current);
      map.current.getView().fit(editVectorSource.getExtent(), { duration: 1000 });
    }
  }, [editGeoJsonData]);

  return (
    <div>
      <div
        ref={mapElement}
        style={{ width: '1000px', height: '510px', backgroundColor: 'lightgray' }}
      />
      <div 
        ref={popupContainer} 
        className="ol-popup"
        style={{
          display: dialogContent ? 'block' : 'none',
          top: `${popupPosition[1]}px`,
          left: `${popupPosition[0]}px`,
        }}
      >
        <div className="popup-content">
          {dialogContent && <p>{dialogContent}</p>}
        </div>
      </div>
    </div>
  );
};

export default MapView;
