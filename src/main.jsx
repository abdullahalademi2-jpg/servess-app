import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import ErrorBoundary from './ErrorBoundary.jsx'
import './index.css'
import Swal from 'sweetalert2'

// Override default window.alert globally
window.alert = (msg) => {
  const isError = msg && msg.toString().includes('خطأ');
  Swal.fire({
    text: msg,
    icon: isError ? 'error' : 'success',
    toast: true,
    position: 'top',
    timer: 3000,
    showConfirmButton: false,
    timerProgressBar: true
  });
};

// Global async confirm to replace window.confirm
window.appConfirm = async (msg) => {
  const result = await Swal.fire({
    text: msg,
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#d33',
    cancelButtonColor: '#3085d6',
    confirmButtonText: 'نعم',
    cancelButtonText: 'إلغاء'
  });
  return result.isConfirmed;
};

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>,
)
