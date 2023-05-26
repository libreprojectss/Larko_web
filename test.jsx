import axios from 'axios';

const MyComponent = () => {
  const handleDownload = () => {
    axios.get('/download-excel/', { responseType: 'blob' })
      .then((response) => {
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'queue_entries.xlsx');
        document.body.appendChild(link);
        link.click();
      })
      .catch((error) => {
        console.error('Error downloading Excel file:', error);
      });
  };