import { createRoot } from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider,
  Navigate
} from 'react-router-dom';

import { SettingsProvider } from './context/SettingsContext.jsx';
import App from './App.jsx';
import './index.css';

const router = createBrowserRouter([
  { path: '/songs', element: <App /> },
  { path: '/songs/:id/edit', element: <App /> },
  { path: '/', element: <Navigate to="/songs" replace /> },
  { path: '*', element: <Navigate to="/songs" replace /> }
]);

createRoot(document.getElementById('root')).render(
  <SettingsProvider>
    <RouterProvider router={router} />
  </SettingsProvider>
);