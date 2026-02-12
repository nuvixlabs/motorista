import * as XLSX from 'xlsx';

export const exportToExcel = (data, filename = 'relatorio_romaneios') => {
  try {
    // Prepare data for Excel
    const excelData = data.map(item => ({
      'Nº ROMANEIO': item.nroRomaneio,
      'DATA ROMANEIO': item.dataRomaneio,
      'SITUAÇÃO': item.situacao,
      'CIDADE': item.cidade,
      'MOTORISTA': item.motorista,
      'STATUS': item.status,
      'VALOR': typeof item.valor === 'number' 
        ? item.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
        : item.valor
    }));

    // Create workbook and worksheet
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.json_to_sheet(excelData);

    // Set column widths
    const columnWidths = [
      { wch: 15 }, // Nº ROMANEIO
      { wch: 15 }, // DATA ROMANEIO
      { wch: 15 }, // SITUAÇÃO
      { wch: 20 }, // CIDADE
      { wch: 20 }, // MOTORISTA
      { wch: 15 }, // STATUS
      { wch: 15 }  // VALOR
    ];
    ws['!cols'] = columnWidths;

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Romaneios');

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().split('T')[0];
    const fullFilename = `${filename}_${timestamp}.xlsx`;

    // Download file
    XLSX.writeFile(wb, fullFilename);

    return { success: true };
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    return { success: false, error: error.message };
  }
};