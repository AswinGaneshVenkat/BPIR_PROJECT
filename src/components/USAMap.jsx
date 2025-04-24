// src/components/USAMap.jsx
import React from 'react';
import Plot from 'react-plotly.js';

const USAMap = ({ data, dataKey, tooltipFields }) => {
  if (!data || data.length === 0) return null;

  const cityNames = data.map(d => d.City);
  const latitudes = data.map(d => parseFloat(d.Lat));
  const longitudes = data.map(d => parseFloat(d.Lon));
  const values = data.map(d => parseFloat((d[dataKey] || '').toString().replace(/,/g, '')));

  const text = data.map(d =>
    tooltipFields.map(f => `${f}: ${d[f]}`).join('<br>')
  );

  return (
    <Plot
      data={[{
        type: 'scattergeo',
        locationmode: 'USA-states',
        lat: latitudes,
        lon: longitudes,
        text,
        mode: 'markers',
        marker: {
          size: values.map(v => Math.sqrt(v) / 10),
          color: values,
          colorscale: 'Blues',
          colorbar: {
            title: dataKey.replace(/_/g, ' '),
          },
          line: {
            width: 0.5,
            color: 'white'
          },
        },
      }]}
      layout={{
        geo: {
          scope: 'usa',
          projection: { type: 'albers usa' },
          showland: true,
          landcolor: '#EAEAEA',
        },
        margin: { t: 0, b: 0, l: 0, r: 0 },
        height: 500,
      }}
      config={{ responsive: true }}
    />
  );
};

export default USAMap;
