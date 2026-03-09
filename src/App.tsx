import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { AppLayout } from './components/layout/AppLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { ActiveWorkout } from './pages/ActiveWorkout';
import { WorkoutTab } from './pages/WorkoutTab';
import { RoutineEditor } from './pages/RoutineEditor';
import { EditWorkout } from './pages/EditWorkout';
import { History } from './pages/History';
import { Profile } from './pages/Profile';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<AppLayout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/workout" element={<WorkoutTab />} />
            <Route path="/workout/:id/active" element={<ActiveWorkout />} />
            <Route path="/workout/log/:logId/edit" element={<EditWorkout />} />
            <Route path="/routine/:id/edit" element={<RoutineEditor />} />
            <Route path="/history" element={<History />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
