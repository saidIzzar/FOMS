import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

const blocker = document.getElementById('fouc-blocker');

function markReady() {
  document.body.classList.remove('app-loading');
  document.body.classList.add('app-ready');
  if (blocker) {
    blocker.classList.add('hidden');
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <App onReady={markReady} />
  </React.StrictMode>,
)

markReady();
