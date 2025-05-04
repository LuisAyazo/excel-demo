import React from 'react';
import jsonData from '../files/exce-no-format.json';

const FormatoPP = () => {
  // Get data from the FORMATO P&P sheet
  const data = jsonData['FORMATO P&P'];
  
  // Format currency
  const formatCurrency = (value: any) => {
    if (!value && value !== 0) return '-';
    const numValue = typeof value === 'object' && value.value ? value.value : value;
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(numValue);
  };

  // Format percentage
  const formatPercentage = (value: any) => {
    if (!value && value !== 0) return '-';
    const numValue = typeof value === 'object' && value.value ? value.value : value;
    return new Intl.NumberFormat('es-CO', { style: 'percent', minimumFractionDigits: 2 }).format(numValue);
  };

  // Get value safely (handles null and object values)
  const getValue = (row: any, col: number) => {
    if (!row) return '';
    if (!row[col] && row[col] !== 0) return '';
    return typeof row[col] === 'object' && row[col].value !== undefined ? row[col].value : row[col];
  };

  // Extract dates (format them if they are date strings)
  const formatDate = (dateString: string) => {
    if (!dateString || !dateString.includes('T')) return dateString;
    return new Date(dateString).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Helper to check if a row exists
  const rowExists = (rowIndex: number) => {
    return data && data[rowIndex];
  };

  return (
    <div className="bg-white shadow-lg rounded-lg mx-auto my-8 max-w-7xl">
      {/* Header */}
      <div className="bg-blue-800 text-white p-6 rounded-t-lg">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">{rowExists(3) ? getValue(data[3], 1) : 'Formato P&P'}</h1>
            <div className="mt-2">
              <p className="text-sm">{rowExists(1) ? getValue(data[1], 1) : ''}</p>
              <p className="text-sm">{rowExists(2) ? getValue(data[2], 1) : ''}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm">{rowExists(1) ? getValue(data[1], 7) : ''}</p>
            <p className="text-sm">{rowExists(2) ? getValue(data[2], 7) : ''}</p>
            <p className="text-sm">{rowExists(3) ? getValue(data[3], 7) : ''}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {/* INFORMACIÓN TÉCNICA */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-blue-800 pb-2 border-b-2 border-blue-800 mb-6">
            {rowExists(5) ? getValue(data[5], 0) : 'Información Técnica'}
          </h2>
          
          <div className="mb-8">
            <h3 className="text-xl font-semibold text-blue-700 mb-4">{rowExists(7) ? getValue(data[7], 0) : 'Generalidades'}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-lg">
              {rowExists(8) && (
                <div>
                  <p className="text-sm text-gray-500">{getValue(data[8], 0)}</p>
                  <p className="font-medium">{getValue(data[8], 1)}</p>
                </div>
              )}
              {rowExists(9) && (
                <div>
                  <p className="text-sm text-gray-500">{getValue(data[9], 0)}</p>
                  <p className="font-medium">{getValue(data[9], 1)}</p>
                </div>
              )}
              {/* Continue with other rows... */}
              {/* I'll show a pattern for the rest of the fields */}
              {[10, 11, 12, 13, 14, 15, 16, 17, 18].map(rowIndex => 
                rowExists(rowIndex) && (
                  <div key={rowIndex}>
                    <p className="text-sm text-gray-500">{getValue(data[rowIndex], 0)}</p>
                    <p className="font-medium">{getValue(data[rowIndex], 1) || 'N/A'}</p>
                  </div>
                )
              )}
            </div>
          </div>
        </section>

        {/* JUSTIFICACIÓN */}
        {rowExists(20) && (
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-blue-800 pb-2 border-b-2 border-blue-800 mb-6">
              {getValue(data[20], 0)}
            </h2>
            
            <div className="bg-gray-50 p-6 rounded-lg space-y-6">
              {[21, 22, 23, 24, 25].map(rowIndex => 
                rowExists(rowIndex) && (
                  <div key={rowIndex}>
                    <p className="text-sm text-gray-500 mb-1">{getValue(data[rowIndex], 0)}</p>
                    <p className="whitespace-pre-line">{getValue(data[rowIndex], 1)}</p>
                  </div>
                )
              )}
            </div>
          </section>
        )}

        {/* Rest of the sections - Apply the same pattern for safety */}
        {/* For each section, check if the row exists before rendering it */}
        {/* For map() operations, filter out undefined rows */}
        
        {/* Example of how to handle a table section */}
        {rowExists(75) && (
          <section className="mb-10">
            <h2 className="text-2xl font-bold text-blue-800 pb-2 border-b-2 border-blue-800 mb-6">
              {getValue(data[75], 0)}
            </h2>
            
            <div className="bg-gray-50 p-6 rounded-lg overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((colIndex) => (
                      <th key={colIndex} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {getValue(data[75], colIndex)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {[76, 77, 78, 79].filter(rowIndex => rowExists(rowIndex)).map((rowIndex) => (
                    <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{getValue(data[rowIndex], 0)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">{getValue(data[rowIndex], 1)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">{getValue(data[rowIndex], 2)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">{getValue(data[rowIndex], 3)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">{getValue(data[rowIndex], 4)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">{getValue(data[rowIndex], 5)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">{getValue(data[rowIndex], 6)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm">{getValue(data[rowIndex], 7)}</td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right">{formatCurrency(data[rowIndex][8])}</td>
                    </tr>
                  ))}
                  {rowExists(80) && (
                    <tr className="bg-blue-50 font-semibold">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">{getValue(data[80], 0)}</td>
                      <td colSpan={7}></td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-right font-bold">{formatCurrency(data[80][8])}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Continue applying this pattern to all other sections */}
        {/* ... */}
      </div>

      {/* Footer */}
      <div className="bg-blue-800 text-white p-4 rounded-b-lg text-center">
        <p className="text-sm">Universidad de Cartagena - {new Date().getFullYear()}</p>
      </div>
    </div>
  );
};

export default FormatoPP;
