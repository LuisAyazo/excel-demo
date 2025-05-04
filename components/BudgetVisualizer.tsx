import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

type BudgetData = {
  categoria: string;
  monto: number;
  porcentaje?: number;
  color?: string;
};

type BudgetVisualizerProps = {
  data: BudgetData[];
  title: string;
  showPercentage?: boolean;
  chartType?: 'bar' | 'pie';
};

// Custom colors for charts
const COLORS = [
  '#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', 
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
];

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const calculatePercentages = (data: BudgetData[]): BudgetData[] => {
  const total = data.reduce((sum, item) => sum + item.monto, 0);
  
  return data.map((item, index) => ({
    ...item,
    porcentaje: parseFloat(((item.monto / total) * 100).toFixed(2)),
    color: COLORS[index % COLORS.length]
  }));
};

const BudgetVisualizer: React.FC<BudgetVisualizerProps> = ({ 
  data,
  title,
  showPercentage = true,
  chartType = 'bar'
}) => {
  const processedData = calculatePercentages(data);
  
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 shadow-lg border border-gray-200 rounded-md">
          <p className="font-medium">{payload[0].payload.categoria}</p>
          <p className="text-primary">{formatCurrency(payload[0].payload.monto)}</p>
          {showPercentage && (
            <p className="text-gray-600">{payload[0].payload.porcentaje}%</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <h3 className="text-lg font-medium text-gray-800 mb-4">{title}</h3>
      
      <div className="overflow-x-auto mb-6">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Categoría
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Monto
              </th>
              {showPercentage && (
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Porcentaje
                </th>
              )}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {processedData.map((item, index) => (
              <tr key={`budget-item-${index}`} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-4 py-3 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-3 w-3 rounded-full mr-2" style={{ backgroundColor: item.color }}></div>
                    <span className="font-medium text-gray-700">{item.categoria}</span>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-right font-medium text-gray-800">
                  {formatCurrency(item.monto)}
                </td>
                {showPercentage && (
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <span className="px-2 py-1 text-xs font-medium rounded-full" style={{ 
                      backgroundColor: `${item.color}20`,
                      color: item.color
                    }}>
                      {item.porcentaje}%
                    </span>
                  </td>
                )}
              </tr>
            ))}
            <tr className="bg-gray-50">
              <td className="px-4 py-3 font-bold text-gray-800">Total</td>
              <td className="px-4 py-3 text-right font-bold text-gray-800">
                {formatCurrency(processedData.reduce((sum, item) => sum + item.monto, 0))}
              </td>
              {showPercentage && <td className="px-4 py-3"></td>}
            </tr>
          </tbody>
        </table>
      </div>
      
      <div className="h-64 md:h-80">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'bar' ? (
            <BarChart 
              data={processedData}
              margin={{ top: 10, right: 30, left: 20, bottom: 40 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="categoria" 
                tick={{ fontSize: 12 }} 
                angle={-45} 
                textAnchor="end"
                height={70}
              />
              <YAxis 
                tickFormatter={(value) => new Intl.NumberFormat('es-CO', {
                  notation: 'compact',
                  compactDisplay: 'short'
                }).format(value)}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="monto" name="Monto" fill="#4F46E5" />
            </BarChart>
          ) : (
            <PieChart>
              <Pie
                data={processedData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                innerRadius={40}
                fill="#8884d8"
                dataKey="monto"
                nameKey="categoria"
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {processedData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          )}
        </ResponsiveContainer>
      </div>
      
      <div className="mt-4 flex justify-end">
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <button
            onClick={() => {}} // For toggling chart type if needed
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-l-lg hover:bg-gray-100 hover:text-primary focus:z-10 focus:text-primary focus:bg-gray-100"
          >
            Barras
          </button>
          <button
            onClick={() => {}} // For toggling chart type if needed
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-r-lg hover:bg-gray-100 hover:text-primary focus:z-10 focus:text-primary focus:bg-gray-100"
          >
            Circular
          </button>
        </div>
      </div>
    </div>
  );
};

export default BudgetVisualizer;