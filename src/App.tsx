import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Landing from './pages/Landing';
import Activity from './pages/Activity';
import Teacher from './pages/Teacher';
import Results from './pages/Results';

/** The slide deck is a static page (public/present.html). In production the server serves /present directly;
 * this covers dev and client-side navigation. */
function PresentRedirect() {
  useEffect(() => window.location.replace('/present.html'), []);
  return null;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/activity" element={<Activity />} />
      <Route path="/teacher" element={<Teacher />} />
      <Route path="/results" element={<Results />} />
      <Route path="/present" element={<PresentRedirect />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
