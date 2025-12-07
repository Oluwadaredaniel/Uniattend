// src/main.jsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';
import { SocketProvider } from './context/SocketProvider.jsx';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HelmetProvider>
      <BrowserRouter>
        <SocketProvider>
          <App />
          <Toaster position="top-right" />
        </SocketProvider>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>,
);