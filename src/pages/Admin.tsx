import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut, Menu, X, Home, Settings, Edit2, Image, FileText, ArrowLeft } from 'lucide-react';

export default function Admin() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');

  // Admin Password State
  const [adminPassword, setAdminPassword] = useState('admin123');

  // Success Notification State
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  // Content Management State
  const [homeQuote, setHomeQuote] = useState(
    "Space is the beginning of all architecture. The creation of light and shade, the volume of material, and the void between them define the soul of design."
  );
  const [philosophyText, setPhilosophyText] = useState(
    "At 1StudioArch, we believe architecture is the thoughtful arrangement of space, light, and material..."
  );
  const [carouselSpeed, setCarouselSpeed] = useState('10000');
  const [transitionDuration, setTransitionDuration] = useState('3');
  const [newAdminPassword, setNewAdminPassword] = useState('');

  const showSuccessNotification = (message: string) => {
    setSuccessMessage(message);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === adminPassword) {
      setIsAuthenticated(true);
      setPassword('');
      setPasswordError('');
    } else {
      setPasswordError('Invalid password');
      setPassword('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPassword('');
    setPasswordError('');
    setActiveSection('dashboard');
    navigate('/');
  };

  const handleUpdatePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAdminPassword.trim()) {
      setAdminPassword(newAdminPassword);
      setNewAdminPassword('');
      showSuccessNotification('Admin password updated successfully!');
    }
  };

  const handleSaveContent = (e: React.FormEvent) => {
    e.preventDefault();
    showSuccessNotification('Content saved successfully!');
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    showSuccessNotification('Settings saved successfully!');
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md"
        >
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-12">
            <Link to="/">
              <h1 className="text-3xl font-light tracking-widest uppercase mb-12 text-center hover:opacity-60 transition-opacity">
                1StudioArch
              </h1>
            </Link>

            <h2 className="text-2xl font-light mb-8 text-center">Admin Portal</h2>

            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="text-sm uppercase tracking-widest text-stone-400 block mb-3">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                  className="w-full bg-white/10 border border-white/20 rounded px-4 py-3 text-white placeholder-stone-500 focus:outline-none focus:border-white/40 transition-colors"
                />
                {passwordError && (
                  <p className="text-red-400 text-sm mt-2">{passwordError}</p>
                )}
              </div>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="w-full bg-white text-black py-3 rounded font-light uppercase tracking-widest hover:bg-stone-200 transition-colors"
              >
                Login
              </motion.button>
            </form>

            <p className="text-xs text-stone-500 mt-8 text-center">
              Demo password: admin123
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'projects', label: 'Manage Projects', icon: Edit2 },
    { id: 'images', label: 'Image Gallery', icon: Image },
    { id: 'content', label: 'Content', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Success Notification */}
      {showSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-green-500/20 border border-green-500/40 text-green-300 px-6 py-3 rounded-lg backdrop-blur-md flex items-center gap-2"
        >
          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
          <span className="text-sm uppercase tracking-widest">{successMessage}</span>
        </motion.div>
      )}

      {/* Header */}
      <div className="fixed top-0 w-full z-40 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <motion.button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              whileHover={{ opacity: 0.7 }}
              className="lg:hidden"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.button>
            <motion.button
              onClick={() => navigate(-1)}
              whileHover={{ opacity: 0.7 }}
              className="flex items-center gap-2 hover:opacity-60 transition-opacity"
            >
              <ArrowLeft size={20} />
              <span className="text-sm uppercase tracking-widest hidden sm:inline">Back</span>
            </motion.button>
            <Link to="/">
              <h1 className="text-xl font-light tracking-widest uppercase hover:opacity-60 transition-opacity">
                1StudioArch Admin
              </h1>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <motion.button
              onClick={handleLogout}
              whileHover={{ scale: 1.05 }}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded transition-colors"
            >
              <LogOut size={18} />
              <span className="text-sm uppercase tracking-widest hidden sm:inline">Logout</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex pt-20">
        {/* Sidebar */}
        <motion.div
          animate={{ x: sidebarOpen ? 0 : -300 }}
          transition={{ duration: 0.3 }}
          className="fixed left-0 top-20 h-[calc(100vh-80px)] w-64 bg-white/5 backdrop-blur-md border-r border-white/10 p-6 overflow-y-auto lg:relative lg:translate-x-0"
        >
          <div className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <motion.button
                  key={item.id}
                  onClick={() => {
                    setActiveSection(item.id);
                  }}
                  whileHover={{ x: 5 }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded transition-colors ${
                    activeSection === item.id
                      ? 'bg-white/20 text-white'
                      : 'text-stone-400 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon size={20} />
                  <span className="text-sm uppercase tracking-widest">{item.label}</span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Content Area */}
        <div className="flex-1 px-6 lg:px-12 py-8 ml-0 lg:ml-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Dashboard Section */}
            {activeSection === 'dashboard' && (
              <div>
                <h2 className="text-4xl font-light mb-12">Dashboard</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                  <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-white/5 border border-white/10 rounded-lg p-6"
                  >
                    <p className="text-stone-400 text-sm uppercase tracking-widest mb-2">
                      Total Projects
                    </p>
                    <p className="text-4xl font-light">6</p>
                  </motion.div>

                  <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-white/5 border border-white/10 rounded-lg p-6"
                  >
                    <p className="text-stone-400 text-sm uppercase tracking-widest mb-2">
                      Total Images
                    </p>
                    <p className="text-4xl font-light">24</p>
                  </motion.div>

                  <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-white/5 border border-white/10 rounded-lg p-6"
                  >
                    <p className="text-stone-400 text-sm uppercase tracking-widest mb-2">
                      Journal Posts
                    </p>
                    <p className="text-4xl font-light">4</p>
                  </motion.div>

                  <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-white/5 border border-white/10 rounded-lg p-6"
                  >
                    <p className="text-stone-400 text-sm uppercase tracking-widest mb-2">
                      Pages
                    </p>
                    <p className="text-4xl font-light">5</p>
                  </motion.div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-lg p-8">
                  <h3 className="text-2xl font-light mb-6">Quick Actions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      className="bg-white text-black py-3 rounded font-light uppercase tracking-widest hover:bg-stone-200 transition-colors"
                    >
                      Add New Project
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      className="bg-white/10 border border-white/20 py-3 rounded font-light uppercase tracking-widest hover:bg-white/20 transition-colors"
                    >
                      Upload Images
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      className="bg-white/10 border border-white/20 py-3 rounded font-light uppercase tracking-widest hover:bg-white/20 transition-colors"
                    >
                      New Journal Post
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      className="bg-white/10 border border-white/20 py-3 rounded font-light uppercase tracking-widest hover:bg-white/20 transition-colors"
                    >
                      Manage Content
                    </motion.button>
                  </div>
                </div>
              </div>
            )}

            {/* Projects Section */}
            {activeSection === 'projects' && (
              <div>
                <h2 className="text-4xl font-light mb-8">Manage Projects</h2>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  className="mb-8 bg-white text-black px-6 py-3 rounded font-light uppercase tracking-widest hover:bg-stone-200 transition-colors"
                >
                  Add New Project
                </motion.button>

                <div className="space-y-4">
                  {[1, 2, 3, 4, 5, 6].map((project) => (
                    <motion.div
                      key={project}
                      whileHover={{ x: 5 }}
                      className="bg-white/5 border border-white/10 rounded-lg p-6 flex justify-between items-center"
                    >
                      <div>
                        <h3 className="text-lg font-light mb-2">Project {project}</h3>
                        <p className="text-sm text-stone-400">Location • Year</p>
                      </div>
                      <div className="flex gap-2">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          className="px-4 py-2 bg-white/10 border border-white/20 rounded text-sm uppercase tracking-widest hover:bg-white/20 transition-colors"
                        >
                          Edit
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          className="px-4 py-2 bg-red-500/20 border border-red-500/40 rounded text-sm uppercase tracking-widest hover:bg-red-500/30 transition-colors"
                        >
                          Delete
                        </motion.button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Images Section */}
            {activeSection === 'images' && (
              <div>
                <h2 className="text-4xl font-light mb-8">Image Gallery</h2>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  className="mb-8 bg-white text-black px-6 py-3 rounded font-light uppercase tracking-widest hover:bg-stone-200 transition-colors"
                >
                  Upload Images
                </motion.button>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((image) => (
                    <motion.div
                      key={image}
                      whileHover={{ y: -5 }}
                      className="bg-white/5 border border-white/10 rounded-lg overflow-hidden"
                    >
                      <div className="h-40 bg-white/10 flex items-center justify-center">
                        <Image size={48} className="text-stone-500" />
                      </div>
                      <div className="p-4">
                        <p className="text-sm font-light mb-3">Image {image}</p>
                        <div className="flex gap-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-xs uppercase tracking-widest hover:bg-white/20 transition-colors"
                          >
                            View
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            className="flex-1 px-3 py-2 bg-red-500/20 border border-red-500/40 rounded text-xs uppercase tracking-widest hover:bg-red-500/30 transition-colors"
                          >
                            Delete
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Content Section */}
            {activeSection === 'content' && (
              <div>
                <h2 className="text-4xl font-light mb-8">Content Management</h2>

                <form onSubmit={handleSaveContent} className="space-y-6">
                  <motion.div
                    whileHover={{ x: 5 }}
                    className="bg-white/5 border border-white/10 rounded-lg p-6"
                  >
                    <h3 className="text-lg font-light mb-2">Home Page Quote</h3>
                    <textarea
                      value={homeQuote}
                      onChange={(e) => setHomeQuote(e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded px-4 py-3 text-white text-sm focus:outline-none focus:border-white/40 transition-colors resize-none"
                      rows={4}
                    />
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      className="mt-4 bg-white text-black px-6 py-2 rounded font-light uppercase tracking-widest text-sm hover:bg-stone-200 transition-colors"
                    >
                      Save Changes
                    </motion.button>
                  </motion.div>

                  <motion.div
                    whileHover={{ x: 5 }}
                    className="bg-white/5 border border-white/10 rounded-lg p-6"
                  >
                    <h3 className="text-lg font-light mb-2">Studio Philosophy</h3>
                    <textarea
                      value={philosophyText}
                      onChange={(e) => setPhilosophyText(e.target.value)}
                      className="w-full bg-white/10 border border-white/20 rounded px-4 py-3 text-white text-sm focus:outline-none focus:border-white/40 transition-colors resize-none"
                      rows={4}
                    />
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      className="mt-4 bg-white text-black px-6 py-2 rounded font-light uppercase tracking-widest text-sm hover:bg-stone-200 transition-colors"
                    >
                      Save Changes
                    </motion.button>
                  </motion.div>
                </form>
              </div>
            )}

            {/* Settings Section */}
            {activeSection === 'settings' && (
              <div>
                <h2 className="text-4xl font-light mb-8">Settings</h2>

                <div className="space-y-6 max-w-2xl">
                  <form onSubmit={handleSaveSettings}>
                    <motion.div
                      whileHover={{ x: 5 }}
                      className="bg-white/5 border border-white/10 rounded-lg p-6"
                    >
                      <h3 className="text-lg font-light mb-4">Carousel Settings</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm uppercase tracking-widest text-stone-400 block mb-2">
                            Transition Speed (ms)
                          </label>
                          <input
                            type="number"
                            value={carouselSpeed}
                            onChange={(e) => setCarouselSpeed(e.target.value)}
                            className="w-full bg-white/10 border border-white/20 rounded px-4 py-2 text-white focus:outline-none focus:border-white/40 transition-colors"
                          />
                        </div>
                        <div>
                          <label className="text-sm uppercase tracking-widest text-stone-400 block mb-2">
                            Transition Duration (s)
                          </label>
                          <input
                            type="number"
                            value={transitionDuration}
                            onChange={(e) => setTransitionDuration(e.target.value)}
                            step="0.5"
                            className="w-full bg-white/10 border border-white/20 rounded px-4 py-2 text-white focus:outline-none focus:border-white/40 transition-colors"
                          />
                        </div>
                        <motion.button
                          type="submit"
                          whileHover={{ scale: 1.02 }}
                          className="w-full bg-white text-black px-6 py-3 rounded font-light uppercase tracking-widest hover:bg-stone-200 transition-colors"
                        >
                          Save Settings
                        </motion.button>
                      </div>
                    </motion.div>
                  </form>

                  <form onSubmit={handleUpdatePassword}>
                    <motion.div
                      whileHover={{ x: 5 }}
                      className="bg-white/5 border border-white/10 rounded-lg p-6"
                    >
                      <h3 className="text-lg font-light mb-4">Admin Password</h3>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm uppercase tracking-widest text-stone-400 block mb-2">
                            New Password
                          </label>
                          <input
                            type="password"
                            value={newAdminPassword}
                            onChange={(e) => setNewAdminPassword(e.target.value)}
                            placeholder="Enter new password"
                            className="w-full bg-white/10 border border-white/20 rounded px-4 py-2 text-white placeholder-stone-500 focus:outline-none focus:border-white/40 transition-colors"
                          />
                        </div>
                        <motion.button
                          type="submit"
                          whileHover={{ scale: 1.02 }}
                          className="w-full bg-white text-black px-6 py-3 rounded font-light uppercase tracking-widest hover:bg-stone-200 transition-colors"
                        >
                          Update Password
                        </motion.button>
                      </div>
                    </motion.div>
                  </form>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}
