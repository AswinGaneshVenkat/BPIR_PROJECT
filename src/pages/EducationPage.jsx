// src/pages/EducationPage.jsx
import React, { useState, useMemo } from 'react';
import Plot from 'react-plotly.js';
import {
  Grid,
  Paper,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Select,
  MenuItem,
  Box,
  Tooltip,
  Card,
  CardContent
} from '@mui/material';
import { useData } from '../context/DataContext';

const EducationPage = () => {
  const { completionsByAwardLevel, completionsByInstitution } = useData();

  const [selectedAwardLevels, setSelectedAwardLevels] = useState(
    completionsByAwardLevel?.map(item => item["Award Level"]) || []
  );
  const [marketShareView, setMarketShareView] = useState('top10');
  const [growthView, setGrowthView] = useState('top10');
  const [sortBy, setSortBy] = useState('Completions');

  const parseSafeInt = (val) => typeof val === 'string' ? parseInt(val.replace(/[^0-9]/g, '')) : val;
  const parseSafeFloat = (val) => typeof val === 'string' ? parseFloat(val.replace(/[,%]/g, '')) : val;

  const totalInstitutions = completionsByInstitution?.length || 0;
  const totalCompletions = useMemo(() => {
    return completionsByInstitution?.reduce((sum, item) => {
      const completions = parseSafeInt(item.Completions_2022);
      return sum + (isNaN(completions) ? 0 : completions);
    }, 0) || 0;
  }, [completionsByInstitution]);

  const averageTuition = useMemo(() => {
    if (!completionsByInstitution) return 0;
    const total = completionsByInstitution.reduce((sum, item) => {
      const tuition = parseSafeInt(item.IPEDS_Tuition_Fees_2022);
      return sum + (isNaN(tuition) ? 0 : tuition);
    }, 0);
    return total / completionsByInstitution.length;
  }, [completionsByInstitution]);

  const completionsData = useMemo(() => {
    if (!completionsByInstitution) return [];
    const sorted = [...completionsByInstitution].sort((a, b) => {
      return sortBy === 'Tuition'
        ? parseSafeInt(b.IPEDS_Tuition_Fees_2022) - parseSafeInt(a.IPEDS_Tuition_Fees_2022)
        : parseSafeInt(b.Completions_2022) - parseSafeInt(a.Completions_2022);
    });
    return sorted.slice(0, 10);
  }, [completionsByInstitution, sortBy]);

  const donutChartData = useMemo(() => {
    if (!completionsByAwardLevel) return { data: [], layout: {} };
    const filteredData = completionsByAwardLevel
      .filter(item => selectedAwardLevels.includes(item["Award Level"]))
      .map(item => ({
        label: item["Award Level"],
        value: parseSafeFloat(item.Completions_2022),
        percent: parseSafeFloat(item.Completions_Percent)
      }));
    const total = filteredData.reduce((sum, item) => sum + item.value, 0);
    return {
      data: [
        {
          values: filteredData.map(item => item.value),
          labels: filteredData.map(item => item.label),
          type: 'pie',
          hole: 0.6,
          textinfo: 'none',
          hovertemplate: '<b>%{label}</b><br><b>Completions:</b> %{value:,}<br><b>Percentage:</b> %{percent:.1f}%<extra></extra>',
          showlegend: true
        }
      ],
      layout: {
        annotations: [{
          font: { size: 20 },
          showarrow: false,
          text: total.toLocaleString(),
          x: 0.5,
          y: 0.5
        }],
        height: 500,
        margin: { t: 30, b: 30, l: 30, r: 30 },
        showlegend: true
      }
    };
  }, [completionsByAwardLevel, selectedAwardLevels]);

  const marketShareData = useMemo(() => {
    if (!completionsByInstitution) return [];
    const sorted = [...completionsByInstitution].sort((a, b) => parseSafeFloat(a.Market_Share_2022) - parseSafeFloat(b.Market_Share_2022));
    return marketShareView === 'top10' ? sorted.slice(-10) : sorted.slice(0, 10);
  }, [completionsByInstitution, marketShareView]);

  const growthData = useMemo(() => {
    if (!completionsByInstitution) return [];
    const valid = completionsByInstitution.filter(item => item.GrowthPercent_YOY_2022 !== 'Insf. Data');
    const sorted = [...valid].sort((a, b) => parseSafeFloat(a.GrowthPercent_YOY_2022) - parseSafeFloat(b.GrowthPercent_YOY_2022));
    return growthView === 'top10' ? sorted.slice(-10) : sorted.slice(0, 10);
  }, [completionsByInstitution, growthView]);

  const chartLayout = (title) => ({
    autosize: true,
    height: 600,
    margin: { l: 350, r: 50, t: 30, b: 50 },
    xaxis: {
      title,
      automargin: true,
      tickfont: { size: 11 }
    },
    plot_bgcolor: 'white',
    paper_bgcolor: 'white'
  });

return (
  <Box sx={{ px: 3, py: 2 }}>
    <Typography variant="h4" align="center" sx={{ mb: 4, fontWeight: 'bold' }}>
      Education Completion Trends
    </Typography>

    <Grid container spacing={2} sx={{ mb: 3 }}>
      {[{
        title: 'Total Institutions',
        value: totalInstitutions,
        color: '#1976d2',
        tooltip: (
          <div>
            <div><strong>Top Institution by Completions:</strong><br />University of Florida</div>
            <div style={{ marginTop: 8 }}><strong>Top Market Share Holder:</strong><br />University of Florida</div>
          </div>
        )
      }, {
        title: 'Average Tuition',
        value: `$${averageTuition.toFixed(2)}`,
        color: '#2e7d32',
        tooltip: (
          <div>
            <div><strong>Median Tuition:</strong> $14,267.91</div>
            <div>Tuition Range: $6,381 – $23,970</div>
            <div>Highest Tuition: William & Mary ($23,970)</div>
            <div>Lowest Tuition: University of Florida ($6,381)</div>
          </div>
        )
      }, {
        title: 'Total Completions',
        value: totalCompletions.toLocaleString(),
        color: '#ef6c00',
        tooltip: (
          <div>
            <div><strong>Most Popular Award Level:</strong><br />Bachelor's Degree (186,986 completions)</div>
          </div>
        )
      }].map((card, idx) => (
        <Grid key={idx} item xs={12} md={4}>
          <Tooltip title={card.tooltip} arrow placement="top">
            <Card sx={{ p: 3, textAlign: 'center' }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight="bold">{card.title}</Typography>
                <Typography variant="h4" sx={{ color: card.color, fontWeight: 'bold' }}>{card.value}</Typography>
              </CardContent>
            </Card>
          </Tooltip>
        </Grid>
      ))}
    </Grid>

    {[{
      title: 'Institution-wise Market Share (2022)',
      data: marketShareData.map(i => ({ y: i.Institution, x: parseSafeFloat(i.Market_Share_2022), suffix: '%' })),
      color: '#4caf50',
      select: marketShareView,
      onSelect: setMarketShareView
    }, {
      title: 'Top & Bottom 10 Institutions by Growth Percent (2022)',
      data: growthData.map(i => ({ y: i.Institution, x: parseSafeFloat(i.GrowthPercent_YOY_2022), suffix: '%' })),
      color: '#ff9800',
      select: growthView,
      onSelect: setGrowthView
    }].map((section, idx) => (
      <Grid key={idx} item xs={12}>
        <Paper sx={{ p: 2 }}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" sx={{ fontWeight: 'bold', flex: 1, textAlign: 'center' }}>{section.title}</Typography>
            <Select value={section.select} onChange={(e) => section.onSelect(e.target.value)} size="small">
              <MenuItem value="top10">Top 10</MenuItem>
              <MenuItem value="bottom10">Bottom 10</MenuItem>
            </Select>
          </Box>
          <Plot
            data={[{
              y: section.data.map(d => d.y),
              x: section.data.map(d => d.x),
              type: idx === 1 ? 'scatter' : 'bar',
              mode: idx === 1 ? 'lines+markers+text' : undefined,
              orientation: 'h',
              marker: { color: section.color },
              text: section.data.map(d => `${d.x.toFixed(2)}${d.suffix}`),
              textposition: 'outside',
              hovertemplate: `<b>%{y}</b><br><b>${section.title.includes('Growth') ? 'Growth' : 'Market Share'}:</b> %{x}${section.data[0].suffix}<extra></extra>`
            }]}
            layout={chartLayout(section.title.includes('Growth') ? 'Growth Percent (%)' : 'Market Share (%)')}
            config={{ responsive: true, displayModeBar: false }}
            style={{ width: '100%', height: '100%' }}
          />
        </Paper>
      </Grid>
    ))}

    <Grid item xs={12}>
      <Paper sx={{ p: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" sx={{ fontWeight: 'bold', flex: 1, textAlign: 'center' }}>Top 10 Institutions by Completions and Tuition</Typography>
          <Select value={sortBy} onChange={(e) => setSortBy(e.target.value)} size="small">
            <MenuItem value="Completions">Completions</MenuItem>
            <MenuItem value="Tuition">Tuition</MenuItem>
          </Select>
        </Box>
        <Plot
          data={[{
            y: completionsData.map(i => i.Institution),
            x: completionsData.map(i => sortBy === 'Tuition' ? parseSafeInt(i.IPEDS_Tuition_Fees_2022) : parseSafeInt(i.Completions_2022)),
            type: 'bar',
            orientation: 'h',
            marker: { color: '#2196f3' },
            text: completionsData.map(i => sortBy === 'Tuition' ? `$${parseSafeInt(i.IPEDS_Tuition_Fees_2022).toLocaleString()}` : parseSafeInt(i.Completions_2022).toLocaleString()),
            textposition: 'outside',
            hovertemplate: `<b>%{y}</b><br><b>${sortBy}:</b> %{x:,}<extra></extra>`
          }]}
          layout={chartLayout(sortBy)}
          config={{ responsive: true, displayModeBar: false }}
          style={{ width: '100%', height: '100%' }}
        />
      </Paper>
    </Grid>

    <Grid item xs={12}>
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" align="center" sx={{ fontWeight: 'bold', mb: 2 }}>Completions by Award Level</Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <FormGroup>
              {completionsByAwardLevel.map(item => (
                <FormControlLabel
                  key={item["Award Level"]}
                  control={
                    <Checkbox
                      checked={selectedAwardLevels.includes(item["Award Level"])}
                      onChange={(e) => {
                        setSelectedAwardLevels(prev =>
                          e.target.checked
                            ? [...prev, item["Award Level"]]
                            : prev.filter(level => level !== item["Award Level"])
                        );
                      }}
                    />
                  }
                  label={item["Award Level"]}
                />
              ))}
            </FormGroup>
          </Grid>
          <Grid item xs={12} md={9}>
            <Plot
              data={donutChartData.data}
              layout={donutChartData.layout}
              config={{ responsive: true, displayModeBar: false }}
              style={{ width: '100%', height: '100%' }}
            />
          </Grid>
        </Grid>
      </Paper>
    </Grid>
  </Box>
);
};

export default EducationPage;
