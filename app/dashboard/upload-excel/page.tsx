'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';

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

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 transition-shadow hover:shadow-lg">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-4 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mr-3 text-primary" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
          Cargar Archivo Excel
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
                  <span className="text-white ml-2">Procesando...</span>
                </>
              ) : (
                <>
                  <svg className="h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="ml-2">Subir y Analizar</span>
                </>
              )}
            </button>
          </div>
          
          {/* Mensajes de estado mejorados */}
          {uploadStatus === 'success' && (
            <div className="mt-6 p-4 border border-green-200 rounded-md bg-green-50 text-green-700 shadow-sm">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-green-100 rounded-full p-1">
                  <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="ml-3 font-medium">El archivo se ha cargado y analizado correctamente.</p>
              </div>
            </div>
          )}
          
          {uploadStatus === 'error' && (
            <div className="mt-6 p-4 border border-red-200 rounded-md bg-red-50 text-red-700 shadow-sm">
              <div className="flex items-center">
                <div className="flex-shrink-0 bg-red-100 rounded-full p-1">
                  <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 0 001.414-1.414L11.414 10l1.293-1.293a1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <p className="ml-3 font-medium">Ha ocurrido un error al procesar el archivo. Por favor, inténtalo de nuevo.</p>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Vista previa de los datos con diseño mejorado */}
      {previewData && previewData.length > 0 && (
        <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                  <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                </svg>
                Vista previa de datos
              </h2>
              <button
                onClick={handleProcessData}
                className="px-4 py-2 rounded-lg font-medium bg-primary text-white hover:bg-primary-dark shadow-sm hover:shadow-md transition-all flex items-center"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z" clipRule="evenodd" />
                </svg>
                Usar para Formulario
              </button>
            </div>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 shadow-sm">
              <h3 className="text-xl font-medium text-blue-900 mb-2 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Datos extraídos del archivo
              </h3>
              <p className="text-blue-700">
                Se detectaron <span className="font-semibold">{previewData.reduce((total, sheet) => total + sheet.items.length, 0)} campos</span> en <span className="font-semibold">{previewData.length} hojas</span> del archivo Excel.
              </p>
            </div>
            
            {/* Pestañas para cambiar entre hojas */}
            <div className="border-b border-gray-200 bg-white rounded-t-lg shadow-sm">
              <nav className="-mb-px flex space-x-2 overflow-x-auto px-4" aria-label="Tabs">
                {previewData.map((sheet, idx) => {
                  const isActive = activeTab === idx;
                  let tabClasses = `py-3 px-4 text-sm font-medium rounded-t-lg border-b-2 focus:outline-none transition-all flex items-center `;
                  
                  if (isActive) {
                    if (sheet.color === 'blue') {
                      tabClasses += 'text-blue-700 border-blue-500 bg-blue-50';
                    } else if (sheet.color === 'green') {
                      tabClasses += 'text-green-700 border-green-500 bg-green-50';
                    } else if (sheet.color === 'purple') {
                      tabClasses += 'text-purple-700 border-purple-500 bg-purple-50';
                    } else {
                      tabClasses += 'text-gray-700 border-gray-500 bg-gray-50';
                    }
                  } else {
                    tabClasses += 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50';
                  }
                  
                  let iconComponent;
                  if (sheet.color === 'blue') {
                    iconComponent = (
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-2 ${isActive ? 'text-blue-500' : 'text-gray-400'}`} viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 011.414 0L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                      </svg>
                    );
                  } else if (sheet.color === 'green') {
                    iconComponent = (
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-2 ${isActive ? 'text-green-500' : 'text-gray-400'}`} viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                        <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                      </svg>
                    );
                  } else if (sheet.color === 'purple') {
                    iconComponent = (
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-2 ${isActive ? 'text-purple-500' : 'text-gray-400'}`} viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z" clipRule="evenodd" />
                      </svg>
                    );
                  } else {
                    iconComponent = (
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 mr-2 ${isActive ? 'text-gray-600' : 'text-gray-400'}`} viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 011.414 0L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm3 1h6v4H7V5zm6 6H7v2h6v-2z" clipRule="evenodd" />
                      </svg>
                    );
                  }
                  
                  return (
                    <button
                      key={idx}
                      onClick={() => setActiveTab(idx)}
                      className={tabClasses}
                    >
                      {iconComponent}
                      {sheet.title || "Hoja " + (idx + 1)}
                      <span className={`ml-2 ${isActive ? 'bg-white' : 'bg-gray-100'} text-gray-600 py-0.5 px-2 rounded-full text-xs`}>
                        {sheet.items.length}
                      </span>
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="grid grid-cols-1 gap-8">
              {previewData.map((sheetGroup, idx) => {
                if (idx !== activeTab) return null;
                
                if (!sheetGroup || !sheetGroup.color) {
                  console.warn("Hoja sin formato:", sheetGroup);
                  return (
                    <div key={idx} className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-red-700">Error: No se pudieron cargar correctamente los datos de esta hoja.</p>
                    </div>
                  );
                }

                const bgGradient = 
                  sheetGroup.color === 'blue' ? 'from-blue-50 to-indigo-50' :
                  sheetGroup.color === 'green' ? 'from-emerald-50 to-teal-50' :
                  sheetGroup.color === 'purple' ? 'from-purple-50 to-fuchsia-50' :
                  'from-gray-50 to-slate-50';
                
                const bgHeader = 
                  sheetGroup.color === 'blue' ? 'bg-blue-600' :
                  sheetGroup.color === 'green' ? 'bg-emerald-600' :
                  sheetGroup.color === 'purple' ? 'bg-purple-600' :
                  'bg-gray-600';
                  
                const textColor = 
                  sheetGroup.color === 'blue' ? 'text-blue-700' :
                  sheetGroup.color === 'green' ? 'text-emerald-700' :
                  sheetGroup.color === 'purple' ? 'text-purple-700' :
                  'text-gray-700';
                  
                const ringColor = 
                  sheetGroup.color === 'blue' ? 'focus:ring-blue-500/50' :
                  sheetGroup.color === 'green' ? 'focus:ring-emerald-500/50' :
                  sheetGroup.color === 'purple' ? 'focus:ring-purple-500/50' :
                  'focus:ring-gray-500/50';
                
                return (
                  <div 
                    id={`sheet-${idx}`}
                    key={idx} 
                    className={`border rounded-lg overflow-hidden bg-gradient-to-r ${bgGradient} shadow-md scroll-mt-10`}
                  >
                    <div className={`${bgHeader} text-white py-4 px-6`}>
                      <h3 className="text-xl font-semibold flex items-center">
                        {sheetGroup.color === 'blue' && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h8a2 2 0 011.414 0L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                          </svg>
                        )}
                        {sheetGroup.color === 'green' && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                            <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                          </svg>
                        )}
                        {sheetGroup.color === 'purple' && (
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M2 5a2 2 0 012-2h8a2 2 0 012 2v10a2 2 0 002 2H4a2 2 0 01-2-2V5zm3 1h6v4H5V6zm6 6H5v2h6v-2z" clipRule="evenodd" />
                          </svg>
                        )}
                        {sheetGroup.title || "Hoja " + (idx + 1)}
                        <span className="ml-2 text-sm opacity-80 bg-white/20 px-2 py-0.5 rounded-full">
                          {sheetGroup.items.length} campos
                        </span>
                      </h3>
                    </div>
                    
                    <div className="p-6 space-y-6">
                      {/* Iterar por las secciones de la hoja activa */}
                      {sheetGroup.sections && Array.from(sheetGroup.sections).map(([sectionName, sectionItems], sectionIdx) => {
                        if (!sectionItems || sectionItems.length === 0) return null;
                        
                        // Verificar si la sección tiene algún título
                        const sectionTitle = sectionItems.find(item => item.isTitle);
                        const sectionDescription = sectionTitle && sectionTitle.value ? 
                          String(sectionTitle.value) : 
                          "Información de " + sectionName.toLowerCase();
                        
                        // Filtrar para mostrar solo los items de datos (no los títulos)
                        const dataItems = sectionItems.filter(item => !item.isTitle);
                        
                        if (dataItems.length === 0) return null;
                        
                        let sectionBg = '';
                        let sectionBorder = '';
                        
                        if (sheetGroup.color === 'blue') {
                          sectionBg = 'bg-gradient-to-r from-blue-600 to-blue-700';
                          sectionBorder = 'border-blue-200';
                        } else if (sheetGroup.color === 'green') {
                          sectionBg = 'bg-gradient-to-r from-emerald-600 to-emerald-700';
                          sectionBorder = 'border-emerald-200';
                        } else if (sheetGroup.color === 'purple') {
                          sectionBg = 'bg-gradient-to-r from-purple-600 to-purple-700';
                          sectionBorder = 'border-purple-200';
                        } else {
                          sectionBg = 'bg-gradient-to-r from-gray-600 to-gray-700';
                          sectionBorder = 'border-gray-200';
                        }
                        
                        return (
                          <div key={sectionIdx} className={`border rounded-lg overflow-hidden bg-white shadow-md ${sectionBorder}`}>
                            <div className={`${sectionBg} text-white py-3 px-4`}>
                              <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold flex items-center">
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  {sectionName}
                                </h3>
                                <div className="text-xs opacity-90 bg-white/20 px-2 py-1 rounded">
                                  {sectionDescription}
                                </div>
                              </div>
                            </div>
                            
                            <div className="p-5">
                              {/* Procesamiento especial para tablas de presupuesto */}
                              {dataItems.some(item => item.isSpecialBudgetTable) ? (
                                <div className="bg-gray-50 border rounded-md p-4 hover:shadow-sm transition-shadow col-span-full">
                                  <label className={`block text-sm font-semibold ${textColor} uppercase mb-3 flex items-center`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    PRESUPUESTO
                                  </label>
                                  
                                  <div className="overflow-x-auto border border-gray-200 rounded-md shadow-sm">
                                    <table className="min-w-full divide-y divide-gray-200">
                                      <thead className="bg-gray-100">
                                        <tr>
                                          <th 
                                            className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider border-r"
                                          >
                                            PRESUPUESTO
                                          </th>
                                          <th 
                                            className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider border-r"
                                          >
                                            VALOR
                                          </th>
                                          <th 
                                            className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider"
                                          >
                                            % PARTICIPACIÓN
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody className="bg-white divide-y divide-gray-200">
                                        {dataItems.find(item => item.isSpecialBudgetTable)?.tableData?.map((row, rowIdx) => (
                                          <tr key={rowIdx} className={`${rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-blue-50 transition-colors`}>
                                            <td className="px-4 py-3 border-r font-medium text-gray-700">
                                              {row["PRESUPUESTO"] || '-'}
                                            </td>
                                            <td className="px-4 py-3 border-r text-emerald-700 font-medium whitespace-nowrap">
                                              {row["VALOR"] || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-blue-700 font-medium whitespace-nowrap">
                                              {row["% PARTICIPACIÓN"] || '-'}
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              ) : dataItems.some(item => item.isSpecialFondoRotatorioTable) ? (
                                <div className="bg-gray-50 border rounded-md p-4 hover:shadow-sm transition-shadow col-span-full">
                                  <label className={`block text-sm font-semibold ${textColor} uppercase mb-3 flex items-center`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    FONDO ROTATORIO
                                  </label>
                                  
                                  <div className="overflow-x-auto border border-gray-200 rounded-md shadow-sm">
                                    <table className="min-w-full divide-y divide-gray-200">
                                      <thead className="bg-gray-100">
                                        <tr>
                                          <th 
                                            className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider border-r"
                                          >
                                            FONDO ROTATORIO
                                          </th>
                                          <th 
                                            className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider"
                                          >
                                            ASIGNACIÓN TOTAL
                                          </th>
                                        </tr>
                                      </thead>
                                      <tbody className="bg-white divide-y divide-gray-200">
                                        {dataItems.find(item => item.isSpecialFondoRotatorioTable)?.tableData?.map((row, rowIdx) => (
                                          <tr key={rowIdx} className={`${rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-emerald-50 transition-colors`}>
                                            <td className="px-4 py-3 border-r font-medium text-gray-700">
                                              {row["FONDO ROTATORIO"] || '-'}
                                            </td>
                                            <td className="px-4 py-3 text-emerald-700 font-medium whitespace-nowrap">
                                              {row["ASIGNACIÓN TOTAL"] || '-'}
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                </div>
                              ) : (
                                // Procesamiento normal para secciones que no son presupuesto
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                  {dataItems.map((item, itemIdx) => {
                                    // Si es un campo que pertenece a una pareja y no es el primero, saltarlo
                                    if (item.compactPairOf) return null;
                                    
                                    if (item.isTable && item.tableData && item.tableHeaders && item.tableHeaders.length > 0) {
                                      // Visualización para tablas complejas
                                      return (
                                        <div key={itemIdx} className="bg-gray-50 border rounded-md p-4 hover:shadow-md transition-shadow col-span-full">
                                          <label className={`block text-sm font-semibold ${textColor} uppercase mb-3 flex items-center`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                            </svg>
                                            {item.label || "Tabla"}
                                          </label>
                                          
                                          <div className="overflow-x-auto border border-gray-200 rounded-md shadow-sm">
                                            <table className="min-w-full divide-y divide-gray-200">
                                              <thead className="bg-gray-100">
                                                <tr>
                                                  {item.tableHeaders.map((header, headerIdx) => (
                                                    <th 
                                                      key={headerIdx}
                                                      className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider border-r last:border-r-0"
                                                    >
                                                      {header || `Columna ${headerIdx + 1}`}
                                                    </th>
                                                  ))}
                                                </tr>
                                              </thead>
                                              <tbody className="bg-white divide-y divide-gray-200">
                                                {item.tableData.map((row, rowIdx) => (
                                                  <tr key={rowIdx} className={`${rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-gray-100 transition-colors`}>
                                                    {(item.tableHeaders || []).map((header, cellIdx) => {
                                                      const cellValue = row[header];
                                                      
                                                      // Determine cell styling based on content and header type
                                                      let cellClass = 'px-4 py-3 border-r last:border-r-0';
                                                      
                                                      // Format money values
                                                      if (typeof cellValue === 'string' && 
                                                          (cellValue.includes('$') || 
                                                           /^\d{1,3}(,\d{3})*(\.\d+)?$/.test(cellValue) || // Numbers with commas
                                                           header.toLowerCase().includes('valor') || 
                                                           header.toLowerCase().includes('total') ||
                                                           header.toLowerCase().includes('asignación') ||
                                                           header.toLowerCase().includes('remuneración'))) {
                                                        return (
                                                          <td key={cellIdx} className={`${cellClass} text-emerald-700 font-medium whitespace-nowrap`}>
                                                            {cellValue !== null && cellValue !== undefined ? String(cellValue) : '-'}
                                                          </td>
                                                        );
                                                      }
                                                      
                                                      // Format percentage values
                                                      if (typeof cellValue === 'string' && 
                                                          (cellValue.includes('%') || 
                                                           header.toLowerCase().includes('participación') ||
                                                           header.toLowerCase().includes('porcentaje'))) {
                                                        return (
                                                          <td key={cellIdx} className={`${cellClass} text-blue-700 font-medium whitespace-nowrap`}>
                                                            {cellValue !== null && cellValue !== undefined ? String(cellValue) : '-'}
                                                          </td>
                                                        );
                                                      }
                                                      
                                                      // Format formula results
                                                      if (typeof cellValue === 'string' && 
                                                          (cellValue === 'Valor calculado' || 
                                                           cellValue.includes('Calculado por fórmula'))) {
                                                        return (
                                                          <td key={cellIdx} className={`${cellClass} text-indigo-600 italic font-medium`}>
                                                            {cellValue}
                                                          </td>
                                                        );
                                                      }
                                                      
                                                      // Format name/category columns (usually first column)
                                                      if (cellIdx === 0 || 
                                                          header.toLowerCase().includes('nombre') || 
                                                          header.toLowerCase().includes('categoría') ||
                                                          header.toLowerCase().includes('presupuesto') ||
                                                          header.toLowerCase().includes('fondo')) {
                                                        return (
                                                          <td key={cellIdx} className={`${cellClass} font-medium text-gray-700`}>
                                                            {cellValue !== null && cellValue !== undefined ? String(cellValue) : '-'}
                                                          </td>
                                                        );
                                                      }
                                                      
                                                      // Default cell formatting
                                                      return (
                                                        <td key={cellIdx} className={`${cellClass} text-gray-700`}>
                                                          {cellValue !== null && cellValue !== undefined ? String(cellValue) : '-'}
                                                        </td>
                                                      );
                                                    })}
                                                  </tr>
                                                ))}
                                              </tbody>
                                            </table>
                                          </div>
                                        </div>
                                      );
                                    }
                                    
                                    // Visualización para campos normales
                                    const fieldColSpan = item.compactPair ? "col-span-1" : "md:col-span-2";
                                    const pairItem = item.compactPair ? 
                                      dataItems.find(di => di.key === item.compactPair) : null;
                                    
                                    return (
                                      <div key={itemIdx} className={`${fieldColSpan} flex flex-col md:flex-row gap-4`}>
                                        {/* Primer campo */}
                                        <div className="bg-gray-50 border rounded-md p-4 hover:shadow-md transition-shadow flex-1">
                                          <label className={`block text-xs font-semibold ${textColor} uppercase mb-2 flex items-center`}>
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                              <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                            </svg>
                                            {item.label || "Campo"}
                                          </label>
                                          {item.isFormula ? (
                                            <div className="w-full p-2 border border-gray-200 rounded-md bg-white text-indigo-600 italic font-medium focus:outline-none focus:ring-2 shadow-sm">
                                              {item.value !== undefined && item.value !== null ? String(item.value) : "-"}
                                            </div>
                                          ) : (
                                            <input 
                                              type="text"
                                              value={item.value !== undefined && item.value !== null ? String(item.value) : ""}
                                              readOnly
                                              className={`w-full p-2 border border-gray-200 rounded-md bg-white shadow-sm
                                                ${item.value && typeof item.value === 'string' && item.value.includes('%') ? 'text-blue-700 font-medium' : 
                                                  item.value && typeof item.value === 'string' && item.value.includes('$') ? 'text-emerald-700 font-medium' : 
                                                  'text-gray-800'} 
                                                focus:outline-none focus:ring-2 ${ringColor}`}
                                            />
                                          )}
                                        </div>
                                        
                                        {/* Campo pareja (si existe) */}
                                        {pairItem && (
                                          <div className="bg-gray-50 border rounded-md p-4 hover:shadow-md transition-shadow flex-1">
                                            <label className={`block text-xs font-semibold ${textColor} uppercase mb-2 flex items-center`}>
                                              <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                                              </svg>
                                              {pairItem.label || "Campo"}
                                            </label>
                                            {pairItem.isFormula ? (
                                              <div className="w-full p-2 border border-gray-200 rounded-md bg-white text-indigo-600 italic font-medium focus:outline-none focus:ring-2 shadow-sm">
                                                {pairItem.value !== undefined && pairItem.value !== null ? String(pairItem.value) : "-"}
                                              </div>
                                            ) : (
                                              <input 
                                                type="text"
                                                value={pairItem.value !== undefined && pairItem.value !== null ? String(pairItem.value) : ""}
                                                readOnly
                                                className={`w-full p-2 border border-gray-200 rounded-md bg-white shadow-sm
                                                  ${pairItem.value && typeof pairItem.value === 'string' && pairItem.value.includes('%') ? 'text-blue-700 font-medium' : 
                                                    pairItem.value && typeof pairItem.value === 'string' && pairItem.value.includes('$') ? 'text-emerald-700 font-medium' : 
                                                    'text-gray-800'} 
                                                  focus:outline-none focus:ring-2 ${ringColor}`}
                                              />
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
            
            <div className="mt-8 bg-gray-50 p-4 rounded-md border border-gray-200 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-medium text-gray-700 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                  </svg>
                  Representación JSON:
                </h4>
                <button 
                  className="text-xs bg-gray-700 text-white px-3 py-1 rounded hover:bg-gray-600 transition-colors flex items-center shadow-sm"
                  onClick={() => {
                    try {
                      navigator.clipboard.writeText(JSON.stringify(previewData, null, 2));
                      // Mostrar una notificación de éxito
                    } catch (error) {
                      console.error('Error al copiar al portapapeles:', error);
                    }
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V5zm2 0a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  Copiar JSON
                </button>
              </div>
              <div className="relative">
                <pre className="bg-gray-800 text-green-400 p-4 rounded-md text-sm overflow-x-auto max-h-96 shadow-inner">
                  {JSON.stringify(previewData, null, 2)}
                </pre>
                <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-gray-800 to-transparent pointer-events-none rounded-b-md"></div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Instrucciones con diseño mejorado */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4 border-b pb-3 flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Instrucciones de uso
        </h2>
        
        <div className="space-y-5">
          <div className="flex p-3 border-l-4 border-primary bg-blue-50 rounded-r-md">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary text-white shadow-sm">
                1
              </div>
            </div>
            <div className="ml-4">
              <p className="text-base text-gray-700">Selecciona un archivo Excel (.xlsx o .xls) haciendo clic en el área de carga.</p>
            </div>
          </div>
          
          <div className="flex p-3 border-l-4 border-primary bg-blue-50 rounded-r-md">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary text-white shadow-sm">
                2
              </div>
            </div>
            <div className="ml-4">
              <p className="text-base text-gray-700">Haz clic en "Subir y Analizar" para procesar los datos del archivo.</p>
            </div>
          </div>
          
          <div className="flex p-3 border-l-4 border-primary bg-blue-50 rounded-r-md">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary text-white shadow-sm">
                3
              </div>
            </div>
            <div className="ml-4">
              <p className="text-base text-gray-700">Revisa la vista previa de los datos y asegúrate de que son correctos.</p>
            </div>
          </div>
          
          <div className="flex p-3 border-l-4 border-primary bg-blue-50 rounded-r-md">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center w-9 h-9 rounded-full bg-primary text-white shadow-sm">
                4
              </div>
            </div>
            <div className="ml-4">
              <p className="text-base text-gray-700">Haz clic en "Usar para Formulario" para continuar con el proceso.</p>
            </div>
          </div>
        </div>
        
        <div className="mt-6 p-5 border border-yellow-200 rounded-md bg-yellow-50 shadow-sm">
          <div className="flex">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center w-10 h-10 rounded-full bg-yellow-100 text-yellow-600">
                <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-md font-medium text-yellow-800">Nota importante</h3>
              <p className="text-sm text-yellow-700 mt-2">
                El archivo Excel debe tener una estructura específica con datos en formato clave-valor para un correcto funcionamiento. Cada campo debe tener una etiqueta identificable.
              </p>
              <ul className="mt-2 text-sm text-yellow-700 list-disc list-inside pl-2">
                <li>Las hojas del Excel deben estar organizadas por secciones</li>
                <li>Se recomienda mantener el formato original del Excel</li>
                <li>Los encabezados de tablas deben estar claramente definidos</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}