import React from "react";
import { loadModules } from "esri-loader";
import { setDefaultOptions } from "esri-loader";
import "./App.css";

setDefaultOptions({ version: "next" });

export class App extends React.Component {
  constructor(props) {
    super(props);
    this.mapRef = React.createRef();
  }

  componentDidMount() {
    // lazy load the required ArcGIS API for JavaScript modules and CSS
    loadModules(
      [
        "esri/Map",
        "esri/layers/GeoJSONLayer",
        "esri/views/MapView",
        "esri/layers/support/FeatureReductionCluster",
      ],
      { css: true }
    ).then(([ArcGISMap, GeoJSONLayer, MapView, FeatureReductionCluster]) => {
      const url =
        "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";

      const template = {
        title: "Earthquake Info",
        content: "Magnitude {mag} {type} hit {place} on {time}",
        fieldInfos: [
          {
            fieldName: "time",
            format: {
              dateFormat: "short-date-short-time",
            },
          },
        ],
      };

      const renderer = {
        type: "simple",
        field: "mag",
        symbol: {
          type: "simple-marker",
          color: "red",
          outline: {
            color: "white",
          },
        },
        visualVariables: [
          {
            type: "size",
            field: "mag",
            stops: [
              {
                value: 2.5,
                size: "10px",
              },
              {
                value: 8,
                size: "40px",
              },
            ],
          },
        ],
      };

      const geojsonFeatureReduction = {
        type: "cluster",
        clusterRadius: "100px",
        clusterMinSize: "80px",
        clusterMaxSize: "120px",
        labelingInfo: [
          {
            deconflictionStrategy: "none",
            labelExpressionInfo: {
              expression: "Text($feature.cluster_count, '#,###')",
            },
            symbol: {
              type: "text",
              color: "#ffffff",
              font: {
                weight: "bold",
                family: "Noto Sans",
                size: "12px",
              },
            },
            labelPlacement: "above-right",
          },
        ],

        popupTemplate: {
          content: [
            {
              type: "text",
              text: "This cluster represents <b>{cluster_count}</b> features.",
            },
            {
              type: "fields",
              fieldInfos: [
                {
                  fieldName: "cluster_avg_mag",
                  label: "Average magnitude",
                  format: {
                    digitSeparator: true,
                    places: 2,
                  },
                },
              ],
            },
          ],
        },
      };
      const geojsonLayer = new GeoJSONLayer({
        url: url,
        copyright: "USGS Earthquakes",
        popupTemplate: template,
        renderer: renderer, //optional
        featureReduction: geojsonFeatureReduction,
      });

      const map = new ArcGISMap({
        basemap: "dark-gray",
        layers: [geojsonLayer],
      });

      this.view = new MapView({
        container: this.mapRef.current,
        map: map,
        center: [-168, 46],
        zoom: 3,
      });
    });
  }

  componentWillUnmount() {
    if (this.view) {
      // destroy the map view
      this.view.container = null;
    }
  }

  render() {
    return <div className="mapView" ref={this.mapRef} />;
  }
}

export default App;
