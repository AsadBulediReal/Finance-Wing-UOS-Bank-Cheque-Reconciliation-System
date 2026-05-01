import { BrowserRouter, Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import DashboardPage from './pages/DashboardPage';
import ChequesPage from './pages/ChequesPage';
import StatementsPage from './pages/StatementsPage';
import ManualReconciliationPage from './pages/ManualReconciliationPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="cheques" element={<ChequesPage />} />
          <Route path="statements" element={<StatementsPage />} />
          <Route path="reconciliation" element={<ManualReconciliationPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
