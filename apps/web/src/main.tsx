import React from 'react';
import ReactDOM from 'react-dom/client';
import { Layout } from './components';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Layout>
      <div className="flex items-center justify-center">
        <h1 className="text-4xl font-bold">Task Management System</h1>
      </div>
    </Layout>
  </React.StrictMode>
);

