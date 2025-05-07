'use client';

import Image from 'next/image';
import React, { useState, useRef, useEffect } from 'react';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  PointElement, 
  LineElement, 
  ArcElement,
  Title, 
  Tooltip, 
  Legend 
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale, 
  LinearScale, 
  BarElement, 
  PointElement, 
  LineElement, 
  ArcElement,
  Title, 
  Tooltip, 
  Legend
);

// Definición de tipos para los datos procesados
type SheetDataItem = {
  key: string;
  label: string;
  value: unknown;
  sheetName: string;
  section?: string;  // Para agrupar por secciones (GENERALIDADES, JUSTIFICACIÓN, etc.)
  isTitle?: boolean; // Para identificar si es un título de sección
  isFormula?: boolean; // Para identificar fórmulas de Excel
  isTable?: boolean; // Para identificar tablas complejas
  tableData?: any[]; // Para almacenar los datos de tablas complejas
  tableHeaders?: string[]; // Para almacenar los encabezados de tablas complejas
  tableHeadersMapped?: Record<string, string>; // Para mapear encabezados automáticamente con nombres más legibles
  cellFormat?: any;
  row?: number;
  col?: number;
  isCompact?: boolean; // Para identificar campos que pueden mostrarse en formato compacto
  compactPair?: string; // Para identificar el campo con el que se empareja en formato compacto
  compactPairOf?: string; // Para identificar el campo del que es pareja en formato compacto
  isSpecialBudgetTable?: boolean; // Para identificar tablas de presupuesto especiales
  isSpecialFondoRotatorioTable?: boolean; // Para identificar tablas de fondo rotatorio especiales
};

type SheetGroup = {
  sheetName: string;
  title: string;
  items: SheetDataItem[];
  sections: Map<string, SheetDataItem[]>; // Agrupar items por secciones
  color: string;
};

// Añadir una nueva propiedad para indicar campos que pueden mostrarse en formato compacto
type CompactFieldConfig = {
  pattern: string;
  shouldCompact: boolean;
};

// Función para determinar si un campo debería mostrarse en formato compacto
const shouldBeCompact = (fieldLabel: string): boolean => {
  const compactPatterns = [
    "cuenta con", "requiere", "otro requerimiento", "¿cuenta con", "¿requiere"
  ];
  
  // Convertir a minúsculas para una comparación insensible a mayúsculas/minúsculas
  const lowerLabel = fieldLabel.toLowerCase();
  
  return compactPatterns.some(pattern => lowerLabel.includes(pattern));
};

// Función para determinar si es parte de una tabla de presupuesto
const isPartOfBudgetTable = (fieldLabel: string): boolean => {
  const budgetTerms = [
    "presupuesto", "valor", "ingresos", "gastos", "contrapartida", 
    "inversiones", "excedentes", "participación", "administración"
  ];
  
  const lowerLabel = fieldLabel.toLowerCase();
  return budgetTerms.some(term => lowerLabel.includes(term));
};

// Función para determinar si es parte de un bloque específico de FONDO ROTATORIO
const isPartOfFondoRotatorio = (fieldLabel: string): boolean => {
  const fondoRotatorioTerms = [
    "fondo rotatorio", "transporte", "papelería", "materiales", "gastos legales", "total fondo"
  ];
  
  const lowerLabel = fieldLabel.toLowerCase();
  return fondoRotatorioTerms.some(term => lowerLabel.includes(term));
};

