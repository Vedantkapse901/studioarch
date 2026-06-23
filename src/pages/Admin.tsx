import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogOut, Menu, X, Home, Settings, Edit2, Image, FileText, ArrowLeft, Youtube, Trash2, Plus, Mail, Check, Download, Zap } from 'lucide-react';
import { compressImage, compressVideo, formatFileSize } from '../utils/compression';
import { uploadToB2 } from '../utils/b2-upload';
import { useAdminAuth, useProjects, useSupabaseMutation, useJournalPosts, useContactMessages, useGallery, useEventVideos, useContentSettings } from '../hooks/useSupabaseData';
import { LoadingScreenWithText } from '../components/LoadingScreen';
import { AdminImageDisplay } from '../components/AdminImageDisplay';

type EventVideo = { id: number; youtubeId?: string; title: string; url?: string; videoUrl?: string; isYoutube: boolean; };
type JournalPost = { id: number; title: string; date: string; excerpt: string; category: string; };
type Project = { id: number; name: string; location: string; year: string; category: string; description: string; locationmapurl?: string; images?: string[]; };
type GalleryImage = { id: number; url: string; title: string; };

const DEFAULT_JOURNAL_POSTS: JournalPost[] = [
  { id: 1, title: "The Future of Sustainable Luxury Architecture", date: "June 2024", excerpt: "Exploring how cutting-edge sustainable practices are reshaping the landscape of luxury architecture without compromising on aesthetic excellence.", category: "Sustainability" },
  { id: 2, title: "Materiality in Modern Design: A Deep Dive", date: "May 2024", excerpt: "Understanding how the choice of materials can elevate a space from functional to extraordinary, and the artistry behind material selection.", category: "Design" },
  { id: 3, title: "Light as Architecture: Creating Spaces Through Illumination", date: "April 2024", excerpt: "Discover how we leverage light—both natural and artificial—as a fundamental design element to transform architectural spaces.", category: "Design" },
  { id: 4, title: "Case Study: The Obsidian Villa's Journey", date: "March 2024", excerpt: "Behind the scenes of one of our most ambitious projects. From conceptualization to completion, exploring the challenges and triumphs.", category: "Projects" },
];

const DEFAULT_PROJECTS: Project[] = [
  { id: 1, name: "The Obsidian Villa", location: "Mykonos, Greece", year: "2024", category: "Residential", description: "A stunning cliffside villa featuring panoramic Aegean views with cutting-edge sustainable architecture and minimalist design.", images: ["/architecture-1.jpg", "/architecture-2.jpg"] },
  { id: 2, name: "Nexus Headquarters", location: "Singapore", year: "2023", category: "Commercial", description: "A futuristic corporate headquarters integrating smart building technology with luxury office spaces.", images: ["/architecture-3.jpg"] },
  { id: 3, name: "Alpine Retreat", location: "Zermatt, Switzerland", year: "2024", category: "Hospitals", description: "Exclusive medical facility combining traditional aesthetics with modern healthcare technology.", images: ["/architecture-4.jpg"] },
  { id: 4, name: "Lumina Pavilion", location: "Kyoto, Japan", year: "2022", category: "Schools", description: "An avant-garde educational center showcasing the fusion of Eastern philosophy and Western design principles.", images: ["/architecture-5.jpg", "/architecture-1.jpg"] },
  { id: 5, name: "Urban Sanctuary", location: "New York, USA", year: "2023", category: "Residential", description: "A contemporary urban residence blending industrial elements with warm minimalist interiors.", images: ["/architecture-2.jpg"] },
  { id: 6, name: "Coastal Living", location: "Malibu, California", year: "2024", category: "PMC", description: "Premium mixed-use complex with breathtaking views and sustainable architecture.", images: ["/architecture-3.jpg", "/architecture-4.jpg"] },
];

