
import Papa from 'papaparse';

export const generateImportReport = (results) => {
  if (!results || results.length === 0) return;

  const csv = Papa.unparse(results.map(row => ({
    'Domain Name': row.name,
    'Status': row.status,
    'Message': row.error || 'Success',
    'Timestamp': new Date().toISOString()
  })));

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `import_report_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