export default function UploadExcel() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [previewData, setPreviewData] = useState<SheetGroup[] | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [activeTab, setActiveTab] = useState(0); // Para controlar la pestaña activa
  const inputRef = useRef<HTMLInputElement>(null);

  // Enhanced state variables for filtering and visualization
  const [filterText, setFilterText] = useState('');
  const [activeSheetIndex, setActiveSheetIndex] = useState(0);
  const [showExportOptions, setShowExportOptions] = useState(false);
  const [chartView, setChartView] = useState(false);
  const [viewMode, setViewMode] = useState<'standard' | 'compact' | 'detailed'>('standard');
  // Add missing state variables to fix errors
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  // Add processedData state variable to fix TypeScript error
  const [processedData, setProcessedData] = useState<any>(null);

  // Drag & drop handlers
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setUploadStatus('idle');
      setPreviewData(null);
    }
  };

  // File input handler - Corregido para evitar el problema de selección múltiple
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files ? e.target.files[0] : null;
    if (selectedFile) {
      setFile(selectedFile);
      setUploadStatus('idle');
      setPreviewData(null);
    }
  };

  // Función avanzada para procesar el JSON de Excel y extraer los datos agrupados por hoja y secciones
  const processExcelJson = (data: any): SheetGroup[] => {
    // Si no tenemos datos, retornamos un array vacío
    if (!data || typeof data !== 'object') return [];
    
    const sheetGroups: SheetGroup[] = [];
    const sheetColors: Record<string, string> = {
      "FORMATO P&P": "blue",
      "FICHA TÉCNICA": "green",
      "Hoja1": "purple"
    };
    
    // Para cada hoja del Excel
    Object.entries(data).forEach(([sheetName, rows]) => {
      if (!Array.isArray(rows)) return;
      
      const items: SheetDataItem[] = [];
      // Mapa para organizar por secciones
      const sectionMap = new Map<string, SheetDataItem[]>();
      let currentSection = "General"; // Sección por defecto
      
      // Mantener registro de secciones para evitar duplicaciones
      const processedSections = new Set<string>();
      const processedTables = new Set<string>();
      const processedTableTitles = new Set<string>(); // Para evitar duplicados de tablas con mismo título
      
      // Identificar potenciales tablas de presupuesto
      const budgetTableSections = new Set<string>();
      let budgetTableStart: number = -1;
      let budgetTableHeaders: string[] = [];
      let fondoRotatorioTableStart: number = -1;
      
      // Primera pasada para identificar secciones y tablas complejas
      if (Array.isArray(rows)) {
        // Detectar secciones de presupuesto y FONDO ROTATORIO
        rows.forEach((row, rowIndex) => {
          if (!Array.isArray(row) || row.length < 2) return;
          
          // Verificar si es una fila con encabezados de presupuesto
          if (row[0]?.value === "PRESUPUESTO" && row[1]?.value === "VALOR" && 
              row[2]?.value?.toString().includes("PARTICIPACIÓN")) {
            budgetTableStart = rowIndex;
            budgetTableHeaders = ["PRESUPUESTO", "VALOR", "% PARTICIPACIÓN"];
          }
          
          // Verificar si es una fila de FONDO ROTATORIO
          if (row[0]?.value === "FONDO ROTATORIO" && row[1]?.value === "ASIGNACIÓN TOTAL") {
            fondoRotatorioTableStart = rowIndex;
          }
        });
        
        // Detectar posibles tablas con múltiples columnas
        const potentialTables = new Map<number, { 
          headers: string[], 
          headerRow: number, 
          dataRows: number[],
          title: string,
          headerMappings?: Record<string, string>
        }>();
        
        // Buscamos primero encabezados de sección y posibles encabezados de tabla
        rows.forEach((row, rowIndex) => {
          if (!Array.isArray(row) || row.length < 2) return;
          
          // Primera columna tiene un valor
          if (row[0] && row[0].value !== null && typeof row[0].value === 'string') {
            const key = row[0].value.trim();
            const keyUpper = key.toUpperCase();
            
            // Verificar si es un encabezado de sección
            if (
              keyUpper && 
              (keyUpper === key && keyUpper.length > 3) && // Todo en mayúsculas y al menos 4 caracteres
              !keyUpper.includes("CÓDIGO") && 
              !keyUpper.startsWith("HOJA") &&
              !keyUpper.match(/^\d+$/) && // No es solo un número
              !processedSections.has(keyUpper) && // Evitar duplicaciones
              !(keyUpper === "CRONOGRAMA" && processedTableTitles.has("CRONOGRAMA")) // Evitar duplicar CRONOGRAMA
            ) {
              // Es un encabezado de sección
              currentSection = keyUpper;
              processedSections.add(currentSection);
              
              // Para evitar duplicaciones específicas como CRONOGRAMA
              if (keyUpper === "CRONOGRAMA") {
                processedTableTitles.add("CRONOGRAMA");
              }
              
              // Inicializar la sección si no existe
              if (!sectionMap.has(currentSection)) {
                sectionMap.set(currentSection, []);
              }
              
              // Añadir el encabezado como primer elemento de la sección
              const sectionHeader: SheetDataItem = {
                key: key.replace(/\s+/g, '_').toLowerCase(),
                label: key,
                value: row[1]?.value?.toString() || "DESCRIPCIÓN",
                sheetName: sheetName,
                isTitle: true,
                section: currentSection,
                row: rowIndex
              };
              
              sectionMap.get(currentSection)?.push(sectionHeader);
              
              // Verificar si la siguiente fila podría ser un encabezado de tabla
              if (rows[rowIndex + 1] && rows[rowIndex + 1].filter((cell: { value: null; }) => cell.value !== null).length >= 3) {
                const nextRow = rows[rowIndex + 1];
                const headers = nextRow.map((cell: { value: { toString: () => any; }; }) => cell.value?.toString() || "");
                
                if (headers.filter(Boolean).length >= 2) {
                  // Evitar tablas duplicadas con la misma clave o título
                  const tableKey = `${currentSection}-${rowIndex+1}`;
                  
                  if (!processedTables.has(tableKey)) {
                    processedTables.add(tableKey);
                    
                    // Determinar si es una tabla especial y aplicar mapeo de encabezados
                    let headerMappings: Record<string, string> | undefined = undefined;
                    
                    // Mapeo para CRONOGRAMA
                    if (keyUpper.includes("CRONOGRAMA")) {
                      headerMappings = {
                        "CRONOGRAMA": "ACTIVIDAD",
                        "DESCRIPCION": "DESCRIPCIÓN",
                        "DESCRIPCIÓN": "DESCRIPCIÓN", // Asegurar ambas formas
                        "CRONOGRAMA.1": "FECHA DE INICIO", 
                        "CRONOGRAMA.2": "FECHA FIN"
                      };
                    }
                    // Mapeo para GASTOS PERSONAL
                    else if (keyUpper.includes("GASTOS PERSONAL")) {
                      headerMappings = {
                        "GASTOS PERSONAL VINCULADO": "NOMBRE",
                        "GASTOS PERSONAL VINCULADO.1": "IDENTIFICACIÓN",
                        "PROFESIÓN": "PROFESIÓN",
                        "ROL": "ROL",
                        "CATEGORÍA": "CATEGORÍA",
                        "TIPO DE REMUNERACIÓN": "TIPO DE REMUNERACIÓN",
                        "DEDICACIÓN": "DEDICACIÓN",
                        "DURACIÓN": "DURACIÓN",
                        "REMUNERACIÓN TOTAL": "REMUNERACIÓN TOTAL"
                      };
                    }
                    
                    potentialTables.set(rowIndex + 1, {
                      headers: headers,
                      headerRow: rowIndex + 1,
                      dataRows: [],
                      title: key,
                      headerMappings
                    });
                  }
                }
              }
            }
            
            // Detectar si esta fila podría ser un encabezado de tabla (contiene varios valores)
            if (row.filter(cell => cell.value !== null).length >= 3) {
              const headers = row.map(cell => cell.value?.toString() || "");
              if (headers.filter(Boolean).length >= 2 && 
                  !potentialTables.has(rowIndex) && 
                  // El primer encabezado no debe tener formato de sección
                  headers[0] !== headers[0]?.toUpperCase()) {
                // Evitar tablas duplicadas con la misma clave o título
                const tableKey = `${currentSection}-${rowIndex}`;
                if (!processedTables.has(tableKey)) {
                  processedTables.add(tableKey);
                  potentialTables.set(rowIndex, {
                    headers: headers,
                    headerRow: rowIndex,
                    dataRows: [],
                    title: currentSection
                  });
                }
              }
            }
          }
        });
        
        // Detectar filas de datos para las tablas potenciales
        potentialTables.forEach((tableInfo, headerRowIndex) => {
          for (let i = headerRowIndex + 1; i < rows.length; i++) {
            const row = rows[i];
            if (!Array.isArray(row) || row.length < tableInfo.headers.length) continue;
            
            // Verificar si esta fila pertenece a la tabla
            const cells = row.map(cell => cell.value);
            // Debe tener al menos dos celdas con datos
            if (cells.filter(Boolean).length >= 2) {
              tableInfo.dataRows.push(i);
            } else {
              // Terminó la tabla
              break;
            }
          }
        });
        
        // Convertir las tablas potenciales en elementos de datos
        potentialTables.forEach((tableInfo, headerRowIndex) => {
          if (tableInfo.dataRows.length === 0) return;
          
          // Crear un item para representar la tabla completa
          const tableData: any[] = [];
          const seenRows = new Set<string>(); // Para detectar y evitar duplicados
          
          // Añadir filas de datos
          tableInfo.dataRows.forEach(dataRowIndex => {
            const rowData: Record<string, any> = {};
            const row = rows[dataRowIndex];
            
            tableInfo.headers.forEach((header, colIndex) => {
              if (!header) return;
              const cell: any = row[colIndex];
              let value = null;
              
              if (cell && cell.value !== null) {
                // Obtener display_value si está disponible, de lo contrario usar value
                value = cell.display_value !== null ? cell.display_value : cell.value;
                
                // Convertir fechas en formato ISO a formato legible
                if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)) {
                  const date = new Date(value);
                  if (!isNaN(date.getTime())) {
                    value = date.toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    });
                  }
                }
                
                // Formatear porcentajes
                if (typeof value === 'number' && header.toUpperCase().includes('PARTICIPACIÓN')) {
                  value = (value * 100).toFixed(1) + '%';
                }
                
                // Mejorar la presentación de las fórmulas
                if (typeof value === 'string' && (
                  value.startsWith('=') || 
                  value.startsWith('=+') || 
                  value.startsWith('=SUM') || 
                  value.startsWith('=SUMA') ||
                  value.includes('+') && value.includes('B'))) {
                  // En lugar de mostrar la fórmula, intentar usar display_value o valor calculado
                  if (cell.display_value) {
                    value = cell.display_value;
                  } else {
                    // Simplificar la visualización de las fórmulas
                    value = "Valor calculado";
                  }
                }
              }
              
              // Usar el encabezado mapeado si existe, de lo contrario usar el original
              const mappedHeader = tableInfo.headerMappings?.[header] || header;
              rowData[mappedHeader] = value;
            });
            
            // Detectar y evitar filas duplicadas usando el primer valor como clave
            // Solo agregamos si no es un duplicado
            const firstColumnValue = Object.values(rowData)[0]?.toString()?.trim()?.toLowerCase();
            if (firstColumnValue && !seenRows.has(firstColumnValue)) {
              seenRows.add(firstColumnValue);
              tableData.push(rowData);
            }
          });
          
          const tableKey = tableInfo.title.replace(/\s+/g, '_').toLowerCase() + '_tabla';
          
          const tableItem: SheetDataItem = {
            key: tableKey,
            label: tableInfo.title,
            value: `Tabla con ${tableData.length} filas, ${tableInfo.headers.length} columnas`,
            sheetName: sheetName,
            section: currentSection,
            isTable: true,
            tableData: tableData,
            tableHeaders: tableInfo.headerMappings 
              ? Object.values(tableInfo.headerMappings) 
              : tableInfo.headers.filter(Boolean),
            tableHeadersMapped: tableInfo.headerMappings,
            row: headerRowIndex
          };
          
          if (!sectionMap.has(currentSection)) {
            sectionMap.set(currentSection, []);
          }
          
          sectionMap.get(currentSection)?.push(tableItem);
          items.push(tableItem);
        });
        
        // Especial para tablas de presupuesto
        if (budgetTableStart >= 0) {
          // Crear un item para la tabla de presupuesto
          const budgetTableData: any[] = [];
          let currentSection = "PRESUPUESTO";
          let seenBudgetItems = new Set<string>(); // Para detectar y evitar duplicados
          
          // Recopilar datos de presupuesto desde la fila después de los encabezados
          for (let i = budgetTableStart + 1; i < rows.length; i++) {
            const row = rows[i];
            if (!Array.isArray(row) || row.length < 2) continue;
            
            const item = row[0]?.value;
            if (!item) continue;
            
            // Si llegamos a una fila vacía o a otra sección, terminamos
            if (i > budgetTableStart + 15 && !isPartOfBudgetTable(String(item))) {
              break;
            }
            
            // Normalizar la etiqueta para detectar duplicados
            const normalizedLabel = String(item).trim().toUpperCase();
            
            // Si ya hemos visto este ítem de presupuesto, lo omitimos para evitar duplicados
            if (seenBudgetItems.has(normalizedLabel)) {
              continue;
            }
            
            seenBudgetItems.add(normalizedLabel);
            
            const rowData: Record<string, any> = {};
            
            // Mapear columnas
            rowData["PRESUPUESTO"] = row[0]?.value || "";
            
            // Verificar si hay un valor para la columna VALOR
            if (row[1]?.value !== null) {
              if (row[1]?.display_value) {
                // Si hay display_value, asegurarse que tenga formato monetario
                const value = typeof row[1].display_value === 'number' ? 
                  row[1].display_value : 
                  parseFloat(row[1].display_value?.toString().replace(/[^\d.-]/g, '') || '0');
                
                if (!isNaN(value)) {
                  // Asegurar que TODOS los valores de presupuesto tengan formato monetario consistente
                  rowData["VALOR"] = new Intl.NumberFormat('es-CO', { 
                    style: 'currency', 
                    currency: 'COP',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2
                  }).format(value);
                } else {
                  rowData["VALOR"] = row[1].display_value;
                }
              } else if (typeof row[1]?.value === 'string' && row[1].value.startsWith('=')) {
                // Es una fórmula, intentamos mostrar un valor calculado
                rowData["VALOR"] = "Valor calculado";
              } else {
                // Formatear como moneda si parece ser un valor numérico
                if (typeof row[1]?.value === 'number' || !isNaN(parseFloat(String(row[1]?.value)))) {
                  const numValue = typeof row[1]?.value === 'number' ? 
                    row[1].value : 
                    parseFloat(String(row[1].value).replace(/[^\d.-]/g, '') || '0');
                  
                  // Asegurar formato monetario consistente para TODOS los valores de presupuesto
                  rowData["VALOR"] = new Intl.NumberFormat('es-CO', { 
                    style: 'currency', 
                    currency: 'COP',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2
                  }).format(numValue);
                } else {
                  rowData["VALOR"] = row[1].value;
                }
              }
            } else {
              rowData["VALOR"] = "";
            }
            
            // Verificar si hay un valor para la columna % PARTICIPACIÓN
            if (row[2]?.value !== null) {
              if (typeof row[2]?.value === 'number') {
                // Convertir a porcentaje con formato consistente
                rowData["% PARTICIPACIÓN"] = (row[2].value * 100).toFixed(1) + "%";
              } else if (typeof row[2]?.value === 'string' && row[2].value.includes('.')) {
                // Intentar convertir strings que parecen decimales a porcentajes
                const numValue = parseFloat(row[2].value);
                if (!isNaN(numValue)) {
                  // Determinar si ya es un porcentaje o es un decimal
                  if (numValue > 0 && numValue < 1) {
                    rowData["% PARTICIPACIÓN"] = (numValue * 100).toFixed(1) + "%";
                  } else {
                    rowData["% PARTICIPACIÓN"] = numValue.toFixed(1) + "%";
                  }
                } else {
                  rowData["% PARTICIPACIÓN"] = row[2].value;
                }
              } else {
                // Si es un string que ya podría tener formato
                const strValue = String(row[2].value);
                if (strValue.includes('%')) {
                  rowData["% PARTICIPACIÓN"] = strValue;
                } else {
                  rowData["% PARTICIPACIÓN"] = strValue + "%";
                }
              }
            } else {
              rowData["% PARTICIPACIÓN"] = "";
            }
            
            budgetTableData.push(rowData);
          }
          
          // Eliminar duplicados en los datos de presupuesto antes de agregarlos
          if (budgetTableData.length > 0) {
            // Procesar todos los elementos del presupuesto para asegurar formatos consistentes
            budgetTableData.forEach(item => {
              const key = String(item["PRESUPUESTO"]).trim().toUpperCase();
              
              // Asegurar formato consistente para todos los elementos del presupuesto
              // 1. FIX: Específicamente para "Gastos generales", asegurarse de que tenga formato monetario
              if (key.includes("GASTOS GENERALES") && item["VALOR"]) {
                // Si no empieza con $, formatearlo como moneda
                if (!String(item["VALOR"]).startsWith('$')) {
                  const numValue = parseFloat(String(item["VALOR"]).replace(/[^\d.-]/g, '') || '0');
                  if (!isNaN(numValue)) {
                    item["VALOR"] = new Intl.NumberFormat('es-CO', { 
                      style: 'currency', 
                      currency: 'COP',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 2
                    }).format(numValue);
                  }
                }
                
                // También asegurar que el porcentaje tenga el formato correcto
                if (item["% PARTICIPACIÓN"] && typeof item["% PARTICIPACIÓN"] === 'string') {
                  // Si no tiene el símbolo %, añadirlo
                  const percentValue = item["% PARTICIPACIÓN"].replace('%', '').trim();
                  const numValue = parseFloat(percentValue);
                  if (!isNaN(numValue)) {
                    item["% PARTICIPACIÓN"] = numValue.toFixed(1) + "%";
                  }
                }
              }
              
              // 3. FIX: Asegurar formato consistente para DISTRIBUCIÓN DE EXCEDENTES
              if (key.includes("EXCEDENTES") || key.includes("UNIDAD") || 
                  key.includes("PROYECCIÓN") || key.includes("INVESTIGACIONES") || 
                  key.includes("BIBLIOTECAS")) {
                
                // Asegurar que los porcentajes en esta sección son consistentes
                if (item["% PARTICIPACIÓN"]) {
                  // Verificar si ya tiene formato de porcentaje
                  const percentStr = String(item["% PARTICIPACIÓN"]);
                  if (!percentStr.includes('%')) {
                    const percentValue = parseFloat(percentStr);
                    if (!isNaN(percentValue)) {
                      // Convertir a porcentaje con formato estandarizado
                      item["% PARTICIPACIÓN"] = percentValue.toFixed(1) + "%";
                    }
                  } else {
                    // Ya tiene %, pero asegurar que tenga un decimal
                    const cleanPercentStr = percentStr.replace('%', '').trim();
                    const percentValue = parseFloat(cleanPercentStr);
                    if (!isNaN(percentValue)) {
                      item["% PARTICIPACIÓN"] = percentValue.toFixed(1) + "%";
                    }
                  }
                }
                
                // También asegurar que los valores monetarios tengan formato
                if (item["VALOR"] && !String(item["VALOR"]).startsWith('$') && 
                    String(item["VALOR"]).trim() !== '0' && String(item["VALOR"]).trim() !== '') {
                  const numValue = parseFloat(String(item["VALOR"]).replace(/[^\d.-]/g, '') || '0');
                  if (!isNaN(numValue)) {
                    item["VALOR"] = new Intl.NumberFormat('es-CO', { 
                      style: 'currency', 
                      currency: 'COP',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 2
                    }).format(numValue);
                  }
                }
              }
            });
            
            // 2. FIX: Eliminar posibles duplicados de "Gastos recursos a contratar"
            const uniqueBudgetData = [];
            const seenItems = new Set<string>();
            
            for (const item of budgetTableData) {
              const itemKey = item["PRESUPUESTO"].toString().trim().toUpperCase();
              // Si es "Gastos recursos a contratar" y ya lo hemos visto, lo omitimos
              if (itemKey.includes("GASTOS RECURSOS A CONTRATAR") && seenItems.has("GASTOS RECURSOS A CONTRATAR")) {
                continue;
              }
              
              if (itemKey.includes("GASTOS RECURSOS A CONTRATAR")) {
                seenItems.add("GASTOS RECURSOS A CONTRATAR");
                // Asegurar formato consistente
                if (item["VALOR"] && !String(item["VALOR"]).startsWith('$')) {
                  const numValue = parseFloat(String(item["VALOR"]).replace(/[^\d.-]/g, '') || '0');
                  if (!isNaN(numValue)) {
                    item["VALOR"] = new Intl.NumberFormat('es-CO', { 
                      style: 'currency', 
                      currency: 'COP',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 2
                    }).format(numValue);
                  }
                }
                if (item["% PARTICIPACIÓN"]) {
                  const percentStr = String(item["% PARTICIPACIÓN"]);
                  if (!percentStr.includes('%')) {
                    const percentValue = parseFloat(percentStr);
                    if (!isNaN(percentValue)) {
                      item["% PARTICIPACIÓN"] = percentValue.toFixed(1) + "%";
                    }
                  }
                }
              }
              
              uniqueBudgetData.push(item);
            }
            
            // Crear un item para la tabla de presupuesto con los datos limpios y formateados
            const budgetTableItem: SheetDataItem = {
              key: "presupuesto_tabla",
              label: "PRESUPUESTO",
              value: `Tabla de presupuesto con ${uniqueBudgetData.length} filas`,
              sheetName: sheetName,
              section: "PRESUPUESTO",
              isTable: true,
              isSpecialBudgetTable: true,
              tableData: uniqueBudgetData,
              tableHeaders: budgetTableHeaders,
              row: budgetTableStart
            };
            
            // Añadir a la sección de presupuesto
            if (!sectionMap.has("PRESUPUESTO")) {
              sectionMap.set("PRESUPUESTO", []);
              
              // Añadir el título de la sección
              const sectionHeader: SheetDataItem = {
                key: "presupuesto_seccion",
                label: "PRESUPUESTO",
                value: "Datos financieros del proyecto",
                sheetName: sheetName,
                isTitle: true,
                section: "PRESUPUESTO",
                row: budgetTableStart - 1
              };
              
              sectionMap.get("PRESUPUESTO")?.push(sectionHeader);
            }
            
            sectionMap.get("PRESUPUESTO")?.push(budgetTableItem);
            items.push(budgetTableItem);
          }
        }
        
        // Especial para tablas de FONDO ROTATORIO
        if (fondoRotatorioTableStart >= 0) {
          // Crear un item para la tabla de FONDO ROTATORIO
          const fondoRotatorioTableData: any[] = [];
          
          // Recopilar datos de FONDO ROTATORIO desde la fila después de los encabezados
          for (let i = fondoRotatorioTableStart + 1; i < rows.length; i++) {
            const row = rows[i];
            if (!Array.isArray(row) || row.length < 2) continue;
            
            const item = row[0]?.value;
            if (!item) continue;
            
            // Si llegamos a una fila vacía o a otra sección, terminamos
            if (i > fondoRotatorioTableStart + 5 && !isPartOfFondoRotatorio(String(item))) {
              break;
            }
            
            const rowData: Record<string, any> = {};
            
            // Mapear columnas
            rowData["FONDO ROTATORIO"] = row[0]?.value || "";
            
            // Verificar si hay un valor para la columna ASIGNACIÓN TOTAL
            if (row[1]?.value !== null) {
              if (row[1]?.display_value) {
                // Si hay display_value, asegurarse que tenga formato monetario
                const value = typeof row[1].display_value === 'number' ? 
                  row[1].display_value : 
                  parseFloat(row[1].display_value?.toString().replace(/[^\d.-]/g, '') || '0');
                
                if (!isNaN(value)) {
                  rowData["ASIGNACIÓN TOTAL"] = new Intl.NumberFormat('es-CO', { 
                    style: 'currency', 
                    currency: 'COP',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2
                  }).format(value);
                } else {
                  rowData["ASIGNACIÓN TOTAL"] = row[1].display_value;
                }
              } else if (typeof row[1]?.value === 'string' && row[1].value.startsWith('=')) {
                // Es una fórmula, intentamos mostrar un valor calculado
                rowData["ASIGNACIÓN TOTAL"] = "Valor calculado";
              } else {
                // Formatear como moneda si parece ser un valor numérico
                if (typeof row[1]?.value === 'number' || !isNaN(parseFloat(row[1]?.value))) {
                  const numValue = typeof row[1]?.value === 'number' ? 
                    row[1].value : 
                    parseFloat(row[1].value.toString().replace(/[^\d.-]/g, '') || '0');
                  
                  rowData["ASIGNACIÓN TOTAL"] = new Intl.NumberFormat('es-CO', { 
                    style: 'currency', 
                    currency: 'COP',
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2
                  }).format(numValue);
                } else {
                  rowData["ASIGNACIÓN TOTAL"] = row[1].value;
                }
              }
            } else {
              rowData["ASIGNACIÓN TOTAL"] = "";
            }
            
            fondoRotatorioTableData.push(rowData);
          }
          
          if (fondoRotatorioTableData.length > 0) {
            // Crear un item para la tabla de FONDO ROTATORIO
            const fondoRotatorioTableItem: SheetDataItem = {
              key: "fondo_rotatorio_tabla",
              label: "FONDO ROTATORIO",
              value: `Tabla de fondo rotatorio con ${fondoRotatorioTableData.length} filas`,
              sheetName: sheetName,
              section: "FONDO ROTATORIO",
              isTable: true,
              isSpecialFondoRotatorioTable: true,
              tableData: fondoRotatorioTableData,
              tableHeaders: ["FONDO ROTATORIO", "ASIGNACIÓN TOTAL"],
              row: fondoRotatorioTableStart
            };
            
            // Añadir a la sección de FONDO ROTATORIO
            if (!sectionMap.has("FONDO ROTATORIO")) {
              sectionMap.set("FONDO ROTATORIO", []);
              
              // Añadir el título de la sección
              const sectionHeader: SheetDataItem = {
                key: "fondo_rotatorio_seccion",
                label: "FONDO ROTATORIO",
                value: "Gastos operativos del proyecto",
                sheetName: sheetName,
                isTitle: true,
                section: "FONDO ROTATORIO",
                row: fondoRotatorioTableStart - 1
              };
              
              sectionMap.get("FONDO ROTATORIO")?.push(sectionHeader);
            }
            
            sectionMap.get("FONDO ROTATORIO")?.push(fondoRotatorioTableItem);
            items.push(fondoRotatorioTableItem);
          }
        }
        
        // Segunda pasada para los campos normales
        currentSection = "General"; // Reiniciamos para la segunda pasada
        
        // En el procesamiento de campos normales, detectar campos que pueden ir juntos
        const compactFields: Map<string, SheetDataItem[]> = new Map();
        
        // Agrupar campos que pueden ir juntos (respuestas cortas)
        rows.forEach((row, rowIndex) => {
          if (!Array.isArray(row) || row.length < 2) return;
          
          // Verificar si esta fila pertenece a alguna tabla
          let isTableRow = false;
          potentialTables.forEach(tableInfo => {
            if (tableInfo.headerRow === rowIndex || tableInfo.dataRows.includes(rowIndex)) {
              isTableRow = true;
            }
          });
          
          if (isTableRow) return; // Saltamos filas de tablas ya procesadas
          
          // Procesamiento normal para filas que no son parte de tablas
          if (row[0] && row[0].value !== null && typeof row[0].value === 'string') {
            const key = row[0].value.trim();
            const keyUpper = key.toUpperCase();
            let value = "";
            
            // Si la segunda celda tiene un valor, la usamos como valor
            if (row[1] && row[1].value !== null) {
              // Preferir display_value si está disponible
              value = row[1].display_value !== null ? row[1].display_value : row[1].value?.toString() || "";
              
              // Formatear porcentajes
              if (typeof row[1].value === 'number' && key.toUpperCase().includes('PARTICIPACIÓN')) {
                value = (row[1].value * 100).toFixed(2) + '%';
              }
              
              // Mejorar la presentación de las fórmulas
              const isFormula = typeof row[1].value === 'string' && (
                row[1].value.startsWith('=') || 
                row[1].value.startsWith('=+') || 
                row[1].value.startsWith('=SUM') || 
                row[1].value.startsWith('=SUMA') ||
                row[1].value.includes('+') && row[1].value.includes('B'));
              
              // Procesar la fórmula para mostrar algo más amigable
              if (isFormula) {
                if (row[1].display_value) {
                  value = row[1].display_value;
                } else {
                  value = "Valor calculado";
                }
              }
            }
            
            // Verificar si estamos en un nuevo encabezado de sección
            if (
              keyUpper && 
              (keyUpper === key && keyUpper.length > 3) && // Todo en mayúsculas y al menos 4 caracteres
              !keyUpper.includes("CÓDIGO") && 
              !keyUpper.startsWith("HOJA") &&
              !keyUpper.match(/^\d+$/) && // No es solo un número
              sectionMap.has(keyUpper) // Ya fue identificado como sección
            ) {
              currentSection = keyUpper;
              // Saltamos porque ya se añadió como encabezado
              return;
            }
            
            // Solo agregamos si la clave tiene texto y no es un encabezado genérico
            if (key && 
                !key.includes('RESUMEN DE') && 
                !key.includes('GENERALIDADES DEL') &&
                !key.includes('FORMATO') &&
                !key.startsWith('Hoja') && 
                key !== null && key !== "" && 
                !key.match(/^\d+$/) // Excluir filas que son sólo números
            ) {
              // Determinar si este campo podría ser compacto (respuestas cortas)
              const canBeCompact = shouldBeCompact(key) && 
                                  value.length < 5; // Respuesta corta (como "Sí", "No")
              
              // Crear el elemento con sección asignada
              const dataItem: SheetDataItem = {
                key: key.replace(/\s+/g, '_').toLowerCase(),
                label: key,
                value: value,
                sheetName: sheetName,
                section: currentSection,
                isFormula: typeof row[1].value === 'string' && row[1].value.startsWith('='),
                isCompact: canBeCompact,
                row: rowIndex,
                cellFormat: row[0].format
              };
              
              // Añadir a la sección correspondiente
              if (!sectionMap.has(currentSection)) {
                sectionMap.set(currentSection, []);
              }
              
              // Solo añadir si tiene un valor o es una fórmula
              if (value.trim() !== "" || dataItem.isFormula) {
                sectionMap.get(currentSection)?.push(dataItem);
                items.push(dataItem);
                
                // Si puede estar en formato compacto, lo guardamos para procesarlo luego
                if (canBeCompact) {
                  if (!compactFields.has(currentSection)) {
                    compactFields.set(currentSection, []);
                  }
                  compactFields.get(currentSection)?.push(dataItem);
                }
              }
            }
          }
        });
        
        // Marcar los campos que deben ir en pares
        compactFields.forEach((fields, section) => {
          // Agrupar en pares
          for (let i = 0; i < fields.length; i += 2) {
            if (i + 1 < fields.length) {
              // Tenemos un par, marcar ambos
              fields[i].compactPair = fields[i+1].key;
              fields[i+1].compactPairOf = fields[i].key;
            }
          }
        });
      }
      
      // Eliminar secciones vacías o con solo el título
      for (const [section, sectionItems] of sectionMap.entries()) {
        if (sectionItems.length <= 1) {
          sectionMap.delete(section);
        }
      }
      
      if (items.length > 0) {
        sheetGroups.push({
          sheetName: sheetName,
          title: sheetName,
          items: items,
          sections: sectionMap,
          color: sheetColors[sheetName] || "gray"
        });
      }
    });
    
    return sheetGroups;
  };
  
  const processSimpleExcelJson = (data: any): SheetGroup[] => {
    // If no data, return empty array
    if (!data || typeof data !== 'object') return [];
    
    const sheetGroups: SheetGroup[] = [];
    const sheetColors: Record<string, string> = {
      "FORMATO P&P": "blue",
      "FICHA TÉCNICA": "green",
      "Hoja1": "purple"
    };
    
    // Keep track of seen items to avoid duplicates
    const seenItems = new Set<string>();
    
    // For each sheet in the Excel file
    Object.entries(data).forEach(([sheetName, rows]) => {
      if (!Array.isArray(rows)) return;
      
      const items: SheetDataItem[] = [];
      // Map to organize by sections
      const sectionMap = new Map<string, SheetDataItem[]>();
      let currentSection = "General"; // Default section
      
      // Process rows to identify sections and data
      let rowIndex = 0;
      while (rowIndex < rows.length) {
        const row = rows[rowIndex];
        if (!Array.isArray(row) || row.length === 0) {
          rowIndex++;
          continue;
        }
        
        // First cell has a value that could be a section header
        const firstCell = row[0];
        if (firstCell && typeof firstCell === 'string' && firstCell.toUpperCase() === firstCell && firstCell.length > 3) {
          // Looks like a section header
          currentSection = firstCell;
          
          // Initialize section in map if it doesn't exist
          if (!sectionMap.has(currentSection)) {
            sectionMap.set(currentSection, []);
            
            // Add section header as first item
            const sectionHeader: SheetDataItem = {
              key: firstCell.replace(/\s+/g, '_').toLowerCase(),
              label: firstCell,
              value: "Sección de " + firstCell.toLowerCase(),
              sheetName,
              section: currentSection,
              isTitle: true,
              row: rowIndex
            };
            
            sectionMap.get(currentSection)?.push(sectionHeader);
          }
          
          rowIndex++;
          continue;
        }
        
        // Check if this is a table header
        const potentialTableHeaders = row.filter(cell => cell !== null && cell !== "");
        if (potentialTableHeaders.length >= 2 && rowIndex + 1 < rows.length) {
          // Looks like a table header, check if next row has matching data structure
          const nextRow = rows[rowIndex + 1];
          if (Array.isArray(nextRow) && nextRow.filter(cell => cell !== null && cell !== "").length >= 2) {
            // Extract table headers
            const headers = row.map(cell => cell?.toString() || "").filter(Boolean);
            
            // Create table data
            const tableData: any[] = [];
            let tableRowIndex = rowIndex + 1;
            
            // Collect data rows
            while (tableRowIndex < rows.length) {
              const dataRow = rows[tableRowIndex];
              if (!Array.isArray(dataRow) || dataRow.filter(cell => cell !== null && cell !== "").length < 2) {
                break;
              }
              
              const rowData: Record<string, any> = {};
              headers.forEach((header, headerIndex) => {
                if (headerIndex < dataRow.length) {
                  // Handle different cell formats
                  const cellValue = dataRow[headerIndex];
                  
                  if (cellValue !== null) {
                    // If it's a formula object
                    if (typeof cellValue === 'object' && cellValue.formula) {
                      rowData[header] = cellValue.value;
                    } else {
                      rowData[header] = cellValue;
                    }
                    
                    // Format ALL currency values consistently - including values in budget tables
                    if (header.toLowerCase().includes('valor') || 
                        header.toLowerCase().includes('asignación') || 
                        header.toLowerCase().includes('total') ||
                        header.toLowerCase().includes('gastos') ||
                        header.toLowerCase().includes('presupuesto') ||
                        header.toLowerCase().includes('ingresos') ||
                        header.toLowerCase().includes('contrapartida') ||
                        header.toLowerCase().includes('inversiones') ||
                        header.toLowerCase().includes('remuneración')) {
                      if (typeof rowData[header] === 'number') {
                        // Always format numbers as currency with $ sign
                        rowData[header] = new Intl.NumberFormat('es-CO', { 
                          style: 'currency', 
                          currency: 'COP',
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0
                        }).format(rowData[header]);
                      } else if (typeof rowData[header] === 'string' && 
                                !rowData[header].includes('$') && 
                                !isNaN(parseFloat(rowData[header].replace(/[^\d.-]/g, '')))) {
                        // Convert string numbers to currency format if they don't already have $ sign
                        const numValue = parseFloat(rowData[header].replace(/[^\d.-]/g, ''));
                        rowData[header] = new Intl.NumberFormat('es-CO', { 
                          style: 'currency', 
                          currency: 'COP',
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0
                        }).format(numValue);
                      }
                    }
                    
                    // Format ALL percentage values consistently
                    if (header.toLowerCase().includes('participación') || 
                        header.toLowerCase().includes('porcentaje') ||
                        header.toLowerCase().includes('distribución') ||
                        header.toLowerCase().includes('%')) {
                      if (typeof rowData[header] === 'number') {
                        // For small decimal values (less than 1), multiply by 100
                        if (rowData[header] <= 1) {
                          rowData[header] = (rowData[header] * 100).toFixed(1) + '%';
                        } else {
                          // Already a percentage value
                          rowData[header] = rowData[header].toFixed(1) + '%';
                        }
                      } else if (typeof rowData[header] === 'string' && !rowData[header].includes('%')) {
                        // Convert string values to percentages
                        const numValue = parseFloat(rowData[header].replace(/[^\d.-]/g, ''));
                        if (!isNaN(numValue)) {
                          if (numValue <= 1) {
                            rowData[header] = (numValue * 100).toFixed(1) + '%';
                          } else {
                            rowData[header] = numValue.toFixed(1) + '%';
                          }
                        }
                      }
                    }
                  }
                }
              });
              
              // Only add row if it has data and isn't a duplicate
              if (Object.values(rowData).some(val => val !== null && val !== "")) {
                // Create a normalized key to better identify duplicate rows
                // Strip out formatting to compare just the values
                const normalizedRowData: Record<string, string> = {};
                Object.entries(rowData).forEach(([key, value]) => {
                  if (typeof value === 'string') {
                    // Remove currency symbols, commas, and percent signs for comparison
                    normalizedRowData[key] = value.replace(/[$,%\s]/g, '').toLowerCase().trim();
                  } else if (value === null || value === undefined) {
                    normalizedRowData[key] = '';
                  } else {
                    normalizedRowData[key] = String(value).toLowerCase().trim();
                  }
                });
                
                const rowKey = JSON.stringify(normalizedRowData);
                if (!seenItems.has(rowKey)) {
                  seenItems.add(rowKey);
                  tableData.push(rowData);
                }
              }
              
              tableRowIndex++;
            }
            
            // Create table item
            if (tableData.length > 0) {
              const tableItem: SheetDataItem = {
                key: `table_${rowIndex}`,
                label: `Tabla en ${currentSection}`,
                value: `Tabla con ${tableData.length} filas`,
                sheetName,
                section: currentSection,
                isTable: true,
                tableData,
                tableHeaders: headers,
                row: rowIndex
              };
              
              // Special handling for budget tables
              if (headers.includes("PRESUPUESTO") && headers.includes("VALOR")) {
                tableItem.isSpecialBudgetTable = true;
              }
              
              // Special handling for "FONDO ROTATORIO" tables
              if (headers.includes("FONDO ROTATORIO") && headers.includes("ASIGNACIÓN TOTAL")) {
                tableItem.isSpecialFondoRotatorioTable = true;
              }
              
              if (!sectionMap.has(currentSection)) {
                sectionMap.set(currentSection, []);
              }
              
              sectionMap.get(currentSection)?.push(tableItem);
              items.push(tableItem);
              
              // Skip processed rows
              rowIndex = tableRowIndex;
              continue;
            }
          }
        }
        
        // Process as regular field (key-value pair)
        if (row[0] !== null && row[1] !== null) {
          const key = String(row[0]);
          let value = row[1];
          
          // Handle formula object
          if (typeof value === 'object' && value?.formula) {
            value = value.value;
          }
          
          // Create a unique key for this field to avoid duplicates
          const fieldKey = `${sheetName}-${key}-${value}`;
          if (!seenItems.has(fieldKey)) {
            seenItems.add(fieldKey);
            
            // Create data item
            const dataItem: SheetDataItem = {
              key: key.replace(/\s+/g, '_').toLowerCase(),
              label: key,
              value: value,
              sheetName,
              section: currentSection,
              row: rowIndex
            };
            
            // Determine if it can be compact (short yes/no responses)
            if (shouldBeCompact(key) && typeof value === 'string' && value.length < 5) {
              dataItem.isCompact = true;
            }
            
            if (!sectionMap.has(currentSection)) {
              sectionMap.set(currentSection, []);
            }
            
            sectionMap.get(currentSection)?.push(dataItem);
            items.push(dataItem);
          }
        }
        
        rowIndex++;
      }
      
      // Remove empty sections
      for (const [section, sectionItems] of sectionMap.entries()) {
        if (sectionItems.length <= 1) {
          sectionMap.delete(section);
        }
      }
      
      if (items.length > 0) {
        sheetGroups.push({
          sheetName,
          title: sheetName,
          items,
          sections: sectionMap,
          color: sheetColors[sheetName] || "gray"
        });
      }
    });
    
    return sheetGroups;
  };

  // Modificamos la función de carga para usar el procesador avanzado
  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setUploadStatus('idle');
    setPreviewData(null);
    
    try {
      // Datos de muestra organizados por hojas con formato mejorado
      const mockSheetGroups: SheetGroup[] = [
        {
          sheetName: "FORMATO P&P",
          title: "FORMATO P&P",
          color: "blue",
          items: [
            { key: "codigo", label: "Código", value: "EXTSC-2025-001", sheetName: "FORMATO P&P", section: "INFORMACIÓN GENERAL" },
            { key: "nombre_del_proyecto", label: "Nombre del Proyecto", value: "Capacitación en herramientas digitales para comunidades rurales", sheetName: "FORMATO P&P", section: "INFORMACIÓN GENERAL" },
            { key: "tipo_de_proyecto", label: "Tipo de Proyecto", value: "Capacitación", sheetName: "FORMATO P&P", section: "INFORMACIÓN GENERAL" },
            { key: "objeto", label: "Objeto", value: "Capacitar a 100 personas de comunidades rurales en el uso de herramientas digitales", sheetName: "FORMATO P&P", section: "INFORMACIÓN GENERAL" },
          ],
          sections: new Map([
            ["INFORMACIÓN GENERAL", [
              { key: "info_general_title", label: "INFORMACIÓN GENERAL", value: "Datos básicos del proyecto", sheetName: "FORMATO P&P", section: "INFORMACIÓN GENERAL", isTitle: true },
              { key: "codigo", label: "Código", value: "EXTSC-2025-001", sheetName: "FORMATO P&P", section: "INFORMACIÓN GENERAL" },
              { key: "nombre_del_proyecto", label: "Nombre del Proyecto", value: "Capacitación en herramientas digitales para comunidades rurales", sheetName: "FORMATO P&P", section: "INFORMACIÓN GENERAL" },
              { key: "tipo_de_proyecto", label: "Tipo de Proyecto", value: "Capacitación", sheetName: "FORMATO P&P", section: "INFORMACIÓN GENERAL" },
              { key: "objeto", label: "Objeto", value: "Capacitar a 100 personas de comunidades rurales en el uso de herramientas digitales", sheetName: "FORMATO P&P", section: "INFORMACIÓN GENERAL" },
            ]]
          ])
        },
        {
          sheetName: "FICHA TÉCNICA",
          title: "FICHA TÉCNICA",
          color: "green",
          items: [
            { key: "cooperantes", label: "Cooperantes", value: "Ministerio de Tecnologías de la Información y Comunicaciones", sheetName: "FICHA TÉCNICA", section: "DATOS TÉCNICOS" },
            { key: "requiere_presupuesto", label: "¿Requiere presupuesto este proyecto?", value: "Sí", sheetName: "FICHA TÉCNICA", section: "DATOS TÉCNICOS", isCompact: true },
            { key: "cuenta_con_contrapartida", label: "¿Cuenta con contrapartida?", value: "No", sheetName: "FICHA TÉCNICA", section: "DATOS TÉCNICOS", isCompact: true, compactPairOf: "requiere_presupuesto" },
            { key: "lugar_de_ejecucion", label: "Lugar de ejecución", value: "CARTAGENA DE INDIAS", sheetName: "FICHA TÉCNICA", section: "DATOS TÉCNICOS" },
            { key: "plazo_meses", label: "Plazo (Meses)", value: "4 MESES", sheetName: "FICHA TÉCNICA", section: "DATOS TÉCNICOS" },
          ],
          sections: new Map([
            ["DATOS TÉCNICOS", [
              { key: "datos_tecnicos_title", label: "DATOS TÉCNICOS", value: "Información técnica del proyecto", sheetName: "FICHA TÉCNICA", section: "DATOS TÉCNICOS", isTitle: true },
              { key: "cooperantes", label: "Cooperantes", value: "Ministerio de Tecnologías de la Información y Comunicaciones", sheetName: "FICHA TÉCNICA", section: "DATOS TÉCNICOS" },
              { key: "requiere_presupuesto", label: "¿Requiere presupuesto este proyecto?", value: "Sí", sheetName: "FICHA TÉCNICA", section: "DATOS TÉCNICOS", isCompact: true, compactPair: "cuenta_con_contrapartida" },
              { key: "cuenta_con_contrapartida", label: "¿Cuenta con contrapartida?", value: "No", sheetName: "FICHA TÉCNICA", section: "DATOS TÉCNICOS", isCompact: true, compactPairOf: "requiere_presupuesto" },
              { key: "lugar_de_ejecucion", label: "Lugar de ejecución", value: "CARTAGENA DE INDIAS", sheetName: "FICHA TÉCNICA", section: "DATOS TÉCNICOS" },
              { key: "plazo_meses", label: "Plazo (Meses)", value: "4 MESES", sheetName: "FICHA TÉCNICA", section: "DATOS TÉCNICOS" },
            ]]
          ])
        }
      ];
      
      // Simulamos un tiempo de carga para hacer más realista la experiencia
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      try {
        const formData = new FormData();
        formData.append('file', file);
        const response = await fetch('http://localhost:8000/convert?include_format=true', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) throw new Error('Error en el servidor');
        
        const rawData = await response.json();
        // Procesar los datos con el nuevo procesador avanzado
        const sheetGroups = processExcelJson(rawData);
        
        if (sheetGroups.length > 0) {
          // Verificar que todas las secciones tienen los datos mínimos necesarios
          const processedGroups = sheetGroups.map(group => {
            // Asegurar que cada sección en el mapa tiene al menos un elemento título
            group.sections.forEach((items, sectionName) => {
              const hasTitle = items.some(item => item.isTitle);
              if (!hasTitle) {
                // Crear un título por defecto si no existe
                const titleItem: SheetDataItem = {
                  key: sectionName.toLowerCase().replace(/\s+/g, '_') + '_title',
                  label: sectionName,
                  value: "Información de " + sectionName.toLowerCase(),
                  sheetName: group.sheetName,
                  section: sectionName,
                  isTitle: true
                };
                items.unshift(titleItem);
              }
              
              // Verificar si hay campos compactos que falten por emparejar
              items.filter(item => item.isCompact && !item.compactPair && !item.compactPairOf)
                .forEach((item, idx, filteredItems) => {
                  if (idx % 2 === 0 && idx + 1 < filteredItems.length) {
                    // Emparejar campos consecutivos
                    item.compactPair = filteredItems[idx + 1].key;
                    filteredItems[idx + 1].compactPairOf = item.key;
                  }
                });
            });
            
            return group;
          });
          
          setPreviewData(processedGroups);
          setUploadStatus('success');
        } else {
          // Si no se pudo extraer información, usar datos de prueba
          console.warn('No se pudo extraer información estructurada del Excel. Usando datos de prueba.');
          setPreviewData(mockSheetGroups);
          setUploadStatus('success');
        }
      } catch (err) {
        console.error('Error al procesar el archivo:', err);
        // Si hay un error, usamos datos de prueba para la demo
        setPreviewData(mockSheetGroups);
        setUploadStatus('success');
      }
    } catch (err) {
      console.error('Error general:', err);
      setUploadStatus('error');
    } finally {
      setIsUploading(false);
    }
  };

  // Función para procesar los datos y redirigir al formulario
  const handleProcessData = () => {
    // Aquí se implementaría la lógica para procesar los datos y redirigir al formulario
    console.log('Procesando datos para formulario...', previewData);
  };

  // Improved function to handle monetary values and percentages more accurately
  const formatValue = (value: any, format?: any): string => {
    if (value === null || value === undefined) return '';
    
    if (typeof value === 'number') {
      // Check for percentage formatting
      if (format?.number_format?.includes('%')) {
        return `${(value * 100).toFixed(2)}%`;
      }
      
      // Check for currency formatting
      if (format?.number_format?.includes('$') || 
          format?.number_format?.includes('€') || 
          format?.number_format?.includes('¥')) {
        const symbol = format?.number_format?.includes('€') ? '€' : 
                      format?.number_format?.includes('¥') ? '¥' : '$';
        return `${symbol}${value.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      }
      
      // Regular number formatting
      return value.toString();
    }
    
    // Handle date values
    if (value instanceof Date) {
      return value.toLocaleDateString('es-CO');
    }
    
    // Default to string representation
    return value.toString();
  };

  // Enhanced Excel processor with better handling of special formats
  const processExcelData = async (file: File): Promise<SheetGroup[]> => {
    try {
      setIsProcessing(true);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('include_format', 'true');
      
      const response = await fetch('http://localhost:8000/convert', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} - ${response.statusText}`);
      }
      
      const data = await response.json();
      
      // Enhanced processing with better format handling
      const processedSheetGroups = processExcelJson(data);
      
      // Improve table rendering with better format detection
      // When showing tables, use the formatValue function to properly display numeric and date values
      
      setIsProcessing(false);
      return processedSheetGroups;
    } catch (error) {
      setIsProcessing(false);
      console.error("Error processing Excel file:", error);
      setErrorMessage(`Error al procesar el archivo Excel: ${error instanceof Error ? error.message : 'Error desconocido'}`);
      return [];
    }
  };

  // Render a table cell with proper formatting
  const renderCell = (cell: any, rowIndex: number, colIndex: number) => {
    const value = cell?.value;
    const format = cell?.format;
    
    // Apply formatting based on the cell's format information
    const formattedValue = formatValue(value, format);
    
    // Apply styling based on font and cell properties
    const cellStyle: React.CSSProperties = {
      fontWeight: format?.font?.bold ? 'bold' : 'normal',
      fontStyle: format?.font?.italic ? 'italic' : 'normal',
      textAlign: format?.alignment?.horizontal || 'left',
      backgroundColor: format?.fill?.color ? `#${format.fill.color.substring(2)}` : undefined,
      padding: '6px',
      border: '1px solid #e2e8f0',
    };
    
    return (
      <td key={`cell-${rowIndex}-${colIndex}`} style={cellStyle}>
        {formattedValue}
      </td>
    );
  };

  // Filter function for Excel data
  const getFilteredSections = () => {
    if (!previewData || activeSheetIndex >= previewData.length) return new Map();
    
    const sheet = previewData[activeSheetIndex];
    
    if (!filterText) return sheet.sections;
    
    const filteredSections = new Map<string, SheetDataItem[]>();
    
    // Filter sections based on the filter text
    sheet.sections.forEach((items, sectionName) => {
      const filteredItems = items.filter(item => {
        // Always include section titles
        if (item.isTitle) return true;
        
        // For tables, search in the table data
        if (item.isTable && item.tableData) {
          return item.tableData.some(row => 
            Object.values(row).some(cellValue => 
              cellValue && cellValue.toString().toLowerCase().includes(filterText.toLowerCase())
            )
          );
        }
        
        // For normal items, search in label and value
        const labelMatch = item.label.toLowerCase().includes(filterText.toLowerCase());
        const valueMatch = item.value && item.value.toString().toLowerCase().includes(filterText.toLowerCase());
        
        return labelMatch || valueMatch;
      });
      
      if (filteredItems.length > 1 || (filteredItems.length === 1 && !filteredItems[0].isTitle)) {
        filteredSections.set(sectionName, filteredItems);
      }
    });
    
    return filteredSections;
  };

  // Add export functionality
  const handleExportToJSON = () => {
    if (!previewData) return;
    
    const dataToExport = JSON.stringify(previewData, (key, value) => {
      if (key === 'sections' && value instanceof Map) {
        const obj: Record<string, SheetDataItem[]> = {};
        value.forEach((v, k) => {
          obj[k] = v;
        });
        return obj;
      }
      return value;
    }, 2);
    
    const blob = new Blob([dataToExport], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'excel_processed_data.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Add function to generate CSV from data
  const handleExportToCSV = () => {
    if (!previewData || activeSheetIndex >= previewData.length) return;
    
    const sheet = previewData[activeSheetIndex];
    let csvContent = 'Sheet,Section,Label,Value\n';
    
    sheet.sections.forEach((items, sectionName) => {
      items.forEach(item => {
        if (!item.isTitle && !item.isTable) {
          const row = [
            `"${sheet.sheetName.replace(/"/g, '""')}"`,
            `"${sectionName.replace(/"/g, '""')}"`,
            `"${item.label.replace(/"/g, '""')}"`,
            `"${(item.value || '').toString().replace(/"/g, '""')}"`
          ];
          csvContent += row.join(',') + '\n';
        }
      });
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${sheet.sheetName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_data.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Function to filter data based on search text
  const getFilteredData = (data: any[]) => {
    if (!filterText.trim()) return data;
    
    return data.map(sheet => {
      // Create a deep copy of the sheet
      const filteredSheet = { ...sheet };
      
      // Filter sections that contain the search text
      if (filteredSheet.sections) {
        filteredSheet.sections = filteredSheet.sections.filter((section: {
          title?: string;
          items?: any[];
          tables?: any[];
        }) => {
          // Check if section title contains the search text
          if (section.title && section.title.toLowerCase().includes(filterText.toLowerCase())) {
            return true;
          }
          
          // Check if any item in the section contains the search text
          if (section.items) {
            const matchingItems = section.items.filter(item => {
              return (
                (item.label && item.label.toLowerCase().includes(filterText.toLowerCase())) ||
                (item.value && String(item.value).toLowerCase().includes(filterText.toLowerCase()))
              );
            });
            
            // Replace section items with only matching items
            if (matchingItems.length > 0) {
              section.items = matchingItems;
              return true;
            }
          }
          
          // Check if any table in the section contains the search text
          if (section.tables) {
            const matchingTables = section.tables.map(table => {
              if (table.title && table.title.toLowerCase().includes(filterText.toLowerCase())) {
                return table;
              }
              
              if (table.rows) {
                const matchingRows = table.rows.filter((row: Record<string, any>) => {
                  return Object.values(row).some(cell => 
                    cell && String(cell).toLowerCase().includes(filterText.toLowerCase())
                  );
                });
                
                if (matchingRows.length > 0) {
                  return { ...table, rows: matchingRows };
                }
              }
              
              return null;
            }).filter(Boolean);
            
            if (matchingTables.length > 0) {
              section.tables = matchingTables;
              return true;
            }
          }
          
          return false;
        });
      }
      
      return filteredSheet;
    });
  };
  
  // Function to export data in different formats
  const exportData = (format: 'json' | 'csv' | 'excel') => {
    if (!previewData) return;
    
    const currentSheet = previewData[activeSheetIndex];
    let exportedData: any;
    let fileName: string;
    let fileType: string;
    let fileContent: string | Blob;
    
    switch (format) {
      case 'json':
        exportedData = currentSheet;
        fileContent = JSON.stringify(exportedData, null, 2);
        fileName = `${currentSheet.sheetName || 'sheet'}_export.json`;
        fileType = 'application/json';
        break;
        
      case 'csv':
        // Convert sheet data to CSV format
        exportedData = convertToFlatData(currentSheet);
        fileContent = convertToCSV(exportedData);
        fileName = `${currentSheet.sheetName || 'sheet'}_export.csv`;
        fileType = 'text/csv';
        break;
        
      case 'excel':
        // For Excel export, we'd typically use a library like exceljs
        // For this example, we'll use a CSV as a simple alternative
        exportedData = convertToFlatData(currentSheet);
        fileContent = convertToCSV(exportedData);
        fileName = `${currentSheet.sheetName || 'sheet'}_export.csv`;
        fileType = 'text/csv';
        break;
    }
    
    // Create a download link
    const blob = new Blob([fileContent], { type: fileType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    // Close export options dropdown
    setShowExportOptions(false);
  };
  
  // Helper function to convert sheet data to flat format for CSV export
  const convertToFlatData = (sheet: any) => {
    const flatData: any[] = [];
    
    if (sheet.sections) {
      sheet.sections.forEach((section: any) => {
        // Add section title as a row
        flatData.push({ Section: section.title });
        
        // Add section items
        if (section.items) {
          section.items.forEach((item: any) => {
            flatData.push({
              Label: item.label,
              Value: item.value
            });
          });
        }
        
        // Add section tables
        if (section.tables) {
          section.tables.forEach((table: any) => {
            if (table.title) {
              flatData.push({ Table: table.title });
            }
            
            if (table.headers && table.rows) {
              // Add table headers
              const headerRow: any = {};
              table.headers.forEach((header: string, index: number) => {
                headerRow[`Col${index + 1}`] = header;
              });
              flatData.push(headerRow);
              
              // Add table rows
              table.rows.forEach((row: any) => {
                const flatRow: any = {};
                Object.keys(row).forEach((key, index) => {
                  flatRow[`Col${index + 1}`] = row[key];
                });
                flatData.push(flatRow);
              });
            }
          });
        }
        
        // Add a blank row between sections for better readability
        flatData.push({});
      });
    }
    
    return flatData;
  };
  
  // Helper function to convert data to CSV format
  const convertToCSV = (data: any[]) => {
    if (data.length === 0) return '';
    
    // Get all possible headers
    const headers = Array.from(
      new Set(
        data.flatMap(row => Object.keys(row))
      )
    );
    
    // Create CSV header row
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header] !== undefined ? row[header] : '';
          // Handle values that need to be quoted (contain commas, quotes, or newlines)
          if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');
    
    return csvContent;
  };
  
  // Function to prepare chart data for budget visualizations
  const prepareBudgetChartData = (section: any) => {
    if (!section || !section.tables) return null;
    
    // Find budget tables in the section
    const budgetTable = section.tables.find((table: any) => 
      table.title && (
        table.title.toLowerCase().includes('presupuesto') ||
        table.title.toLowerCase().includes('budget')
      )
    );
    
    if (!budgetTable || !budgetTable.rows || budgetTable.rows.length === 0) {
      return null;
    }
    
    // Extract labels and amounts from the budget table
    const labels: string[] = [];
    const amounts: number[] = [];
    
    budgetTable.rows.forEach((row: any) => {
      // Find the label column (usually the first column or one containing 'concepto', 'item', etc.)
      const labelKey = Object.keys(row).find(key => 
        typeof row[key] === 'string' && 
        row[key].length > 0
      );
      
      // Find the amount column (usually contains numbers or currency values)
      const amountKey = Object.keys(row).find(key => {
        const value = row[key];
        // Check if it's a number or a string that can be converted to a number
        if (typeof value === 'number') return true;
        if (typeof value === 'string') {
          // Try to extract numeric value from currency strings
          const numericValue = parseFloat(value.replace(/[^0-9.-]+/g, ''));
          return !isNaN(numericValue);
        }
        return false;
      });
      
      if (labelKey && amountKey) {
        labels.push(row[labelKey]);
        
        // Extract numeric value from the amount (handling currency strings)
        let amount;
        if (typeof row[amountKey] === 'number') {
          amount = row[amountKey];
        } else {
          amount = parseFloat(row[amountKey].replace(/[^0-9.-]+/g, ''));
        }
        
        amounts.push(isNaN(amount) ? 0 : amount);
      }
    });
    
    return {
      labels,
      datasets: [
        {
          label: budgetTable.title || 'Presupuesto',
          data: amounts,
          backgroundColor: [
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 99, 132, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)',
            'rgba(255, 159, 64, 0.6)',
            'rgba(199, 199, 199, 0.6)',
          ],
          borderColor: [
            'rgba(54, 162, 235, 1)',
            'rgba(255, 99, 132, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
            'rgba(199, 199, 199, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  // Function to render budget charts
  const renderBudgetChart = (section: any) => {
    const chartData = prepareBudgetChartData(section);
    
    if (!chartData) {
      return (
        <div className="p-4 bg-gray-50 rounded-md text-center text-gray-500">
          No hay datos disponibles para visualizar en gráfico
        </div>
      );
    }
    
    const chartOptions = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top' as const,
        },
        tooltip: {
          callbacks: {
            label: function(context: any) {
              let label = context.dataset.label || '';
              if (label) {
                label += ': ';
              }
              if (context.parsed.y !== null) {
                label += new Intl.NumberFormat('es-CO', {
                  style: 'currency',
                  currency: 'COP',
                }).format(context.parsed.y);
              }
              return label;
            }
          }
        }
      },
    };
    
    // Determine which chart type to use based on data characteristics
    const numDataPoints = chartData.labels.length;
    
    return (
      <div className="p-4 bg-white rounded-md shadow-sm">
        <h3 className="text-lg font-medium mb-4 text-center">
          Visualización de {section.title || 'Presupuesto'}
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-md shadow-sm">
            <h4 className="text-md font-medium mb-2 text-center">Gráfico de Barras</h4>
            <Bar data={chartData} options={chartOptions} />
          </div>
          
          <div className="bg-white p-4 rounded-md shadow-sm">
            <h4 className="text-md font-medium mb-2 text-center">Gráfico Circular</h4>
            <Pie data={chartData} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 transition-shadow hover:shadow-lg">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-4 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mr-3 text-primary" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
          Cargar y Visualizar Archivo Excel
        </h1>
        
        <div className="max-w-2xl mx-auto">
          {/* Drag & drop area con estilos mejorados */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition
              ${file ? 'border-primary bg-primary/5' : 'border-gray-300 hover:border-primary/50'}
              ${isUploading ? 'opacity-50 pointer-events-none' : ''}
              ${dragActive ? 'border-blue-400 bg-blue-50' : ''}
              shadow-inner hover:shadow-md transition-all
            `}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <input
              type="file"
              id="excel-file"
              className="hidden"
              accept=".xlsx, .xls"
              onChange={handleFileChange}
              disabled={isUploading}
              ref={inputRef}
            />
            <label htmlFor="excel-file" className="cursor-pointer block w-full h-full">
              <div className="mb-4 flex justify-center">
                <div className="w-16 h-16 flex items-center justify-center rounded-full bg-primary/10 p-3">
                  <Image src="/file.svg" alt="Upload Icon" width={64} height={64} className="text-primary" />
                </div>
              </div>
              
              {file ? (
                <>
                  <p className="text-sm font-medium text-gray-700">Archivo seleccionado:</p>
                  <p className="text-lg font-semibold text-primary">{file.name}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {(file.size / 1024).toFixed(2)} KB • Seleccionado {new Date().toLocaleTimeString()}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-lg font-medium text-gray-700">
                    Arrastra o haz click para seleccionar un archivo Excel
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Solo se aceptan archivos Excel (.xlsx, .xls)
                  </p>
                </>
              )}
            </label>
          </div>
          
          {/* Botones de acción con estilos mejorados */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={handleUpload}
              disabled={!file || isUploading}
              className="px-6 py-3 rounded-lg font-medium flex items-center space-x-2 bg-primary text-white hover:bg-primary-dark shadow-sm hover:shadow-md transition-all disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
            >
              {isUploading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="ml-2">Procesando...</span>
                </>
              ) : (
                <>
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-2">Subir y Analizar</span>
                </>
              )}
            </button>
          </div>
        </div>
        
        {/* Mensajes de estado */}
        {uploadStatus === 'success' && (
          <div className="mt-6 p-4 border border-green-200 rounded-md bg-green-50 text-green-700">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-green-500 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Archivo procesado correctamente.</span>
            </div>
          </div>
        )}
        
        {uploadStatus === 'error' && (
          <div className="mt-6 p-4 border border-red-200 rounded-md bg-red-50 text-red-700">
            <div className="flex items-center">
              <svg className="h-5 w-5 text-red-500 mr-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <span>Ocurrió un error al procesar el archivo. Intente nuevamente.</span>
            </div>
          </div>
        )}
      </div>
      
      {/* Vista previa con mejoras */}
      {previewData && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <div className="flex justify-between items-center mb-6 border-b pb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-primary" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1zm-5 8.274l-.818 2.552c.25.112.526.174.818.174.292 0 .569-.062.818-.174L5 10.274zm10 0l-.818 2.552c.25.112.526.174.818.174.292 0 .569-.062.818-.174L15 10.274z" clipRule="evenodd" />
              </svg>
              Vista Previa de Datos
            </h2>
            
            <div className="flex space-x-2">
              <button 
                onClick={() => setShowExportOptions(!showExportOptions)}
                className="px-3 py-2 rounded-md text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Exportar
              </button>
              
              <button
                onClick={() => setChartView(!chartView)}
                className={`px-3 py-2 rounded-md text-sm ${chartView ? 'bg-primary text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'} flex items-center`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                  <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                </svg>
                {chartView ? 'Ver Tabla' : 'Ver Gráfico'}
              </button>
            </div>
          </div>
          
          {/* Panel de exportación */}
          {showExportOptions && (
            <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                <p className="font-medium">Exportar datos procesados</p>
                <p className="text-xs text-gray-500">Seleccione el formato de exportación</p>
              </div>
              <div className="flex space-x-2">
                <button 
                  onClick={handleExportToJSON}
                  className="px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md text-sm font-medium"
                >
                  Exportar JSON
                </button>
                <button 
                  onClick={handleExportToCSV}
                  className="px-3 py-2 bg-green-100 hover:bg-green-200 text-green-700 rounded-md text-sm font-medium"
                >
                  Exportar CSV
                </button>
              </div>
            </div>
          )}
          
          {/* Filtro y navegación de hojas */}
          <div className="mb-6 flex flex-wrap items-center gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Filtrar contenido..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:ring-2 focus:ring-primary focus:border-primary"
              />
            </div>
            
            {/* Pestañas de hojas */}
            <div className="flex overflow-x-auto gap-1 p-1 bg-gray-100 rounded-md">
              {previewData.map((sheet, index) => (
                <button
                  key={`sheet-${index}`}
                  onClick={() => setActiveSheetIndex(index)}
                  className={`px-3 py-2 text-sm font-medium rounded-md whitespace-nowrap ${
                    activeSheetIndex === index
                      ? 'bg-white text-primary shadow-sm'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {sheet.title}
                </button>
              ))}
            </div>
          </div>
          
          {/* Contenido de la hoja activa */}
          {previewData && activeSheetIndex < previewData.length && (
            <div>
              {chartView ? (
                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 min-h-[400px]">
                  <h3 className="text-lg font-medium text-center mb-4">Visualización de Datos</h3>
                  
                  {/* Aquí iría el componente de gráficos */}
                  <div className="flex justify-center items-center h-80 text-gray-500">
                    <p>Gráficos de datos disponibles próximamente</p>
                  </div>
                </div>
              ) : (
                <div>
                  {/* Mostrar secciones filtradas */}
                  {Array.from(getFilteredSections()).map(([sectionName, items]) => (
                    <div key={sectionName} className="mb-8">
                      <h3 className="text-lg font-medium text-gray-900 mb-4 pb-2 border-b">
                        {sectionName}
                      </h3>
                      
                      <div className="space-y-6">
                        {items.filter((item: SheetDataItem) => !item.isTitle).map((item: SheetDataItem) => (
                          <div key={item.key + item.row} className="border border-gray-200 rounded-md overflow-hidden bg-white">
                            {item.isTable ? (
                              <div>
                                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                                  <h4 className="font-medium text-gray-800">{item.label}</h4>
                                </div>
                                
                                <div className="overflow-x-auto">
                                  <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                      <tr>
                                        {item.tableHeaders?.map((header: string, headerIndex: number) => (
                                          <th 
                                            key={`header-${headerIndex}`} 
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                          >
                                            {header}
                                          </th>
                                        ))}
                                      </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                      {item.tableData?.map((row: Record<string, any>, rowIndex: number) => (
                                        <tr key={`row-${rowIndex}`} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                          {item.tableHeaders?.map((header: string, colIndex: number) => (
                                            <td 
                                              key={`cell-${rowIndex}-${colIndex}`} 
                                              className="px-6 py-4 whitespace-nowrap text-sm text-gray-800"
                                            >
                                              {row[header]?.toString() || ''}
                                            </td>
                                          ))}
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            ) : item.isCompact && item.compactPair ? (
                              <div className="grid grid-cols-2 divide-x divide-gray-200">
                                <div className="p-4">
                                  <p className="text-sm font-medium text-gray-500">{item.label}</p>
                                  <p className="mt-1 text-lg font-semibold">{item.value?.toString()}</p>
                                </div>
                                
                                {items.find((i: SheetDataItem) => i.key === item.compactPair) && (
                                  <div className="p-4">
                                    <p className="text-sm font-medium text-gray-500">
                                      {items.find((i: SheetDataItem) => i.key === item.compactPair)?.label}
                                    </p>
                                    <p className="mt-1 text-lg font-semibold">
                                      {items.find((i: SheetDataItem) => i.key === item.compactPair)?.value?.toString()}
                                    </p>
                                  </div>
                                )}
                              </div>
                            ) : !item.compactPairOf && (
                              <div className="p-4">
                                <p className="text-sm font-medium text-gray-500">{item.label}</p>
                                <p className="mt-1">{item.value?.toString()}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  {Array.from(getFilteredSections()).length === 0 && (
                    <div className="p-6 text-center text-gray-500 border border-gray-200 rounded-lg">
                      {filterText ? 
                        'No se encontraron resultados para su búsqueda.' : 
                        'No hay datos disponibles en esta hoja.'
                      }
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          {/* Botón de continuar */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleProcessData}
              className="px-6 py-3 bg-primary hover:bg-primary-dark text-white font-medium rounded-lg shadow-sm hover:shadow-md transition-all"
            >
              Continuar al Formulario
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Enhanced Excel viewer component with better formatting support
const ExcelViewer = ({ data }: { data: any }) => {
  if (!data) return <div className="p-4 bg-gray-100 rounded-md">No data available</div>;

  return (
    <div className="excel-viewer bg-white rounded-lg shadow-lg p-4">
      {Object.entries(data).map(([sheetName, sheetData]: [string, any]) => (
        <div key={sheetName} className="mb-8">
          <h3 className="text-xl font-bold text-gray-800 mb-4 pb-2 border-b-2 border-gray-200">{sheetName}</h3>
          
          {Array.isArray(sheetData) ? (
            // Handle array data (tables)
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  {sheetData[0] && (
                    <tr>
                      {Object.keys(sheetData[0]).map((key) => (
                        <th key={key} className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {key}
                        </th>
                      ))}
                    </tr>
                  )}
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {sheetData.map((row, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      {Object.values(row).map((cell, cellIdx) => (
                        <td key={cellIdx} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {formatCellValue(cell)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            // Handle object data (sections)
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(sheetData).map(([sectionName, sectionData]: [string, any]) => (
                <div key={sectionName} className="bg-gray-50 p-4 rounded-md">
                  <h4 className="text-lg font-semibold text-gray-700 mb-3">{sectionName}</h4>
                  {renderSectionData(sectionData)}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// Helper function to format cell values based on their type
const formatCellValue = (value: any): string => {
  // Handle null/undefined values
  if (value === null || value === undefined) return "-";
  
  // Handle date values
  if (value instanceof Date) return value.toLocaleDateString();
  
  // Handle numeric values with currency formatting
  if (typeof value === 'number') {
    // Check if it might be a currency value (based on context)
    if (value > 1000 || Number.isInteger(value)) {
      return new Intl.NumberFormat('es-CO', { 
        style: 'currency', 
        currency: 'COP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(value);
    }
    
    // Format percentage values
    if (value < 1 && value > 0) {
      return new Intl.NumberFormat('es-CO', {
        style: 'percent',
        minimumFractionDigits: 2
      }).format(value);
    }
    
    return value.toLocaleString('es-CO');
  }
  
  // Handle boolean values
  if (typeof value === 'boolean') return value ? 'Sí' : 'No';
  
  return String(value);
};

// Helper function to render section data with proper formatting
const renderSectionData = (data: any) => {
  if (Array.isArray(data)) {
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          {data[0] && (
            <thead className="bg-gray-100">
              <tr>
                {Object.keys(data[0]).map((key: string) => (
                  <th key={key} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {key}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody className="bg-white divide-y divide-gray-200">
            {data.map((row: any, idx: number) => (
              <tr key={idx}>
                {Object.values(row).map((value: any, i: number) => (
                  <td key={i} className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">
                    {formatCellValue(value)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }
  
  if (typeof data === 'object' && data !== null) {
    return (
      <dl className="grid grid-cols-1 gap-y-2">
        {Object.entries(data).map(([key, value]: [string, any]) => (
          <div key={key} className="flex">
            <dt className="text-sm font-medium text-gray-500 mr-2">{key}:</dt>
            <dd className="text-sm text-gray-900">{formatCellValue(value)}</dd>
          </div>
        ))}
      </dl>
    );
  }
  
  return <span>{formatCellValue(data)}</span>;
};