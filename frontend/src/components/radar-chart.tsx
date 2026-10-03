'use client';

import React from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { RadarData } from '@/lib/types';
import { getScoreLabel } from '@/lib/utils';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface RadarChartProps {
  data: RadarData;
}

export function RadarChart({ data }: RadarChartProps) {
  const chartData = {
    labels: data.labels,
    datasets: [
      {
        label: 'คะแนนของคุณ',
        data: data.values,
        backgroundColor: 'rgba(37, 99, 235, 0.2)',
        borderColor: 'rgba(37, 99, 235, 1)',
        borderWidth: 2,
        pointBackgroundColor: 'rgba(37, 99, 235, 1)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgba(37, 99, 235, 1)',
        pointRadius: 4,
      },
      {
        label: 'เป้าหมาย (80)',
        data: data.labels.map(() => 80),
        backgroundColor: 'rgba(0, 0, 0, 0)',
        borderColor: 'rgba(156, 163, 175, 0.5)',
        borderWidth: 2,
        borderDash: [5, 5],
        pointRadius: 0,
        fill: false,
      }
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: { color: 'rgba(0, 0, 0, 0.1)' },
        grid: { color: 'rgba(0, 0, 0, 0.1)' },
        pointLabels: {
          font: { family: 'inherit', size: 12, weight: 'bold' as const },
          color: '#4B5563',
        },
        ticks: {
          min: 0,
          max: 100,
          stepSize: 20,
          display: false,
        }
      }
    },
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          font: { family: 'inherit' },
          usePointStyle: true,
          padding: 20,
        }
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            if (context.datasetIndex === 1) return 'เป้าหมาย: 80';
            const val = context.raw;
            return `คะแนน: ${val} (${getScoreLabel(val)})`;
          }
        }
      }
    }
  };

  return (
    <div className="w-full h-[300px] md:h-[400px]">
      <Radar data={chartData} options={options} />
    </div>
  );
}
