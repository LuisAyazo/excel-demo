import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeType?: 'increase' | 'decrease';
  period?: string;
  icon?: React.ReactNode;
}

export default function StatCard({ 
  title, 
  value, 
  change, 
  changeType = 'increase', 
  period = 'vs mes anterior',
  icon
}: StatCardProps) {
  
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <div className="flex items-center">
        {icon && (
          <motion.div 
            className={`p-3 rounded-full mr-4 ${
              changeType === 'increase' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
            }`}
            whileHover={{ rotate: 15 }}
            transition={{ duration: 0.3 }}
          >
            {icon}
          </motion.div>
        )}
        <div>
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <motion.div 
            className="mt-1 text-2xl font-semibold text-gray-900"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {value}
          </motion.div>
          {typeof change !== 'undefined' && (
            <div className="mt-1 flex items-center text-sm">
              <span className={`font-medium ${
                changeType === 'increase' ? 'text-green-600' : 'text-red-600'
              }`}>
                {changeType === 'increase' ? '↑' : '↓'} {Math.abs(change)}%
              </span>
              <span className="ml-1 text-gray-500">{period}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
