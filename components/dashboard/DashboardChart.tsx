'use client';

import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import { motion } from 'framer-motion';

// Registrar los componentes necesarios
Chart.register(...registerables);

interface DashboardChartProps {
  type: 'line' | 'bar' | 'pie' | 'doughnut';
  data: {
    labels: string[];
    datasets: {
      label?: string;
      data: number[];
      backgroundColor?: string | string[];
      borderColor?: string | string[];
      borderWidth?: number;
      tension?: number;
      fill?: boolean;
      borderRadius?: number;
    }[];
  };
}

export default function DashboardChart({ type, data }: DashboardChartProps) {
  const chartRef = useRef<HTMLCanvasElement>(null);
  const chartInstance = useRef<Chart | null>(null);

  useEffect(() => {
    // Limpiar gráfico anterior si existe
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    // Asegurarse de que el canvas está disponible
    if (!chartRef.current) return;

    // Crear nuevo gráfico
    const ctx = chartRef.current.getContext('2d');
    if (ctx) {
      chartInstance.current = new Chart(ctx, {
        type: type,
        data: data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: type === 'pie' || type === 'doughnut',
              position: 'bottom',
            },
            tooltip: {
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
              padding: 10,
              titleFont: {
                size: 13,
                weight: 'bold'
              },
              bodyFont: {
                size: 12
              },
              cornerRadius: 4
            }
          },
          scales: type === 'pie' || type === 'doughnut' ? undefined : {
            y: {
              beginAtZero: true,
              grid: {
                display: false,
                color: 'rgba(0, 0, 0, 0.05)'
              },
              border: {
                display: false
              },
              ticks: {
                font: {
                  size: 11
                },
                display: false
              }
            },
            x: {
              grid: {
                display: false
              },
              border: {
                display: false
              },
              ticks: {
                font: {
                  size: 11
                }
              }
            }
          },
          animation: {
            duration: 1500,
            easing: 'easeOutQuart'
          }
        }
      });
    }

    // Limpiar al desmontar
    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, [type, data]);

  return (
    <motion.div 
      className="w-full h-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <canvas ref={chartRef} />
    </motion.div>
  );
}
