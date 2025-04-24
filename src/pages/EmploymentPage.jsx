// src/pages/EmploymentPage.jsx
import React, { useState, useMemo } from 'react';
import Plot from 'react-plotly.js';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Tooltip,
  Select,
  MenuItem,
  Card,
  CardContent
} from '@mui/material';
import { useData } from '../context/DataContext';
import cityCoordinates from '../data/cityCoordinates.json';

const EmploymentPage = () => {
  const { employmentByCompany, targetOccupations, employmentByCity } = useData();
  const [occupationFilter, setOccupationFilter] = useState('growth');
  const [companyView, setCompanyView] = useState('top20');
  const [mapMetric, setMapMetric] = useState('Total_Postings_2022_2023');

  const parseNumber = (val) => typeof val === 'string' ? parseFloat(val.replace(/[$,%]/g, '').replace(/,/g, '')) : val;

  const topCompany = useMemo(() => {
    if (!employmentByCompany) return {};
    return employmentByCompany.reduce((top, item) => {
      const total = parseNumber(item.Total_Postings_2022_2023);
      return total > parseNumber(top?.Total_Postings_2022_2023 || 0) ? item : top;
    }, {});
  }, [employmentByCompany]);

  const topOccupationByJobs = useMemo(() => {
    if (!targetOccupations) return {};
    return targetOccupations.reduce((top, item) => {
      const jobs = parseNumber(item.Jobs_2022);
      return jobs > parseNumber(top?.Jobs_2022 || 0) ? item : top;
    }, {});
  }, [targetOccupations]);

  const topOccupationByGrowth = useMemo(() => {
    if (!targetOccupations) return {};
    return targetOccupations.reduce((top, item) => {
      const growth = parseNumber(item.Growth_2022_2024);
      return growth > parseNumber(top?.Growth_2022_2024 || 0) ? item : top;
    }, {});
  }, [targetOccupations]);

  const topCityByUnique = useMemo(() => {
    if (!employmentByCity) return {};
    return employmentByCity.reduce((top, item) => {
      const unique = parseNumber(item.Unique_Postings_2022_2023);
      return unique > parseNumber(top?.Unique_Postings_2022_2023 || 0) ? item : top;
    }, {});
  }, [employmentByCity]);

  const topCityByTotal = useMemo(() => {
    if (!employmentByCity) return {};
    return employmentByCity.reduce((top, item) => {
      const total = parseNumber(item.Total_Postings_2022_2023);
      return total > parseNumber(top?.Total_Postings_2022_2023 || 0) ? item : top;
    }, {});
  }, [employmentByCity]);

  const topCompaniesBarData = useMemo(() => {
    if (!employmentByCompany) return { data: [], layout: {} };
    const sorted = [...employmentByCompany].sort((a, b) => parseNumber(b.Total_Postings_2022_2023) - parseNumber(a.Total_Postings_2022_2023));
    const companies = companyView === 'bottom20' ? sorted.slice(-20).reverse() : sorted.slice(0, 20);
    return {
      data: [
        {
          x: companies.map(c => c.Company),
          y: companies.map(c => parseNumber(c.Total_Postings_2022_2023)),
          customdata: companies.map(c => [c.Median_Posting_Duration]),
          hovertemplate:
            '<b>%{x}</b><br>' +
            'Total Postings: %{y:,}<br>' +
            'Median Duration: %{customdata[0]}<extra></extra>',
          name: 'Total Postings',
          type: 'bar',
          marker: { color: '#1976d2' }
        },
        {
          x: companies.map(c => c.Company),
          y: companies.map(c => parseNumber(c.Unique_Postings_2022_2023)),
          customdata: companies.map(c => [c.Median_Posting_Duration]),
          hovertemplate:
            '<b>%{x}</b><br>' +
            'Unique Postings: %{y:,}<br>' +
            'Median Duration: %{customdata[0]}<extra></extra>',
          name: 'Unique Postings',
          type: 'bar',
          marker: { color: '#ffa000' }
        }
      ],
      layout: {
        barmode: 'group',
        xaxis: { title: 'Company', tickangle: -45 },
        yaxis: { title: 'Postings Count' },
        height: 500,
        margin: { t: 30, l: 60, r: 30, b: 120 }
      }
    };
  }, [employmentByCompany, companyView]);

  const occupationBubbleData = useMemo(() => {
    if (!targetOccupations) return { data: [], layout: {} };
    let filtered = [...targetOccupations];
    if (occupationFilter === 'growth') {
      filtered = filtered
        .filter(o => !isNaN(parseNumber(o.Growth_2022_2024)) && !isNaN(parseNumber(o.Median_Earnings)) && !isNaN(parseNumber(o.Annual_Openings)))
        .map(o => ({ ...o, _growth: parseNumber(o.Growth_2022_2024) }))
        .sort((a, b) => b._growth - a._growth)
        .slice(0, 20);
    } else if (occupationFilter === 'jobs') {
      filtered = filtered
        .map(o => ({ ...o, _jobs: parseNumber(o.Jobs_2022) }))
        .sort((a, b) => b._jobs - a._jobs)
        .slice(0, 20);
    }
    const maxOpenings = Math.max(...filtered.map(o => parseNumber(o.Annual_Openings)));
    const chartData = [...filtered].sort((a, b) => parseNumber(b.Growth_2022_2024) - parseNumber(a.Growth_2022_2024));
    return {
      data: [
        {
          x: filtered.map(o => parseNumber(o.Median_Earnings)),
          y: filtered.map(o => parseNumber(o.Growth_2022_2024) / 100),
          text: filtered.map(o => `${o.Occupation}<br>Median Earnings: $${o.Median_Earnings}<br>Growth: ${o.Growth_2022_2024}%<br>Openings: ${o.Annual_Openings}`),
          mode: 'markers',
          marker: {
            size: filtered.map(o => (
              occupationFilter === 'jobs'
                ? (parseNumber(o.Annual_Openings) / maxOpenings) * 40 + 10
                : (parseNumber(o.Growth_2022_2024) / 100) * 60 + 10 // fixed size for growth-based view
            )),
            color: filtered.map(o => parseNumber(o.Growth_2022_2024)),
            colorscale: 'Viridis',
            showscale: false
          },
          hoverinfo: 'text',
          type: 'scatter'
        }
      ],
      layout: {
        xaxis: {
          title: 'Median Earnings ($ per Hour)',
          tickprefix: '$',
          zeroline: true,
          zerolinecolor: '#999',
          showline: true,
          linecolor: '#333',
          linewidth: 1
        },
        yaxis: {
          title: 'Projected Growth Rate (2022–2024)',
          tickformat: ',.0%',
          zeroline: true,
          zerolinecolor: '#999',
          showline: true,
          linecolor: '#333',
          linewidth: 1
        },
        height: 650,
        margin: { t: 40, l: 60, r: 30, b: 60 }
      }
    };
  }, [targetOccupations, occupationFilter]);

  const mapData = useMemo(() => [
    {
      type: 'scattergeo',
      locationmode: 'USA-states',
      lat: employmentByCity.map(c => cityCoordinates[c.City]?.lat),
      lon: employmentByCity.map(c => cityCoordinates[c.City]?.lon),
      text: employmentByCity.map(c => `${c.City}`),
      marker: {
        size: employmentByCity.map(c => Math.sqrt(parseNumber(c[mapMetric])) / 10),
        color: 'rgba(30, 144, 255, 0.6)',
        line: { width: 1, color: 'rgb(40,40,40)' },
      },
      mode: 'markers+text',
      hovertemplate:
        '<b>%{customdata[0]}</b><br>' +
        '%{customdata[1]}<br>' +
        '%{customdata[2]}<br>' +
        '%{customdata[3]}<extra></extra>',
      customdata: employmentByCity.map(c => [
        `City: ${c.City}`,
        `Total Postings: ${c.Total_Postings_2022_2023}`,
        `Unique Postings: ${c.Unique_Postings_2022_2023}`,
        `Median Duration: ${c.Median_Posting_Duration}`
      ]),
      text: employmentByCity.map(c => c.City.split(',')[1]?.trim()),
      textposition: 'top center'
    }
  ], [employmentByCity, mapMetric]);

  return (
    <Box sx={{ px: 3, pt: 2, pb: 4, background: '#f9f9f9' }}>
      <Typography variant="h4" fontWeight="bold" align="center" sx={{ mb: 3 }}>
        Employment Overview
      </Typography>

      {/* Summary Cards */}
      <Paper elevation={2} sx={{ p: 3, mb: 4 }}>
        <Grid container spacing={3} justifyContent="center">
          <Grid item xs={12} md={4}>
            <Tooltip title={<Box><div><strong>Top Company:</strong> {topCompany?.Company || 'N/A'}</div><div><strong>Total Postings:</strong> {topCompany?.Total_Postings_2022_2023 || 0}</div><div><strong>Unique Postings:</strong> {topCompany?.Unique_Postings_2022_2023 || 0}</div><div><strong>Median Duration:</strong> {topCompany?.Median_Posting_Duration || 'N/A'}</div></Box>}>
              <Card><CardContent sx={{ textAlign: 'center' }}><Typography variant="subtitle1" fontWeight={600} color="text.secondary">Total Companies Posted</Typography><Typography variant="h3" fontWeight="bold" color="primary">{employmentByCompany?.length || 0}</Typography></CardContent></Card>
            </Tooltip>
          </Grid>

          <Grid item xs={12} md={4}>
            <Tooltip title={<Box><div><strong>Top Occupation by Jobs:</strong> {topOccupationByJobs?.Occupation || 'N/A'}</div><div><strong>Openings:</strong> {topOccupationByJobs?.Annual_Openings || 0}</div><div><strong>Top by Growth:</strong> {topOccupationByGrowth?.Occupation || 'N/A'}</div><div><strong>Growth Rate:</strong> {topOccupationByGrowth?.Growth_2022_2024 || 0}%</div></Box>}>
              <Card><CardContent sx={{ textAlign: 'center' }}><Typography variant="subtitle1" fontWeight={600} color="text.secondary">Total Unique Occupations</Typography><Typography variant="h3" fontWeight="bold" color="success.main">{targetOccupations?.length || 0}</Typography></CardContent></Card>
            </Tooltip>
          </Grid>

          <Grid item xs={12} md={4}>
            <Tooltip title={<Box><div><strong>Top City by Unique:</strong> {topCityByUnique?.City || 'N/A'}</div><div><strong>Unique Postings:</strong> {topCityByUnique?.Unique_Postings_2022_2023 || 0}</div><div><strong>Top City by Total:</strong> {topCityByTotal?.City || 'N/A'}</div><div><strong>Total Postings:</strong> {topCityByTotal?.Total_Postings_2022_2023 || 0}</div></Box>}>
              <Card><CardContent sx={{ textAlign: 'center' }}><Typography variant="subtitle1" fontWeight={600} color="text.secondary">Total Cities with Job Postings</Typography><Typography variant="h3" fontWeight="bold" color="warning.main">{employmentByCity?.length || 0}</Typography></CardContent></Card>
            </Tooltip>
          </Grid>
        </Grid>
      </Paper>

      {/* Company Bar Chart */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" sx={{ flexGrow: 1, textAlign: 'center' }}>
            Top & Bottom 20 Companies by Job Postings
          </Typography>
          <Select value={companyView} onChange={(e) => setCompanyView(e.target.value)} size="small">
            <MenuItem value="top20">Top 20</MenuItem>
            <MenuItem value="bottom20">Bottom 20</MenuItem>
          </Select>
        </Box>
        <Plot data={topCompaniesBarData.data} layout={topCompaniesBarData.layout} config={{ responsive: true }} style={{ width: '100%' }} />
      </Paper>

      {/* Occupation Bubble Chart */}
      <Paper elevation={3} sx={{ p: 3, mb: 4 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" sx={{ flexGrow: 1, textAlign: 'center' }}>
            In-Demand Occupations Growth Percent vs Median Earnings
          </Typography>
          <Select value={occupationFilter} onChange={(e) => setOccupationFilter(e.target.value)} size="small">
            <MenuItem value="growth">Top by Growth</MenuItem>
            <MenuItem value="jobs">Top by Jobs</MenuItem>
            <MenuItem value="all">All</MenuItem>
          </Select>
        </Box>
        <Plot data={occupationBubbleData.data} layout={occupationBubbleData.layout} config={{ responsive: true }} style={{ width: '100%' }} />
      </Paper>

      {/* Job Postings Map */}
      <Paper elevation={3} sx={{ p: 3, mb: 4, height: '750px' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h6" fontWeight="bold" align="center" sx={{ flex: 1 }}>
            Top Cities by Job Postings
          </Typography>
          <Select
            value={mapMetric}
            onChange={(e) => setMapMetric(e.target.value)}
            size="small"
            sx={{ ml: 2 }}
          >
            <MenuItem value="Total_Postings_2022_2023">Total Postings</MenuItem>
            <MenuItem value="Unique_Postings_2022_2023">Unique Postings</MenuItem>
          </Select>
        </Box>
        <Plot
          data={mapData}
          layout={{
            geo: {
              scope: 'usa',
              projection: { type: 'albers usa' },
              showland: true,
              landcolor: 'rgb(250,250,250)',
              subunitcolor: 'rgb(100,100,100)',
              countrycolor: 'rgb(100,100,100)',
              showlakes: true,
              lakecolor: 'rgb(230,245,255)',
              showcountries: true
            },
            margin: { t: 0, r: 0, l: 0, b: 0 },
            height: 650,
            autosize: true,
            showlegend: false
          }}
          config={{ responsive: true }}
          style={{ height: '100%', width: '100%' }}
        />
      </Paper>
    </Box>
  );
};

export default EmploymentPage;