const DEFAULT_CONTACT = { email: 'inquiry@1studioarch.com', phone: '+44 (0) 20 1234 5678', locations: 'London, UK\nNew York, USA\nSingapore, SG', instagram: '#', linkedin: '#', youtube: '#', locationmapurl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3024.1234567890!2d-0.1276!3d51.5074!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNTHCsDMwJzI2LjYiTiAwwrAwN0myMzUuNiJX!5e0!3m2!1sen!2sus!4v1234567890' };

export default function Admin() {
  const navigate = useNavigate();
  const { loginWithSupabase, logout } = useAdminAuth();
  const { data: supabaseProjects, refetch: refetchProjects, loading: projectsLoading } = useProjects();
  const { data: supabaseJournalPosts, refetch: refetchJournalPosts, loading: journalLoading } = useJournalPosts();
  const { data: contactMessages, refetch: refetchMessages, loading: messagesLoading } = useContactMessages();
  const { folders: galleryFolders, loading: galleryLoading } = useGallery();
  const { data: videos, refetch: refetchVideos, loading: videosLoading } = useEventVideos();
  const { settings: contentSettings, loading: settingsLoading } = useContentSettings();
  const { insert: insertProject, update: updateProject, remove: deleteProject } = useSupabaseMutation();
  const { insert: insertJournal, update: updateJournal, remove: deleteJournal } = useSupabaseMutation();
  const { insert: insertGalleryFolder, remove: deleteGalleryFolder } = useSupabaseMutation();
  const { insert: insertGalleryItem, remove: deleteGalleryItem } = useSupabaseMutation();
  const { insert: insertVideo, update: updateVideo, remove: deleteVideo } = useSupabaseMutation();
  const { insert: insertSettings, update: updateSettings } = useSupabaseMutation();
  const { remove: deleteMessage } = useSupabaseMutation();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [userSession, setUserSession] = useState(null);
  const [homeQuote, setHomeQuote] = useState("Space is the beginning of all architecture. The creation of light and shade, the volume of material, and the void between them define the soul of design.");
  const [philosophyText, setPhilosophyText] = useState("At 1StudioArch, we believe architecture is the thoughtful arrangement of space, light, and material...");

  // Events - Using Supabase
  const [eventVideos, setEventVideos] = useState(videos || []);
  const [newVideoUrl, setNewVideoUrl] = useState('');
  const [newVideoFile, setNewVideoFile] = useState<File | null>(null);
  const [newVideoTitle, setNewVideoTitle] = useState('');
  const [videoError, setVideoError] = useState('');
  const [videoCompressing, setVideoCompressing] = useState(false);
  const [videoCompressProgress, setVideoCompressProgress] = useState(0);

  // Update eventVideos when Supabase data loads
  useEffect(() => {
    if (videos && videos.length > 0) {
      setEventVideos(videos);
    }
  }, [videos]);

  // Contact
  const [contactInfo, setContactInfo] = useState(() => {
    try { const s = localStorage.getItem('contactInfo'); return s ? JSON.parse(s) : DEFAULT_CONTACT; } catch { return DEFAULT_CONTACT; }
  });

  // Journal
  const [journalPosts, setJournalPosts] = useState<JournalPost[]>([]);
  const [newPost, setNewPost] = useState({ title: '', date: '', excerpt: '', category: '' });
  const [editingPostId, setEditingPostId] = useState<number | null>(null);
  const [editPostData, setEditPostData] = useState<Partial<JournalPost>>({});

  // Update journal posts when Supabase data is loaded (only Supabase, no fallback)
  useEffect(() => {
    if (supabaseJournalPosts) {
      setJournalPosts(supabaseJournalPosts as JournalPost[]);
    }
  }, [supabaseJournalPosts]);

  // Projects
  const [editingProjectId, setEditingProjectId] = useState<number | null>(null);
  const [editProjectData, setEditProjectData] = useState<Partial<Project>>({});
  const [newProjectData, setNewProjectData] = useState<Partial<Project>>({ name: '', location: '', year: new Date().getFullYear().toString(), category: '', description: '', images: [] });
  const [newProjectImages, setNewProjectImages] = useState<string[]>([]);

  // Gallery Images - Pre-populated with existing public images
  const DEFAULT_GALLERY: GalleryImage[] = [
    { id: 1, url: '/architecture-1.jpg', title: 'Architecture 1' },
    { id: 2, url: '/architecture-2.jpg', title: 'Architecture 2' },
    { id: 3, url: '/architecture-3.jpg', title: 'Architecture 3' },
    { id: 4, url: '/architecture-4.jpg', title: 'Architecture 4' },
    { id: 5, url: '/architecture-5.jpg', title: 'Architecture 5' },
  ];
  // Gallery - Using Supabase
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newImageFile, setNewImageFile] = useState<File | null>(null);
  const [newImageTitle, setNewImageTitle] = useState('');
  const [imageError, setImageError] = useState('');
  const [imageCompressing, setImageCompressing] = useState(false);
  const [imageCompressProgress, setImageCompressProgress] = useState(0);
  const [editingProjectImages, setEditingProjectImages] = useState<string[]>([]);
  const [newProjectImageUrl, setNewProjectImageUrl] = useState('');
  const [newProjectImageFile, setNewProjectImageFile] = useState<File | null>(null);
  // Update gallery images when Supabase gallery data loads
  useEffect(() => {
    if (galleryFolders && galleryFolders.length > 0) {
      const allImages: GalleryImage[] = [];
      galleryFolders.forEach((folder: any) => {
        if (folder.gallery_items) {
          folder.gallery_items.forEach((item: any) => {
            allImages.push({
              id: item.id,
              url: item.image_url,
              title: item.title,
              folderId: folder.id
            });
          });
        }
      });
      setGalleryImages(allImages);
    }
  }, [galleryFolders]);

  const extractYoutubeId = (url: string): string | null => {
    const patterns = [/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/, /^([a-zA-Z0-9_-]{11})$/];
    for (const pattern of patterns) { const match = url.match(pattern); if (match) return match[1]; }
    return null;
  };

  const showSuccessNotification = (message: string) => {
    setSuccessMessage(message); setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const handleAddVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    setVideoError('');

    if (!newVideoTitle.trim()) {
      setVideoError('Please enter a video title.');
      return;
    }

    if (!newVideoUrl.trim() && !newVideoFile) {
      setVideoError('Please provide either a YouTube URL or upload a video file.');
      return;
    }

    // YouTube URL - Save directly to Supabase
    if (newVideoUrl.trim()) {
      try {
        const youtubeId = extractYoutubeId(newVideoUrl.trim());
        if (!youtubeId) { setVideoError('Invalid YouTube URL.'); return; }

        const result = await insertVideo('event_videos', {
          title: newVideoTitle.trim(),
          video_url: newVideoUrl.trim(),
          category: 'YouTube',
          display_order: eventVideos.length
        });

        if (result.success) {
          refetchVideos();
          setNewVideoUrl('');
          setNewVideoFile(null);
          setNewVideoTitle('');
          showSuccessNotification('YouTube video added to Events page!');
        } else {
          setVideoError('Failed to save video to database');
        }
      } catch (error) {
        setVideoError(error instanceof Error ? error.message : 'Error adding YouTube video');
      }
      return;
    }

    // Video File Upload - Compress & Upload to Supabase Storage
    if (newVideoFile) {
      try {
        setVideoCompressing(true);
        setVideoCompressProgress(0);

        const compressedFile = await compressVideo(newVideoFile, (progress) => {
          setVideoCompressProgress(progress);
        });

        // Upload to B2
        const uploadResult = await uploadToB2(compressedFile, `videos/${Date.now()}_${newVideoFile.name}`, (progress) => {
          setVideoCompressProgress(progress);
        });

        if (uploadResult.success) {
          console.log('✅ Upload successful, saving to database:', uploadResult.url);

          // Save to database
          const dbResult = await insertVideo('event_videos', {
            title: newVideoTitle.trim(),
            video_url: uploadResult.url,
            category: 'Upload',
            display_order: eventVideos.length
          });

          console.log('Database insert result:', dbResult);

          if (dbResult.success) {
            console.log('✅ Database save successful, refetching videos...');

            // Optimistically add to UI immediately
            const newVideo = {
              id: Date.now(),
              title: newVideoTitle.trim(),
              video_url: uploadResult.url,
              category: 'Upload',
              display_order: eventVideos.length,
              created_at: new Date().toISOString()
            };
            setEventVideos(prev => [...prev, newVideo]);

            // Also refetch from database
            setTimeout(() => {
              refetchVideos();
            }, 500);

            setNewVideoUrl('');
            setNewVideoFile(null);
            setNewVideoTitle('');
            setVideoCompressing(false);
            setVideoCompressProgress(0);
            showSuccessNotification(`Video uploaded! (${formatFileSize(compressedFile.size)})`);
          } else {
            console.error('❌ Database save failed:', dbResult);
            setVideoError(`Failed to save video info to database: ${dbResult.error || 'Unknown error'}`);
          }
        } else {
          console.error('❌ Upload failed:', uploadResult.error);
          setVideoError(uploadResult.error || 'Failed to upload video');
        }
      } catch (error) {
        setVideoError(error instanceof Error ? error.message : 'Failed to upload video');
        setVideoCompressing(false);
        setVideoCompressProgress(0);
        console.error('Video upload error:', error);
      }
    }
  };

  const handleRemoveVideo = (id: number) => { setEventVideos(prev => prev.filter(v => v.id !== id)); showSuccessNotification('Video removed.'); };

  // Clean up broken gallery images (with %2F encoding issues)
  const handleCleanupBrokenImages = async () => {
    try {
      const brokenImages = galleryImages.filter(img => img.url.includes('%2F') || img.url.includes('%20'));
      if (brokenImages.length === 0) {
        showSuccessNotification('No broken images found!');
        return;
      }

      for (const img of brokenImages) {
        await deleteGalleryItem('gallery_items', img.id);
      }

      setGalleryImages(prev => prev.filter(img => !img.url.includes('%2F') && !img.url.includes('%20')));
      showSuccessNotification(`Removed ${brokenImages.length} broken image(s). Re-upload them fresh!`);
    } catch (error) {
      setImageError('Failed to cleanup images');
    }
  };

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewVideoFile(file);
      setVideoError('');
    }
  };

  const handleAddImage = async (e: React.FormEvent) => {
    e.preventDefault();
    setImageError('');

    if (!newImageTitle.trim()) {
      setImageError('Please enter an image title.');
      return;
    }

    if (!newImageUrl.trim() && !newImageFile) {
      setImageError('Please provide either an image URL or upload an image file.');
      return;
    }

    // URL-based image - Save directly to Supabase
    if (newImageUrl.trim()) {
      try {
        // Use first folder or create one
        let folderId = galleryFolders?.[0]?.id;
        if (!folderId) {
          const folderResult = await insertGalleryFolder('gallery_folders', { name: 'Portfolio', display_order: 0 });
          if (folderResult.success && folderResult.data[0]) {
            folderId = folderResult.data[0].id;
          }
        }

        const result = await insertGalleryItem('gallery_items', {
          folder_id: folderId,
          title: newImageTitle.trim(),
          image_url: newImageUrl.trim(),
          display_order: galleryImages.length
        });

        if (result.success) {
          // Refresh gallery data from Supabase
          // Will need to call fetch function
          setNewImageUrl('');
          setNewImageTitle('');
          showSuccessNotification('Image added to gallery!');
        } else {
          setImageError('Failed to save image to database');
        }
      } catch (error) {
        setImageError(error instanceof Error ? error.message : 'Error adding image');
      }
      return;
    }

    // File-based image - Compress & Upload to Supabase Storage
    if (newImageFile) {
      try {
        setImageCompressing(true);
        setImageCompressProgress(0);

        const compressedFile = await compressImage(newImageFile, (progress) => {
          setImageCompressProgress(progress);
        });

        // Upload to B2
        const uploadResult = await uploadToB2(compressedFile, `images/${Date.now()}_${newImageFile.name}`, (progress) => {
          setImageCompressProgress(progress);
        });

        if (uploadResult.success) {
          console.log('✅ Upload successful, saving to database:', uploadResult.url);

          // Use first folder or create one
          let folderId = galleryFolders?.[0]?.id;
          if (!folderId) {
            const folderResult = await insertGalleryFolder('gallery_folders', { name: 'Portfolio', display_order: 0 });
            if (folderResult.success && folderResult.data[0]) {
              folderId = folderResult.data[0].id;
            }
          }

          // Save to database - save proxy URL directly (simpler!)
          const dbResult = await insertGalleryItem('gallery_items', {
            folder_id: folderId,
            title: newImageTitle.trim(),
            image_url: uploadResult.url, // Save proxy URL directly
            display_order: galleryImages.length
          });

          console.log('Database insert result:', dbResult);

          if (dbResult.success) {
            console.log('✅ Database save successful, updating UI...');

            // Optimistically add to UI immediately (store proxy URL like database does)
            const newImage = {
              id: Date.now(),
              url: uploadResult.url, // Store proxy URL, works immediately
              title: newImageTitle.trim(),
              folderId: folderId
            };
            setGalleryImages(prev => [...prev, newImage]);

            setNewImageUrl('');
            setNewImageFile(null);
            setNewImageTitle('');
            setImageCompressing(false);
            setImageCompressProgress(0);
            showSuccessNotification(`Image uploaded! (${formatFileSize(compressedFile.size)})`);
          } else {
            console.error('❌ Database save failed:', dbResult);
            setImageError(`Failed to save image info to database: ${dbResult.error || 'Unknown error'}`);
          }
        } else {
          console.error('❌ Upload failed:', uploadResult.error);
          setImageError(uploadResult.error || 'Failed to upload image');
        }
      } catch (error) {
        setImageError(error instanceof Error ? error.message : 'Failed to upload image');
        setImageCompressing(false);
        setImageCompressProgress(0);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewImageFile(file);
      setImageError('');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const result = await loginWithSupabase(email, password);
    if (result.success) {
      setIsAuthenticated(true);
      setUserSession(result.user);
      setEmail('');
      setPassword('');
      setPasswordError('');
      showSuccessNotification('Logged in successfully!');
    } else {
      setPasswordError(result.error || 'Login failed');
    }
  };

  const handleLogout = async () => {
    await logout();
    setIsAuthenticated(false);
    setUserSession(null);
    setEmail('');
    setPassword('');
    setPasswordError('');
    setActiveSection('dashboard');
    navigate('/');
  };

  const handleSaveContent = (e: React.FormEvent) => { e.preventDefault(); showSuccessNotification('Content saved!'); };

  const handleSaveContact = async (e: React.FormEvent) => {
    e.preventDefault();
    // Update existing contact_info record (assuming id = 1)
    const result = await updateProject('contact_info', 1, {
      email: contactInfo.email,
      phone: contactInfo.phone,
      locations: contactInfo.locations,
      instagram: contactInfo.instagram,
      linkedin: contactInfo.linkedin,
      youtube: contactInfo.youtube,
      locationmapurl: contactInfo.locationmapurl,
    });
    if (result.success) {
      showSuccessNotification('Contact info saved!');
    } else {
      showSuccessNotification('Failed to save contact info');
    }
  };

  const handleAddJournalPost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.title.trim()) return;
    const result = await insertJournal('journal_posts', {
      title: newPost.title.trim(),
      date: newPost.date,
      excerpt: newPost.excerpt,
      category: newPost.category,
    });
    if (result.success) {
      setNewPost({ title: '', date: '', excerpt: '', category: '' });
      refetchJournalPosts();
      showSuccessNotification('Journal post added!');
    } else {
      showSuccessNotification('Failed to add post');
    }
  };

  const handleDeleteJournalPost = async (id: number) => {
    if (confirm('Delete this journal post?')) {
      const result = await deleteJournal('journal_posts', id);
      if (result.success) {
        refetchJournalPosts();
        showSuccessNotification('Post removed.');
      } else {
        showSuccessNotification('Failed to delete post');
      }
    }
  };

  const handleSaveJournalPost = async (id: number) => {
    const result = await updateJournal('journal_posts', id, {
      title: editPostData.title,
      date: editPostData.date,
      excerpt: editPostData.excerpt,
      category: editPostData.category,
    });
    if (result.success) {
      setEditingPostId(null);
      setEditPostData({});
      refetchJournalPosts();
      showSuccessNotification('Post updated!');
    } else {
      showSuccessNotification('Failed to update post');
    }
  };

  const handleSaveProject = async (id: number) => {
    const result = await updateProject('projects', id, {
      name: editProjectData.name,
      location: editProjectData.location,
      year: editProjectData.year,
      category: editProjectData.category,
      description: editProjectData.description,
      locationmapurl: editProjectData.locationmapurl,
      images: editingProjectImages,
    });
    if (result.success) {
      setEditingProjectId(null);
      setEditProjectData({});
      setEditingProjectImages([]);
      refetchProjects();
      showSuccessNotification('Project updated!');
    } else {
      showSuccessNotification('Failed to update project');
    }
  };

  const handleRemoveImage = (id: number) => { setGalleryImages(prev => prev.filter(img => img.id !== id)); showSuccessNotification('Image removed.'); };

  const handleAddProjectImage = () => {
    if (editingProjectImages.length >= 5) { showSuccessNotification('Maximum 5 images per project'); return; }
    if (!newProjectImageUrl.trim() && !newProjectImageFile) { return; }

    if (newProjectImageFile) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setEditingProjectImages(prev => [...prev, dataUrl]);
        setNewProjectImageUrl('');
        setNewProjectImageFile(null);
      };
      reader.readAsDataURL(newProjectImageFile);
    } else {
      setEditingProjectImages(prev => [...prev, newProjectImageUrl.trim()]);
      setNewProjectImageUrl('');
    }
  };

  const handleRemoveProjectImage = (index: number) => {
    setEditingProjectImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleDeleteProject = async (id: number) => {
    if (confirm('Are you sure you want to delete this project?')) {
      const result = await deleteProject('projects', id);
      if (result.success) {
        refetchProjects();
        showSuccessNotification('Project deleted!');
      } else {
        showSuccessNotification('Failed to delete project');
      }
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectData.name?.trim()) {
      showSuccessNotification('Enter project name');
      return;
    }

    const result = await insertProject('projects', {
      name: newProjectData.name.trim(),
      location: newProjectData.location?.trim() || '',
      year: newProjectData.year || new Date().getFullYear().toString(),
      category: newProjectData.category?.trim() || '',
      description: newProjectData.description?.trim() || '',
      images: newProjectImages.length > 0 ? newProjectImages : ['/architecture-1.jpg'],
      locationmapurl: newProjectData.locationmapurl,
    });

    if (result.success) {
      setNewProjectData({ name: '', location: '', year: new Date().getFullYear().toString(), category: '', description: '' });
      setNewProjectImages([]);
      refetchProjects();
      showSuccessNotification('Project created successfully!');
    } else {
      showSuccessNotification('Failed to create project');
    }
  };

  const handleAddNewProjectImage = () => {
    if (newProjectImages.length >= 5) { showSuccessNotification('Maximum 5 images per project'); return; }
    if (!newProjectImageUrl.trim() && !newProjectImageFile) { return; }

    if (newProjectImageFile) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const dataUrl = event.target?.result as string;
        setNewProjectImages(prev => [...prev, dataUrl]);
        setNewProjectImageUrl('');
        setNewProjectImageFile(null);
      };
      reader.readAsDataURL(newProjectImageFile);
    } else {
      setNewProjectImages(prev => [...prev, newProjectImageUrl.trim()]);
      setNewProjectImageUrl('');
    }
  };

  const handleRemoveNewProjectImage = (index: number) => {
    setNewProjectImages(prev => prev.filter((_, i) => i !== index));
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="w-full max-w-md">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-lg p-12">
            <Link to="/"><h1 className="text-3xl font-light tracking-widest uppercase mb-12 text-center hover:opacity-60 transition-opacity">1StudioArch</h1></Link>
            <h2 className="text-2xl font-light mb-8 text-center">Admin Portal</h2>
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label className="text-sm uppercase tracking-widest text-stone-400 block mb-3">Email</label>
                <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@studioarch.com" className="w-full bg-white/10 border border-white/20 rounded px-4 py-3 text-white placeholder-stone-500 focus:outline-none focus:border-white/40 transition-colors" />
              </div>
              <div>
                <label className="text-sm uppercase tracking-widest text-stone-400 block mb-3">Password</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter admin password" className="w-full bg-white/10 border border-white/20 rounded px-4 py-3 text-white placeholder-stone-500 focus:outline-none focus:border-white/40 transition-colors" />
                {passwordError && <p className="text-red-400 text-sm mt-2">{passwordError}</p>}
              </div>
              <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="w-full bg-white text-black py-3 rounded font-light uppercase tracking-widest hover:bg-stone-200 transition-colors">Login</motion.button>
            </form>
            <p className="text-xs text-stone-500 mt-8 text-center">Powered by Supabase</p>
          </div>
        </motion.div>
      </div>
    );
  }

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Home },
    { id: 'projects', label: 'Manage Projects', icon: Edit2 },
    { id: 'journal', label: 'Manage Journal', icon: FileText },
    { id: 'messages', label: 'Messages', icon: Mail },
    { id: 'contact', label: 'Edit Contact', icon: Mail },
    { id: 'images', label: 'Image Gallery', icon: Image },
    { id: 'events', label: 'Events Videos', icon: Youtube },
    { id: 'content', label: 'Content', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      {showSuccess && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-green-500/20 border border-green-500/40 text-green-300 px-6 py-3 rounded-lg backdrop-blur-md flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full" />
          <span className="text-sm uppercase tracking-widest">{successMessage}</span>
        </motion.div>
      )}

      {/* Header */}
      <div className="fixed top-0 w-full z-40 bg-black/80 backdrop-blur-md border-b border-white/10">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <motion.button onClick={() => setSidebarOpen(!sidebarOpen)} whileHover={{ opacity: 0.7 }} className="lg:hidden">
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </motion.button>
            <motion.button onClick={() => navigate(-1)} whileHover={{ opacity: 0.7 }} className="flex items-center gap-2 hover:opacity-60 transition-opacity">
              <ArrowLeft size={20} /><span className="text-sm uppercase tracking-widest hidden sm:inline">Back</span>
            </motion.button>
            <Link to="/" className="group hover:opacity-90 transition-opacity">
              <div className="relative w-48 h-14">
                <img src="/logo-bw.png" alt="1StudioArch" className="absolute inset-0 w-full h-full object-contain transition-opacity duration-300 opacity-100 group-hover:opacity-0" />
                <img src="/logo-color.png" alt="1StudioArch" className="absolute inset-0 w-full h-full object-contain transition-opacity duration-300 opacity-0 group-hover:opacity-100" />
              </div>
            </Link>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-stone-400 hidden sm:inline">{userSession?.email}</span>
            <motion.button onClick={handleLogout} whileHover={{ scale: 1.05 }} className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 border border-white/20 rounded transition-colors">
              <LogOut size={18} /><span className="text-sm uppercase tracking-widest hidden sm:inline">Logout</span>
            </motion.button>
          </div>
        </div>
      </div>

      <div className="flex pt-20">
        {/* Sidebar */}
        <motion.div animate={{ x: sidebarOpen ? 0 : -300 }} transition={{ duration: 0.3 }} className="fixed left-0 top-20 h-[calc(100vh-80px)] w-64 bg-white/5 backdrop-blur-md border-r border-white/10 p-6 overflow-y-auto lg:relative lg:translate-x-0">
          <div className="space-y-2">
            {menuItems.map(item => {
              const Icon = item.icon;
              return (
                <motion.button key={item.id} onClick={() => setActiveSection(item.id)} whileHover={{ x: 5 }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded transition-colors ${activeSection === item.id ? 'bg-white/20 text-white' : 'text-stone-400 hover:bg-white/10 hover:text-white'}`}>
                  <Icon size={20} /><span className="text-sm uppercase tracking-widest">{item.label}</span>
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Content */}
        <div className="flex-1 px-6 lg:px-12 py-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>

            {/* Dashboard */}
            {activeSection === 'dashboard' && (
              <div>
                <h2 className="text-4xl font-light mb-12">Dashboard</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                  {[{ label: 'Total Projects', value: supabaseProjects.length }, { label: 'Journal Posts', value: journalPosts.length }, { label: 'Event Videos', value: eventVideos.length }, { label: 'Pages', value: 5 }].map(({ label, value }) => (
                    <motion.div key={label} whileHover={{ y: -5 }} className="bg-white/5 border border-white/10 rounded-lg p-6">
                      <p className="text-stone-400 text-sm uppercase tracking-widest mb-2">{label}</p>
                      <p className="text-4xl font-light">{value}</p>
                    </motion.div>
                  ))}
                </div>
                <div className="bg-white/5 border border-white/10 rounded-lg p-8">
                  <h3 className="text-2xl font-light mb-6">Quick Actions</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[{ label: 'Manage Projects', id: 'projects' }, { label: 'Manage Journal', id: 'journal' }, { label: 'Edit Contact', id: 'contact' }, { label: 'Events Videos', id: 'events' }].map(({ label, id }) => (
                      <motion.button key={id} whileHover={{ scale: 1.02 }} onClick={() => setActiveSection(id)} className="bg-white/10 border border-white/20 py-3 rounded font-light uppercase tracking-widest hover:bg-white/20 transition-colors">{label}</motion.button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Projects */}
            {activeSection === 'projects' && (
              <div>
                <h2 className="text-4xl font-light mb-8">Manage Projects</h2>

                {/* Add New Project Form */}
                <form onSubmit={handleCreateProject} className="bg-white/5 border border-white/10 rounded-lg p-6 mb-8">
                  <h3 className="text-lg font-light mb-6 flex items-center gap-2"><Plus size={18} /> Create New Project</h3>
                  <div className="space-y-4 mb-6">
                    {/* Project Name */}
                    <div>
                      <label className="text-xs uppercase tracking-widest text-stone-400 block mb-2">Project Name</label>
                      <input
                        type="text"
                        value={newProjectData.name || ''}
                        onChange={e => setNewProjectData(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="e.g. Luxury Villa"
                        className="w-full bg-white/10 border border-white/20 rounded px-4 py-3 text-white text-sm placeholder-stone-500 focus:outline-none focus:border-white/40"
                      />
                    </div>

                    {/* Grid for Location, Year, Category */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="text-xs uppercase tracking-widest text-stone-400 block mb-2">Location</label>
                        <input
                          type="text"
                          value={newProjectData.location || ''}
                          onChange={e => setNewProjectData(prev => ({ ...prev, location: e.target.value }))}
                          placeholder="e.g. Mykonos, Greece"
                          className="w-full bg-white/10 border border-white/20 rounded px-4 py-3 text-white text-sm placeholder-stone-500 focus:outline-none focus:border-white/40"
                        />
                      </div>
                      <div>
                        <label className="text-xs uppercase tracking-widest text-stone-400 block mb-2">Year</label>
                        <input
                          type="text"
                          value={newProjectData.year || ''}
                          onChange={e => setNewProjectData(prev => ({ ...prev, year: e.target.value }))}
                          placeholder={new Date().getFullYear().toString()}
                          className="w-full bg-white/10 border border-white/20 rounded px-4 py-3 text-white text-sm placeholder-stone-500 focus:outline-none focus:border-white/40"
                        />
                      </div>
                      <div>
                        <label className="text-xs uppercase tracking-widest text-stone-400 block mb-2">Category</label>
                        <select
                          value={newProjectData.category || ''}
                          onChange={e => setNewProjectData(prev => ({ ...prev, category: e.target.value }))}
                          className="w-full bg-white/10 border border-white/20 rounded px-4 py-3 text-white text-sm focus:outline-none focus:border-white/40 appearance-none cursor-pointer"
                          style={{
                            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23a8a29e' d='M6 9L1 4h10z'/%3E%3C/svg%3E")`,
                            backgroundRepeat: 'no-repeat',
                            backgroundPosition: 'right 1rem center',
                            paddingRight: '2.5rem',
                          }}
                        >
                          <option value="" className="bg-stone-900 text-white">Select category</option>
                          <option value="Residential" className="bg-stone-900 text-white">Residential</option>
                          <option value="Commercial" className="bg-stone-900 text-white">Commercial</option>
                          <option value="Hospitals" className="bg-stone-900 text-white">Hospitals</option>
                          <option value="Schools" className="bg-stone-900 text-white">Schools</option>
                          <option value="PMC" className="bg-stone-900 text-white">PMC</option>
                        </select>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <label className="text-xs uppercase tracking-widest text-stone-400 block mb-2">Description</label>
                      <textarea
                        value={newProjectData.description || ''}
                        onChange={e => setNewProjectData(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Project description..."
                        rows={3}
                        className="w-full bg-white/10 border border-white/20 rounded px-4 py-3 text-white text-sm placeholder-stone-500 focus:outline-none focus:border-white/40 resize-none"
                      />
                    </div>

                    {/* Location Map URL */}
                    <div>
                      <label className="text-xs uppercase tracking-widest text-stone-400 block mb-2">Location Map Embed URL</label>
                      <textarea
                        value={newProjectData.locationmapurl || ''}
                        onChange={e => setNewProjectData(prev => ({ ...prev, locationmapurl: e.target.value }))}
                        placeholder="Google Maps embed URL"
                        rows={2}
                        className="w-full bg-white/10 border border-white/20 rounded px-4 py-3 text-white text-sm placeholder-stone-500 focus:outline-none focus:border-white/40 resize-none"
                      />
                    </div>

                    {/* Project Images */}
                    <div>
                      <label className="text-xs uppercase tracking-widest text-stone-400 block mb-2">Project Images ({newProjectImages.length}/5)</label>
                      <div className="space-y-2 mb-3">
                        {newProjectImages.map((img, idx) => (
                          <div key={idx} className="flex items-center gap-2 bg-white/5 p-2 rounded border border-white/10">
                            <img src={img} alt={`Project ${idx + 1}`} className="w-12 h-12 object-cover rounded" />
                            <span className="text-xs text-stone-400 flex-1 truncate">{img.substring(0, 40)}...</span>
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              type="button"
                              onClick={() => handleRemoveNewProjectImage(idx)}
                              className="p-1 bg-red-500/20 border border-red-500/40 rounded hover:bg-red-500/30"
                            >
                              <Trash2 size={12} className="text-red-400" />
                            </motion.button>
                          </div>
                        ))}
                      </div>
                      {newProjectImages.length < 5 && (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={newProjectImageUrl}
                            onChange={e => setNewProjectImageUrl(e.target.value)}
                            placeholder="Image URL or upload file"
                            className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm placeholder-stone-500 focus:outline-none focus:border-white/40"
                          />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={e => setNewProjectImageFile(e.target.files?.[0] || null)}
                            className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-stone-400 text-sm file:bg-white file:text-black file:px-2 file:py-1 file:border-0 file:rounded file:text-xs file:cursor-pointer file:mr-2 hover:file:bg-stone-200"
                          />
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            type="button"
                            onClick={handleAddNewProjectImage}
                            className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded text-xs uppercase tracking-widest hover:bg-white/30 flex items-center justify-center gap-2"
                          >
                            <Plus size={12} /> Add Image
                          </motion.button>
                        </div>
                      )}
                    </div>
                  </div>

                  <motion.button
                    type="submit"
                    whileHover={{ scale: 1.02 }}
                    className="w-full bg-white text-black px-6 py-3 rounded font-light uppercase tracking-widest text-sm hover:bg-stone-200 flex items-center justify-center gap-2"
                  >
                    <Plus size={16} /> Create Project
                  </motion.button>
                </form>

                {/* Existing Projects List */}
                <h3 className="text-xl font-light mb-4">Existing Projects ({supabaseProjects.length})</h3>
                {projectsLoading ? (
                  <div className="py-12">
                    <div className="bg-white/5 border border-white/10 rounded-lg p-12 text-center">
                      <motion.img
                        src="/logo-bw.png"
                        alt="Loading..."
                        className="h-32 w-auto mx-auto mb-4"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <p className="text-stone-400 uppercase tracking-widest text-sm">Loading projects...</p>
                    </div>
                  </div>
                ) : (
                <div className="space-y-4">
                  {supabaseProjects.map(project => (
                    <motion.div key={project.id} className="bg-white/5 border border-white/10 rounded-lg p-6">
                      {editingProjectId === project.id ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {(['name', 'location', 'year', 'category'] as const).map(field => (
                              <div key={field}>
                                <label className="text-xs uppercase tracking-widest text-stone-400 block mb-1">{field}</label>
                                <input value={(editProjectData[field] ?? project[field]) as string} onChange={e => setEditProjectData(prev => ({ ...prev, [field]: e.target.value }))}
                                  className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-white/40" />
                              </div>
                            ))}
                          </div>
                          <div>
                            <label className="text-xs uppercase tracking-widest text-stone-400 block mb-1">Description</label>
                            <textarea value={(editProjectData.description ?? project.description)} onChange={e => setEditProjectData(prev => ({ ...prev, description: e.target.value }))}
                              rows={3} className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-white/40 resize-none" />
                          </div>
                          <div>
                            <label className="text-xs uppercase tracking-widest text-stone-400 block mb-1">Location Map Embed URL</label>
                            <textarea value={(editProjectData.locationmapurl ?? project.locationmapurl ?? '')} onChange={e => setEditProjectData(prev => ({ ...prev, locationmapurl: e.target.value }))}
                              rows={2} placeholder="Google Maps embed URL" className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm placeholder-stone-500 focus:outline-none focus:border-white/40 resize-none" />
                            <p className="text-xs text-stone-500 mt-1">Optional: Paste the full iframe src URL from Google Maps</p>
                          </div>
                          <div>
                            <label className="text-xs uppercase tracking-widest text-stone-400 block mb-2">Project Images ({editingProjectImages.length}/5)</label>
                            <div className="space-y-2 mb-3">
                              {editingProjectImages.map((img, idx) => (
                                <div key={idx} className="flex items-center gap-2 bg-white/5 p-2 rounded border border-white/10">
                                  <img src={img} alt={`Project ${idx + 1}`} className="w-12 h-12 object-cover rounded" />
                                  <span className="text-xs text-stone-400 flex-1 truncate">{img.substring(0, 40)}...</span>
                                  <motion.button whileHover={{ scale: 1.1 }} onClick={() => handleRemoveProjectImage(idx)} className="p-1 bg-red-500/20 border border-red-500/40 rounded hover:bg-red-500/30">
                                    <Trash2 size={12} className="text-red-400" />
                                  </motion.button>
                                </div>
                              ))}
                            </div>
                            {editingProjectImages.length < 5 && (
                              <div className="space-y-2">
                                <input type="text" value={newProjectImageUrl} onChange={e => setNewProjectImageUrl(e.target.value)} placeholder="Image URL or upload file" className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm placeholder-stone-500 focus:outline-none focus:border-white/40" />
                                <input type="file" accept="image/*" onChange={e => setNewProjectImageFile(e.target.files?.[0] || null)} className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-stone-400 text-sm file:bg-white file:text-black file:px-2 file:py-1 file:border-0 file:rounded file:text-xs file:cursor-pointer file:mr-2 hover:file:bg-stone-200" />
                                <motion.button whileHover={{ scale: 1.02 }} type="button" onClick={handleAddProjectImage} className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded text-xs uppercase tracking-widest hover:bg-white/30 flex items-center justify-center gap-2">
                                  <Plus size={12} /> Add Image
                                </motion.button>
                              </div>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <motion.button whileHover={{ scale: 1.02 }} onClick={() => {
                              setEditProjectData(prev => ({ ...prev, images: editingProjectImages }));
                              handleSaveProject(project.id);
                              setEditingProjectImages([]);
                            }} className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded text-sm uppercase tracking-widest hover:bg-stone-200">
                              <Check size={14} /> Save
                            </motion.button>
                            <motion.button whileHover={{ scale: 1.02 }} onClick={() => { setEditingProjectId(null); setEditProjectData({}); setEditingProjectImages([]); }} className="px-4 py-2 bg-white/10 border border-white/20 rounded text-sm uppercase tracking-widest hover:bg-white/20">Cancel</motion.button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <h3 className="text-lg font-light mb-1">{project.name}</h3>
                            <p className="text-sm text-stone-400">{project.location} · {project.year} · {project.category}</p>
                            <p className="text-sm text-stone-500 mt-2 max-w-xl">{project.description}</p>
                            {project.images && project.images.length > 0 && (
                              <p className="text-xs text-stone-500 mt-2">📸 {Array.isArray(project.images) ? project.images.length : 0} image(s)</p>
                            )}
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <motion.button whileHover={{ scale: 1.05 }} onClick={() => { setEditingProjectId(project.id); setEditProjectData({}); setEditingProjectImages(project.images || []); }}
                              className="px-4 py-2 bg-white/10 border border-white/20 rounded text-sm uppercase tracking-widest hover:bg-white/20">Edit</motion.button>
                            <motion.button whileHover={{ scale: 1.05 }} onClick={() => handleDeleteProject(project.id)}
                              className="p-2 bg-red-500/20 border border-red-500/40 rounded hover:bg-red-500/30">
                              <Trash2 size={14} className="text-red-400" />
                            </motion.button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
                )}
              </div>
            )}

            {/* Journal */}
            {activeSection === 'journal' && (
              <div>
                <h2 className="text-4xl font-light mb-8">Manage Journal</h2>
                <form onSubmit={handleAddJournalPost} className="bg-white/5 border border-white/10 rounded-lg p-6 mb-8">
                  <h3 className="text-lg font-light mb-6 flex items-center gap-2"><Plus size={18} /> Add New Post</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="md:col-span-2">
                      <label className="text-xs uppercase tracking-widest text-stone-400 block mb-1">Title</label>
                      <input value={newPost.title} onChange={e => setNewPost(p => ({ ...p, title: e.target.value }))} placeholder="Article title" className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm placeholder-stone-500 focus:outline-none focus:border-white/40" />
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-widest text-stone-400 block mb-1">Category</label>
                      <input value={newPost.category} onChange={e => setNewPost(p => ({ ...p, category: e.target.value }))} placeholder="e.g. Design" className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm placeholder-stone-500 focus:outline-none focus:border-white/40" />
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-widest text-stone-400 block mb-1">Date</label>
                      <input value={newPost.date} onChange={e => setNewPost(p => ({ ...p, date: e.target.value }))} placeholder="e.g. June 2024" className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm placeholder-stone-500 focus:outline-none focus:border-white/40" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="text-xs uppercase tracking-widest text-stone-400 block mb-1">Excerpt</label>
                      <textarea value={newPost.excerpt} onChange={e => setNewPost(p => ({ ...p, excerpt: e.target.value }))} placeholder="Short description..." rows={2} className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm placeholder-stone-500 focus:outline-none focus:border-white/40 resize-none" />
                    </div>
                  </div>
                  <motion.button type="submit" whileHover={{ scale: 1.02 }} className="flex items-center gap-2 bg-white text-black px-5 py-2 rounded font-light uppercase tracking-widest text-sm hover:bg-stone-200">
                    <Plus size={14} /> Add Post
                  </motion.button>
                </form>
                {journalLoading ? (
                  <div className="py-12">
                    <div className="bg-white/5 border border-white/10 rounded-lg p-12 text-center">
                      <motion.img
                        src="/logo-bw.png"
                        alt="Loading..."
                        className="h-32 w-auto mx-auto mb-4"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <p className="text-stone-400 uppercase tracking-widest text-sm">Loading journal posts...</p>
                    </div>
                  </div>
                ) : journalPosts.length === 0 ? (
                  <div className="bg-white/5 border border-white/10 rounded-lg p-12 text-center text-stone-500">
                    <p className="text-sm uppercase tracking-widest">No journal posts yet. Create one above!</p>
                  </div>
                ) : (
                <div className="space-y-4">
                  {journalPosts.map(post => (
                    <motion.div key={post.id} className="bg-white/5 border border-white/10 rounded-lg p-6">
                      {editingPostId === post.id ? (
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="md:col-span-2">
                              <label className="text-xs uppercase tracking-widest text-stone-400 block mb-1">Title</label>
                              <input value={(editPostData.title ?? post.title)} onChange={e => setEditPostData(prev => ({ ...prev, title: e.target.value }))} className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-white/40" />
                            </div>
                            <div>
                              <label className="text-xs uppercase tracking-widest text-stone-400 block mb-1">Category</label>
                              <input value={(editPostData.category ?? post.category)} onChange={e => setEditPostData(prev => ({ ...prev, category: e.target.value }))} className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-white/40" />
                            </div>
                            <div>
                              <label className="text-xs uppercase tracking-widest text-stone-400 block mb-1">Date</label>
                              <input value={(editPostData.date ?? post.date)} onChange={e => setEditPostData(prev => ({ ...prev, date: e.target.value }))} className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-white/40" />
                            </div>
                            <div className="md:col-span-2">
                              <label className="text-xs uppercase tracking-widest text-stone-400 block mb-1">Excerpt</label>
                              <textarea value={(editPostData.excerpt ?? post.excerpt)} onChange={e => setEditPostData(prev => ({ ...prev, excerpt: e.target.value }))} rows={3} className="w-full bg-white/10 border border-white/20 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-white/40 resize-none" />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <motion.button whileHover={{ scale: 1.02 }} onClick={() => handleSaveJournalPost(post.id)} className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded text-sm uppercase tracking-widest hover:bg-stone-200">
                              <Check size={14} /> Save
                            </motion.button>
                            <motion.button whileHover={{ scale: 1.02 }} onClick={() => { setEditingPostId(null); setEditPostData({}); }} className="px-4 py-2 bg-white/10 border border-white/20 rounded text-sm uppercase tracking-widest hover:bg-white/20">Cancel</motion.button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-xs bg-white/10 px-2 py-0.5 rounded border border-white/20">{post.category}</span>
                              <span className="text-xs text-stone-500">{post.date}</span>
                            </div>
                            <h3 className="font-light text-white mb-1">{post.title}</h3>
                            <p className="text-sm text-stone-500 line-clamp-2">{post.excerpt}</p>
                          </div>
                          <div className="flex gap-2 flex-shrink-0">
                            <motion.button whileHover={{ scale: 1.05 }} onClick={() => { setEditingPostId(post.id); setEditPostData({}); }} className="px-3 py-2 bg-white/10 border border-white/20 rounded text-xs uppercase tracking-widest hover:bg-white/20">Edit</motion.button>
                            <motion.button whileHover={{ scale: 1.05 }} onClick={() => handleDeleteJournalPost(post.id)} className="p-2 bg-red-500/20 border border-red-500/40 rounded hover:bg-red-500/30">
                              <Trash2 size={14} className="text-red-400" />
                            </motion.button>
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
                )}
              </div>
            )}

            {/* Messages */}
            {activeSection === 'messages' && (
              <div>
                <h2 className="text-4xl font-light mb-8">Contact Messages</h2>
                {messagesLoading ? (
                  <div className="py-12">
                    <div className="bg-white/5 border border-white/10 rounded-lg p-12 text-center">
                      <motion.img
                        src="/logo-bw.png"
                        alt="Loading..."
                        className="h-32 w-auto mx-auto mb-4"
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      />
                      <p className="text-stone-400 uppercase tracking-widest text-sm">Loading messages...</p>
                    </div>
                  </div>
                ) : contactMessages && contactMessages.length > 0 ? (
                  <div className="space-y-4">
                    {contactMessages.map((msg: any) => (
                      <motion.div key={msg.id} className="bg-white/5 border border-white/10 rounded-lg p-6">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <h3 className="font-light text-white text-lg">{msg.name}</h3>
                              <span className="text-xs text-stone-500">{new Date(msg.created_at).toLocaleDateString()}</span>
                            </div>
                            <a href={`mailto:${msg.email}`} className="text-sm text-stone-400 hover:text-white mb-3 inline-block">{msg.email}</a>
                            <p className="text-stone-400 mt-3">{msg.message}</p>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            onClick={() => deleteMessage('contact_messages', msg.id).then(() => refetchMessages())}
                            className="p-2 bg-red-500/20 border border-red-500/40 rounded hover:bg-red-500/30"
                          >
                            <Trash2 size={14} className="text-red-400" />
                          </motion.button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-white/5 border border-white/10 rounded-lg p-12 text-center text-stone-500">
                    <Mail size={36} className="mx-auto mb-3 opacity-30" />
                    <p className="text-sm uppercase tracking-widest">No messages yet</p>
                  </div>
                )}
              </div>
            )}

            {/* Contact */}
            {activeSection === 'contact' && (
              <div>
                <h2 className="text-4xl font-light mb-8">Edit Contact Page</h2>
                <form onSubmit={handleSaveContact} className="space-y-6 max-w-2xl">
                  <motion.div whileHover={{ x: 3 }} className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-4">
                    <h3 className="text-lg font-light mb-4">Contact Information</h3>
                    <div>
                      <label className="text-xs uppercase tracking-widest text-stone-400 block mb-2">Email</label>
                      <input type="email" value={contactInfo.email} onChange={e => setContactInfo(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full bg-white/10 border border-white/20 rounded px-4 py-2 text-white text-sm focus:outline-none focus:border-white/40" />
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-widest text-stone-400 block mb-2">Phone Number</label>
                      <input type="tel" value={contactInfo.phone || ''} onChange={e => setContactInfo(prev => ({ ...prev, phone: e.target.value }))}
                        placeholder="+1 (555) 123-4567" className="w-full bg-white/10 border border-white/20 rounded px-4 py-2 text-white text-sm placeholder-stone-500 focus:outline-none focus:border-white/40" />
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-widest text-stone-400 block mb-2">Locations (one per line)</label>
                      <textarea value={contactInfo.locations} onChange={e => setContactInfo(prev => ({ ...prev, locations: e.target.value }))}
                        rows={4} className="w-full bg-white/10 border border-white/20 rounded px-4 py-2 text-white text-sm focus:outline-none focus:border-white/40 resize-none" />
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-widest text-stone-400 block mb-2">Location Map Embed URL</label>
                      <textarea value={contactInfo.locationmapurl || ''} onChange={e => setContactInfo(prev => ({ ...prev, locationmapurl: e.target.value }))}
                        placeholder="Google Maps embed URL or similar" rows={2} className="w-full bg-white/10 border border-white/20 rounded px-4 py-2 text-white text-sm placeholder-stone-500 focus:outline-none focus:border-white/40 resize-none" />
                      <p className="text-xs text-stone-500 mt-1">Paste the full iframe src URL from Google Maps or another map service</p>
                    </div>
                  </motion.div>
                  <motion.div whileHover={{ x: 3 }} className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-4">
                    <h3 className="text-lg font-light mb-4">Social Links</h3>
                    <div>
                      <label className="text-xs uppercase tracking-widest text-stone-400 block mb-2">Instagram URL</label>
                      <input value={contactInfo.instagram} onChange={e => setContactInfo(prev => ({ ...prev, instagram: e.target.value }))}
                        placeholder="https://instagram.com/..." className="w-full bg-white/10 border border-white/20 rounded px-4 py-2 text-white text-sm placeholder-stone-500 focus:outline-none focus:border-white/40" />
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-widest text-stone-400 block mb-2">LinkedIn URL</label>
                      <input value={contactInfo.linkedin} onChange={e => setContactInfo(prev => ({ ...prev, linkedin: e.target.value }))}
                        placeholder="https://linkedin.com/..." className="w-full bg-white/10 border border-white/20 rounded px-4 py-2 text-white text-sm placeholder-stone-500 focus:outline-none focus:border-white/40" />
                    </div>
                    <div>
                      <label className="text-xs uppercase tracking-widest text-stone-400 block mb-2">YouTube URL</label>
                      <input value={contactInfo.youtube || ''} onChange={e => setContactInfo(prev => ({ ...prev, youtube: e.target.value }))}
                        placeholder="https://youtube.com/..." className="w-full bg-white/10 border border-white/20 rounded px-4 py-2 text-white text-sm placeholder-stone-500 focus:outline-none focus:border-white/40" />
                    </div>
                  </motion.div>
                  <motion.button type="submit" whileHover={{ scale: 1.02 }} className="w-full bg-white text-black px-6 py-3 rounded font-light uppercase tracking-widest hover:bg-stone-200 transition-colors">
                    Save Contact Info
                  </motion.button>
                </form>
              </div>
            )}

            {/* Images */}
            {activeSection === 'images' && (
              <div>
                <h2 className="text-4xl font-light mb-8">Image Gallery</h2>
                <form onSubmit={handleAddImage} className="bg-white/5 border border-white/10 rounded-lg p-6 mb-8">
                  <h3 className="text-lg font-light mb-8 flex items-center gap-2"><Plus size={18} /> Add New Image</h3>

                  <div className="space-y-8">
                    {/* Image Title */}
                    <div>
                      <label className="text-xs uppercase tracking-widest text-stone-400 block mb-2">Image Title *</label>
                      <input type="text" value={newImageTitle} onChange={e => { setNewImageTitle(e.target.value); setImageError(''); }} placeholder="e.g. Architecture Shot" className="w-full bg-white/10 border border-white/20 rounded px-4 py-3 text-white placeholder-stone-500 focus:outline-none focus:border-white/40 text-sm" />
                    </div>

                    {/* URL Option */}
                    <div>
                      <label className="text-xs uppercase tracking-widest text-stone-400 block mb-2">Option 1: Image URL</label>
                      <input type="text" value={newImageUrl} onChange={e => { setNewImageUrl(e.target.value); setImageError(''); setNewImageFile(null); }} placeholder="https://example.com/image.jpg" className="w-full bg-white/10 border border-white/20 rounded px-4 py-3 text-white placeholder-stone-500 focus:outline-none focus:border-white/40 text-sm" />
                      <p className="text-xs text-stone-500 mt-2">Use images from /public folder like "/architecture-1.jpg" or paste full URLs</p>
                    </div>

                    {/* File Upload Option */}
                    <div>
                      <label className="text-xs uppercase tracking-widest text-stone-400 block mb-2">Option 2: Upload Image File</label>
                      <input type="file" accept="image/*" onChange={handleFileChange} className="w-full bg-white/10 border border-white/20 rounded px-4 py-3 text-stone-400 focus:outline-none focus:border-white/40 text-sm file:bg-white file:text-black file:px-4 file:py-2 file:border-0 file:rounded file:uppercase file:tracking-widest file:text-xs file:font-light file:cursor-pointer file:mr-3 hover:file:bg-stone-200" />
                      <p className="text-xs text-stone-500 mt-2">Supported: JPG, PNG, GIF, WebP, SVG (Max 10MB)</p>
                      {newImageFile && <p className="text-xs text-green-400 mt-2">✓ File selected: {newImageFile.name}</p>}
                    </div>

                    {/* Compression Progress */}
                    {imageCompressing && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Zap size={14} className="text-amber-500 animate-pulse" />
                          <span className="text-xs uppercase tracking-widest text-amber-500">Compressing image...</span>
                          <span className="text-xs text-stone-500">{imageCompressProgress}%</span>
                        </div>
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-amber-500 to-yellow-500 transition-all"
                            style={{ width: `${imageCompressProgress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Error Message */}
                    {imageError && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded px-3 py-2">{imageError}</p>}

                    {/* Submit Button */}
                    <motion.button
                      type="submit"
                      disabled={imageCompressing}
                      whileHover={{ scale: imageCompressing ? 1 : 1.02 }}
                      className={`w-full px-6 py-3 rounded font-light uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-colors ${
                        imageCompressing
                          ? 'bg-stone-600 text-stone-400 cursor-not-allowed'
                          : 'bg-white text-black hover:bg-stone-200'
                      }`}
                    >
                      <Plus size={16} /> {imageCompressing ? 'Compressing...' : 'Add Image'}
                    </motion.button>
                  </div>
                </form>

                {/* Cleanup Button */}
                <motion.button
                  onClick={handleCleanupBrokenImages}
                  whileHover={{ scale: 1.02 }}
                  className="mb-8 px-4 py-2 bg-red-500/20 border border-red-500/40 rounded text-xs uppercase tracking-widest text-red-400 hover:bg-red-500/30 transition-colors"
                >
                  🧹 Cleanup Broken Images (with %2F encoding)
                </motion.button>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {galleryImages.length === 0 ? (
                    <div className="col-span-full bg-white/5 border border-white/10 rounded-lg p-8 text-center text-stone-500">
                      <Image size={36} className="mx-auto mb-3 opacity-30" />
                      <p className="text-sm uppercase tracking-widest">No images added yet</p>
                    </div>
                  ) : galleryImages.map(image => (
                    <motion.div key={image.id} whileHover={{ y: -5 }} className="bg-white/5 border border-white/10 rounded-lg overflow-hidden">
                      <div className="h-40 bg-stone-900 flex items-center justify-center overflow-hidden relative">
                        <AdminImageDisplay src={image.url} alt={image.title} className="w-full h-full object-cover" />
                      </div>
                      <div className="p-4">
                        <p className="text-sm font-light mb-2 truncate">{image.title}</p>
                        <p className="text-xs text-stone-500 mb-3 truncate">{image.url}</p>
                        <div className="flex gap-2">
                          <motion.a whileHover={{ scale: 1.05 }} href={image.url} target="_blank" rel="noopener noreferrer" className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded text-xs uppercase tracking-widest hover:bg-white/20 flex items-center justify-center gap-1">
                            <Download size={12} /> View
                          </motion.a>
                          <motion.button whileHover={{ scale: 1.05 }} onClick={() => handleRemoveImage(image.id)} className="flex-1 px-3 py-2 bg-red-500/20 border border-red-500/40 rounded text-xs uppercase tracking-widest hover:bg-red-500/30">Delete</motion.button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {/* Events */}
            {activeSection === 'events' && (
              <div>
                <h2 className="text-4xl font-light mb-2">Events Videos</h2>
                <p className="text-stone-400 text-sm mb-2">Add YouTube videos or upload video files to display on the Events page.</p>
                <p className="text-amber-600/70 text-xs mb-8 bg-amber-500/10 border border-amber-500/20 rounded px-3 py-2 inline-block">
                  ⚠️ Note: Uploaded videos are available during the current session. For permanent videos, use YouTube links.
                </p>
                <form onSubmit={handleAddVideo} className="bg-white/5 border border-white/10 rounded-lg p-6 mb-8">
                  <h3 className="text-lg font-light mb-8 flex items-center gap-2"><Plus size={18} /> Add New Video</h3>
                  <div className="space-y-8">
                    {/* Video Title */}
                    <div>
                      <label className="text-xs uppercase tracking-widest text-stone-400 block mb-2">Video Title *</label>
                      <input type="text" value={newVideoTitle} onChange={e => { setNewVideoTitle(e.target.value); setVideoError(''); }} placeholder="e.g. Bungalow Design Walkthrough" className="w-full bg-white/10 border border-white/20 rounded px-4 py-3 text-white placeholder-stone-500 focus:outline-none focus:border-white/40 text-sm" />
                    </div>

                    {/* YouTube URL Option */}
                    <div>
                      <label className="text-xs uppercase tracking-widest text-stone-400 block mb-2">Option 1: YouTube URL</label>
                      <input type="text" value={newVideoUrl} onChange={e => { setNewVideoUrl(e.target.value); setVideoError(''); setNewVideoFile(null); }} placeholder="https://www.youtube.com/watch?v=..." className="w-full bg-white/10 border border-white/20 rounded px-4 py-3 text-white placeholder-stone-500 focus:outline-none focus:border-white/40 text-sm" />
                      <p className="text-xs text-stone-500 mt-2">Paste YouTube video URL</p>
                    </div>

                    {/* Video File Upload Option */}
                    <div>
                      <label className="text-xs uppercase tracking-widest text-stone-400 block mb-2">Option 2: Upload Video File</label>
                      <input type="file" accept="video/*" onChange={handleVideoFileChange} className="w-full bg-white/10 border border-white/20 rounded px-4 py-3 text-stone-400 focus:outline-none focus:border-white/40 text-sm file:bg-white file:text-black file:px-4 file:py-2 file:border-0 file:rounded file:uppercase file:tracking-widest file:text-xs file:font-light file:cursor-pointer file:mr-3 hover:file:bg-stone-200" />
                      <p className="text-xs text-stone-500 mt-2">Supported: MP4, WebM, Ogg (Max 500MB)</p>
                      {newVideoFile && <p className="text-xs text-green-400 mt-2">✓ File selected: {newVideoFile.name}</p>}
                    </div>

                    {/* Compression Progress */}
                    {videoCompressing && (
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Zap size={14} className="text-amber-500 animate-pulse" />
                          <span className="text-xs uppercase tracking-widest text-amber-500">Compressing video...</span>
                          <span className="text-xs text-stone-500">{videoCompressProgress}%</span>
                        </div>
                        <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-amber-500 to-yellow-500 transition-all"
                            style={{ width: `${videoCompressProgress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Error Message */}
                    {videoError && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/30 rounded px-3 py-2">{videoError}</p>}

                    {/* Submit Button */}
                    <motion.button
                      type="submit"
                      disabled={videoCompressing}
                      whileHover={{ scale: videoCompressing ? 1 : 1.02 }}
                      className={`w-full px-6 py-3 rounded font-light uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-colors ${
                        videoCompressing
                          ? 'bg-stone-600 text-stone-400 cursor-not-allowed'
                          : 'bg-white text-black hover:bg-stone-200'
                      }`}
                    >
                      <Plus size={16} /> {videoCompressing ? 'Compressing...' : 'Add Video'}
                    </motion.button>
                  </div>
                </form>
                <div className="space-y-4">
                  {eventVideos.length === 0 ? (
                    <div className="bg-white/5 border border-white/10 rounded-lg p-8 text-center text-stone-500">
                      <Youtube size={36} className="mx-auto mb-3 opacity-30" />
                      <p className="text-sm uppercase tracking-widest">No videos added yet</p>
                    </div>
                  ) : (
                    <>
                      {/* YouTube Videos */}
                      {eventVideos.filter(v => v.isYoutube).length > 0 && (
                        <div>
                          <h4 className="text-sm font-light uppercase tracking-widest text-stone-400 mb-3">YouTube Videos ({eventVideos.filter(v => v.isYoutube).length})</h4>
                          <div className="space-y-2">
                            {eventVideos.filter(v => v.isYoutube).map((video, idx) => (
                              <motion.div key={video.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="bg-white/5 border border-white/10 rounded-lg p-4 flex items-center gap-4">
                                {video.youtubeId && <img src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`} alt={video.title} className="w-28 h-16 object-cover rounded flex-shrink-0" />}
                                <div className="flex-1 min-w-0">
                                  <p className="font-light text-white truncate">{video.title}</p>
                                  <p className="text-xs text-yellow-600 mt-1">📺 YouTube</p>
                                </div>
                                <motion.button whileHover={{ scale: 1.1 }} onClick={() => handleRemoveVideo(video.id)} className="p-2 bg-red-500/20 border border-red-500/40 rounded hover:bg-red-500/30 flex-shrink-0">
                                  <Trash2 size={16} className="text-red-400" />
                                </motion.button>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Uploaded Videos */}
                      {eventVideos.filter(v => !v.isYoutube).length > 0 && (
                        <div>
                          <h4 className="text-sm font-light uppercase tracking-widest text-stone-400 mb-3">Uploaded Videos ({eventVideos.filter(v => !v.isYoutube).length})</h4>
                          <div className="space-y-2">
                            {eventVideos.filter(v => !v.isYoutube).map((video, idx) => (
                              <motion.div key={video.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} className="bg-white/5 border border-white/10 rounded-lg p-4 flex items-center gap-4">
                                <div className="w-28 h-16 bg-stone-800 rounded flex items-center justify-center flex-shrink-0">
                                  <Youtube size={24} className="text-stone-600" />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-light text-white truncate">{video.title}</p>
                                  <p className="text-xs text-blue-600 mt-1">🎬 Video File</p>
                                </div>
                                <motion.button whileHover={{ scale: 1.1 }} onClick={() => handleRemoveVideo(video.id)} className="p-2 bg-red-500/20 border border-red-500/40 rounded hover:bg-red-500/30 flex-shrink-0">
                                  <Trash2 size={16} className="text-red-400" />
                                </motion.button>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Content */}
            {activeSection === 'content' && (
              <div>
                <h2 className="text-4xl font-light mb-8">Content Management</h2>
                <form onSubmit={handleSaveContent} className="space-y-6">
                  <motion.div whileHover={{ x: 5 }} className="bg-white/5 border border-white/10 rounded-lg p-6">
                    <h3 className="text-lg font-light mb-2">Home Page Quote</h3>
                    <textarea value={homeQuote} onChange={e => setHomeQuote(e.target.value)} className="w-full bg-white/10 border border-white/20 rounded px-4 py-3 text-white text-sm focus:outline-none focus:border-white/40 resize-none" rows={4} />
                    <motion.button type="submit" whileHover={{ scale: 1.02 }} className="mt-4 bg-white text-black px-6 py-2 rounded font-light uppercase tracking-widest text-sm hover:bg-stone-200">Save Changes</motion.button>
                  </motion.div>
                  <motion.div whileHover={{ x: 5 }} className="bg-white/5 border border-white/10 rounded-lg p-6">
                    <h3 className="text-lg font-light mb-2">Studio Philosophy</h3>
                    <textarea value={philosophyText} onChange={e => setPhilosophyText(e.target.value)} className="w-full bg-white/10 border border-white/20 rounded px-4 py-3 text-white text-sm focus:outline-none focus:border-white/40 resize-none" rows={4} />
                    <motion.button type="submit" whileHover={{ scale: 1.02 }} className="mt-4 bg-white text-black px-6 py-2 rounded font-light uppercase tracking-widest text-sm hover:bg-stone-200">Save Changes</motion.button>
                  </motion.div>
                </form>
              </div>
            )}

            {/* Settings */}
            {activeSection === 'settings' && (
              <div>
                <h2 className="text-4xl font-light mb-8">Settings</h2>
                <div className="space-y-6 max-w-2xl">
                  <motion.div whileHover={{ x: 5 }} className="bg-white/5 border border-white/10 rounded-lg p-6">
                    <h3 className="text-lg font-light mb-4">Admin Account</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm uppercase tracking-widest text-stone-400 block mb-2">Email</label>
                        <p className="w-full bg-white/10 border border-white/20 rounded px-4 py-2 text-white">{userSession?.email}</p>
                      </div>
                      <p className="text-xs text-stone-500">
                        To change your password, please use Supabase's password reset feature or contact your system administrator.
                      </p>
                    </div>
                  </motion.div>
                </div>
              </div>
            )}

          </motion.div>
        </div>
      </div>
    </div>
  );
}
