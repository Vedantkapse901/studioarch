import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Projects from './pages/Projects';
import Philosophy from './pages/Philosophy';
import Journal from './pages/Journal';
import Contact from './pages/Contact';
import Admin from './pages/Admin';
import Events from './pages/Events';
import Gallery from './pages/Gallery';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/projects" element={<Projects />} />
      <Route path="/gallery" element={<Gallery />} />
      <Route path="/philosophy" element={<Philosophy />} />
      <Route path="/journal" element={<Journal />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/events" element={<Events />} />
    </Routes>
  );
}
