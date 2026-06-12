import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import Feed from './pages/Feed';
import Login from './pages/Login';
import Register from './pages/Register';
import NewPost from './pages/NewPost';
import PostDetail from './pages/PostDetail';
import Dashboard from './pages/Dashboard';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#1a1d27',
              color: '#e2e8f0',
              border: '1px solid #2e3347',
              fontSize: '13px',
            },
          }}
        />
        <Navbar />
        <Routes>
          {/* Public */}
          <Route path="/" element={<Feed />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/posts/:id" element={<PostDetail />} />

          {/* Protected */}
          <Route element={<ProtectedRoute />}>
            <Route path="/posts/new" element={<NewPost />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
