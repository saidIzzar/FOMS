import jsPDF from 'jspdf';
import 'jspdf-autotable';

export const exportToCSV = (data, filename, headers) => {
  const csvContent = [
    headers.join(','),
    ...data.map(row => 
      headers.map(header => {
        const key = header.toLowerCase().replace(/\s+/g, '_');
        let value = row[key] ?? row[key.replace(/ /g, '_')] ?? '';
        if (typeof value === 'string' && value.includes(',')) {
          value = `"${value}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
  link.click();
};

export const exportToPDF = (data, filename, title, columns) => {
  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text(title, 14, 22);
  
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);

  const tableColumns = columns.map(col => ({
    header: col.label || col,
    dataKey: col.key || col.toLowerCase().replace(/\s+/g, '_')
  }));

  const tableData = data.map(row => {
    const rowData = {};
    tableColumns.forEach(col => {
      let value = row[col.dataKey] ?? row[col.dataKey.replace(/ /g, '_')] ?? '';
      if (typeof value === 'object') {
        value = JSON.stringify(value);
      }
      rowData[col.dataKey] = value;
    });
    return rowData;
  });

  doc.autoTable({
    head: [tableColumns.map(col => col.header)],
    body: tableData.map(row => tableColumns.map(col => row[col.dataKey])),
    startY: 35,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [56, 189, 248] }
  });

  doc.save(`${filename}_${new Date().toISOString().slice(0, 10)}.pdf`);
};

export const exportTableToCSV = (tableId, filename) => {
  const table = document.getElementById(tableId);
  if (!table) return;

  const rows = Array.from(table.querySelectorAll('tr'));
  const csvContent = rows.map(row => {
    const cells = Array.from(row.querySelectorAll('th, td'));
    return cells.map(cell => {
      let value = cell.textContent?.trim() || '';
      if (value.includes(',')) {
        value = `"${value}"`;
      }
      return value;
    }).join(',');
  }).join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}.csv`;
  link.click();
};

export const exportTableToPDF = (tableId, filename, title) => {
  const table = document.getElementById(tableId);
  if (!table) return;

  const doc = new jsPDF();
  
  doc.setFontSize(18);
  doc.text(title, 14, 22);
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 30);

  const headers = Array.from(table.querySelectorAll('thead th')).map(th => th.textContent?.trim() || '');
  
  const rows = Array.from(table.querySelectorAll('tbody tr')).map(tr => 
    Array.from(tr.querySelectorAll('td')).map(td => td.textContent?.trim() || '')
  );

  doc.autoTable({
    head: [headers],
    body: rows,
    startY: 35,
    styles: { fontSize: 8 },
    headStyles: { fillColor: [56, 189, 248] }
  });

  doc.save(`${filename}.pdf`);
};
