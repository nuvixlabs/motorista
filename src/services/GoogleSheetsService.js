// Google Sheets Service for fetching romaneio data
const SHEET_ID = '1UynFLtVvzRi0bdV0TxsOxbj9EeYhRW1lVHV1Rv03YuM';
const SHEET_NAME = 'MATRIZ';

// Column indices (0-based): B=1, C=2, E=4, T=19, H=7, AV=47, AX=49
const COLUMN_MAPPING = {
  nroRomaneio: 1,    // Column B
  dataRomaneio: 2,   // Column C
  situacao: 4,       // Column E
  cidade: 19,        // Column T
  motorista: 7,      // Column H
  status: 47,        // Column AV
  valor: 49          // Column AX
};

const parseCSVLine = (line) => {
  const result = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  
  return result;
};

const parseValue = (valueStr) => {
  if (!valueStr) return 0;
  
  // Remove R$, spaces, and convert comma to dot
  const cleaned = valueStr
    .replace('R$', '')
    .replace(/\s/g, '')
    .replace('.', '')
    .replace(',', '.');
  
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

export const fetchGoogleSheetsData = async () => {
  try {
    const url = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${SHEET_NAME}`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const csvText = await response.text();
    const lines = csvText.split('\n');
    
    // Skip header row
    const dataLines = lines.slice(1);
    
    const data = dataLines
      .map(line => {
        if (!line.trim()) return null;
        
        const columns = parseCSVLine(line);
        
        return {
          nroRomaneio: columns[COLUMN_MAPPING.nroRomaneio] || '',
          dataRomaneio: columns[COLUMN_MAPPING.dataRomaneio] || '',
          situacao: columns[COLUMN_MAPPING.situacao] || '',
          cidade: columns[COLUMN_MAPPING.cidade] || '',
          motorista: columns[COLUMN_MAPPING.motorista] || '',
          status: columns[COLUMN_MAPPING.status] || '',
          valor: parseValue(columns[COLUMN_MAPPING.valor])
        };
      })
      .filter(item => item && item.nroRomaneio); // Filter out empty rows
    
    return {
      success: true,
      data: data
    };
  } catch (error) {
    console.error('Error fetching Google Sheets data:', error);
    return {
      success: false,
      error: error.message,
      data: []
    };
  }
};