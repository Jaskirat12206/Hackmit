const express = require('express');
const cors = require('cors');
const multer = require('multer');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const fs = require('fs');

// Initialize Express app and HTTP server
const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: { 
    origin: "*", 
    methods: ["GET", "POST"] 
  }
});

const PORT = 4000;

// Middleware setup
app.use(express.json({ limit: '50mb' })); // Parse JSON with large file support
app.use(cors()); // Enable cross-origin requests

// In-memory data storage (simple for hackathon)
let firefighters = [];
let mediaFiles = [];

// Create directories for storing uploaded files
const uploadsDir = './uploads';
const imagesDir = './uploads/images';
const videosDir = './uploads/videos';

// Create directories if they don't exist
[uploadsDir, imagesDir, videosDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Serve uploaded files as static content
app.use('/uploads', express.static('uploads'));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, imagesDir);
    } else if (file.mimetype.startsWith('video/')) {
      cb(null, videosDir);
    } else {
      cb(null, uploadsDir);
    }
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const firefighterId = req.body.firefighterId || 'unknown';
    cb(null, `${firefighterId}-${timestamp}-${file.originalname}`);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB limit
});

// Handle dashboard connections for real-time updates
io.on('connection', (socket) => {
  console.log('Dashboard connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Dashboard disconnected:', socket.id);
  });
});

// Basic health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'Backend Running',
    firefighters: firefighters.length,
    mediaFiles: mediaFiles.length,
    timestamp: new Date().toISOString()
  });
});

// Endpoint 1: Receive sensor data from Mantra glasses
app.post('/api/sensor-data', (req, res) => {
  try {
    const data = req.body;
    console.log("Received sensor data:", data);
    
    if (!data.id) {
      return res.status(400).json({ error: 'Missing firefighter ID' });
    }

    // Add server timestamp
    data.lastUpdate = new Date().toISOString();
    
    // Automatic status determination based on vitals
    if (data.o2pct < 19 || data.hr > 150 || data.co2ppm > 2000) {
      data.status = 'ALERT';
    } else if (data.o2pct < 20 || data.hr > 130 || data.co2ppm > 1500) {
      data.status = 'WARNING';
    } else {
      data.status = 'OK';
    }

    // Update existing firefighter or add new one
    const existingIndex = firefighters.findIndex(f => f.id === data.id);
    
    if (existingIndex >= 0) {
      firefighters[existingIndex] = { ...firefighters[existingIndex], ...data };
    } else {
      firefighters.push(data);
    }

    // Send real-time update to dashboard
    io.emit('sensor-update', data);
    
    console.log(`Updated ${data.id}: Status ${data.status}`);
    res.json({ success: true, data });
    
  } catch (error) {
    console.error('Sensor data error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Endpoint 2: Receive images from Mantra glasses
const { PNG } = require('pngjs');

app.post('/api/upload-image', express.json({ limit: '20mb' }), (req, res) => {
  try {
    const { firefighterId, image } = req.body; // array of numbers
    if (!firefighterId || !image) {
      return res.status(400).json({ error: 'No image data or firefighterId' });
    }

    const width = 160;
    const height = 120;

    const png = new PNG({ width, height });

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = y * width + x;
        const val = image[idx] ?? 0;
        const pngIdx = (y * width + x) << 2; // RGBA has 4 bytes
        png.data[pngIdx] = val;     // R
        png.data[pngIdx + 1] = val; // G
        png.data[pngIdx + 2] = val; // B
        png.data[pngIdx + 3] = 255; // A
      }
    }

    const filename = `uploads/images/${Date.now()}.png`;
    png.pack().pipe(fs.createWriteStream(filename)).on('finish', () => {
      const imageData = {
        id: Date.now().toString(),
        firefighterId,
        filename,
        path: `/${filename}`,
        timestamp: new Date().toISOString(),
        type: 'image',
        size: image.length
      };

      mediaFiles.push(imageData);
      io.emit('new-media', imageData);

      res.json({ success: true, image: imageData });
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to process image' });
  }
});



// Endpoint 3: Receive videos from Mantra glasses
app.post('/api/upload-video', upload.single('video'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No video uploaded' });
    }

    const videoData = {
      id: Date.now().toString(),
      firefighterId: req.body.firefighterId,
      filename: req.file.filename,
      path: `/uploads/videos/${req.file.filename}`,
      timestamp: new Date().toISOString(),
      type: 'video',
      size: req.file.size
    };

    mediaFiles.push(videoData);
    
    // Send to dashboard in real-time
    io.emit('new-media', videoData);
    
    console.log(`New video from ${videoData.firefighterId}: ${videoData.filename}`);
    res.json({ success: true, video: videoData });
    
  } catch (error) {
    console.error('Video upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Endpoint 4: Dashboard fetches all firefighter data
app.get('/api/firefighters', (req, res) => {
  res.json(firefighters);
});

// Endpoint 5: Dashboard fetches media files
app.get('/api/media', (req, res) => {
  const { firefighterId, type } = req.query;
  
  let filtered = mediaFiles;
  
  if (firefighterId) {
    filtered = filtered.filter(m => m.firefighterId === firefighterId);
  }
  
  if (type) {
    filtered = filtered.filter(m => m.type === type);
  }
  
  // Sort by timestamp (newest first)
  filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  res.json(filtered);
});

// Endpoint 6: Get single firefighter by ID
app.get('/api/firefighters/:id', (req, res) => {
  const firefighter = firefighters.find(f => f.id === req.params.id);
  
  if (!firefighter) {
    return res.status(404).json({ error: 'Firefighter not found' });
  }
  
  res.json(firefighter);
});

// Endpoint 7: Delete media file (optional)
app.delete('/api/media/:id', (req, res) => {
  const mediaId = req.params.id;
  const mediaIndex = mediaFiles.findIndex(m => m.id === mediaId);
  
  if (mediaIndex === -1) {
    return res.status(404).json({ error: 'Media file not found' });
  }
  
  const mediaFile = mediaFiles[mediaIndex];
  
  // Delete file from disk
  const filePath = path.join(__dirname, 'uploads', mediaFile.type + 's', mediaFile.filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
  
  // Remove from array
  mediaFiles.splice(mediaIndex, 1);
  
  res.json({ success: true, message: 'Media file deleted' });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Server error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// Handle 404 routes
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start the server
server.listen(PORT, "0.0.0.0",() => {
  console.log(`🚀 Firefighter Backend Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`📁 File uploads will be stored in: ${path.resolve(uploadsDir)}`);
  console.log(`🔌 WebSocket enabled for real-time updates`);
});