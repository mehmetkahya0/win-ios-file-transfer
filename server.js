const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs-extra');
const path = require('path');
const http = require('http');
const socketIo = require('socket.io');
const QRCode = require('qrcode');
const qrTerminal = require('qrcode-terminal');
const archiver = require('archiver');
const mime = require('mime-types');
const os = require('os');
const dgram = require('dgram');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;
const UPLOAD_DIR = path.join(__dirname, 'uploads');

// Ensure upload directory exists
fs.ensureDirSync(UPLOAD_DIR);

// Security middleware (temporarily relaxed for debugging)
app.use(helmet({
  contentSecurityPolicy: false, // Disable for debugging
  crossOriginResourcePolicy: false
}));

// Rate limiting
const uploadLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 uploads per windowMs
  message: { error: 'Too many uploads, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply rate limiting
app.use(generalLimiter);

// Cache-busting headers to prevent serving old versions
app.use((req, res, next) => {
  if (req.url.endsWith('.html') || req.url.endsWith('.js') || req.url.endsWith('.css') || req.url === '/') {
    res.set({
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
  }
  next();
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(UPLOAD_DIR));

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    // Preserve original filename with timestamp to avoid conflicts
    const timestamp = Date.now();
    const originalName = Buffer.from(file.originalname, 'latin1').toString('utf8');
    cb(null, `${timestamp}-${originalName}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB limit
  }
});

// Get local IP address
function getLocalIPAddress() {
  const interfaces = os.networkInterfaces();
  for (const devName in interfaces) {
    const iface = interfaces[devName];
    for (let i = 0; i < iface.length; i++) {
      const alias = iface[i];
      if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
        return alias.address;
      }
    }
  }
  return 'localhost';
}

// Network discovery via UDP broadcast
function startNetworkDiscovery() {
  const server = dgram.createSocket('udp4');
  
  server.on('message', (msg, rinfo) => {
    const message = msg.toString();
    if (message === 'FILE_SHARE_DISCOVERY') {
      const localIP = getLocalIPAddress();
      const response = JSON.stringify({
        service: 'file-share',
        name: 'Windows File Share',
        ip: localIP,
        port: PORT,
        url: `http://${localIP}:${PORT}`
      });
      
      server.send(response, rinfo.port, rinfo.address, (err) => {
        if (!err) {
          console.log(`📡 Discovery response sent to ${rinfo.address}:${rinfo.port}`);
        }
      });
    }
  });
  
  server.bind(41234, () => {
    console.log('📡 Network discovery service started on port 41234');
  });
  
  return server;
}

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Debug endpoint to check MIME types
app.get('/api/debug/mimetypes', (req, res) => {
  const allowedMimeTypes = [
    'image/',                                    
    'application/pdf',                          
    'text/',                                    
    'application/msword',                       
    'application/vnd.openxmlformats-officedocument', 
    'application/vnd.ms-excel',                 
    'application/vnd.ms-powerpoint',            
    'video/',                                   
    'audio/',                                   
    'application/zip',                          
    'application/x-zip-compressed',             
    'application/x-rar-compressed',             
    'application/x-7z-compressed',              
    'application/json',                         
    'application/octet-stream'                  
  ];
  
  res.json({
    allowedMimeTypes,
    examples: {
      'PNG Image': 'image/png',
      'JPEG Image': 'image/jpeg', 
      'PDF Document': 'application/pdf',
      'Word Doc': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'Excel': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Text File': 'text/plain',
      'ZIP Archive': 'application/zip'
    }
  });
});

// Get server info and QR code
app.get('/api/server-info', async (req, res) => {
  try {
    const localIP = getLocalIPAddress();
    const serverUrl = `http://${localIP}:${PORT}`;
    const qrCodeDataUrl = await QRCode.toDataURL(serverUrl);
    
    res.json({
      serverUrl,
      localIP,
      port: PORT,
      qrCode: qrCodeDataUrl
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate server info' });
  }
});

// Get list of files
app.get('/api/files', async (req, res) => {
  try {
    const files = await fs.readdir(UPLOAD_DIR);
    const fileList = await Promise.all(
      files.map(async (filename) => {
        const filePath = path.join(UPLOAD_DIR, filename);
        const stats = await fs.stat(filePath);
        const mimeType = mime.lookup(filename) || 'application/octet-stream';
        
        return {
          name: filename,
          originalName: filename.substring(filename.indexOf('-') + 1), // Remove timestamp prefix
          size: stats.size,
          modified: stats.mtime,
          mimeType: mimeType,
          isImage: mimeType.startsWith('image/'),
          isPDF: mimeType === 'application/pdf'
        };
      })
    );
    
    res.json(fileList);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read files' });
  }
});

// Upload files
app.post('/api/upload', uploadLimiter, upload.array('files', 10), (req, res) => {
  try {
    console.log('Upload request received');
    console.log('Files in request:', req.files ? req.files.length : 0);
    
    if (!req.files || req.files.length === 0) {
      console.log('No files in upload request');
      return res.status(400).json({ error: 'No files uploaded' });
    }
    
    console.log('Files to validate:', req.files.map(f => ({ name: f.originalname, type: f.mimetype })));
    
    // Validate file types and sizes
    const allowedMimeTypes = [
      'image/',                                    // All image types
      'application/pdf',                          // PDF files
      'text/',                                    // All text files
      'application/msword',                       // DOC files
      'application/vnd.openxmlformats-officedocument', // DOCX, XLSX, PPTX
      'application/vnd.ms-excel',                 // XLS files
      'application/vnd.ms-powerpoint',            // PPT files
      'video/',                                   // All video files
      'audio/',                                   // All audio files
      'application/zip',                          // ZIP files
      'application/x-zip-compressed',             // ZIP files (alternative)
      'application/x-rar-compressed',             // RAR files
      'application/x-7z-compressed',              // 7Z files
      'application/json',                         // JSON files
      'application/octet-stream'                  // Generic binary files
    ];
    
    for (const file of req.files) {
      console.log(`Checking file: ${file.originalname}, MIME type: ${file.mimetype}`);
      
      const isAllowed = allowedMimeTypes.some(type => {
        return file.mimetype === type || file.mimetype.startsWith(type);
      });
      
      console.log(`File ${file.originalname} allowed: ${isAllowed}`);
      
      if (!isAllowed) {
        console.error(`File type not allowed: ${file.mimetype} for file: ${file.originalname}`);
        // Clean up uploaded files
        req.files.forEach(f => {
          try {
            fs.unlinkSync(f.path);
          } catch (e) {}
        });
        return res.status(400).json({ 
          error: `File type not allowed: ${file.mimetype}. Allowed types: images, PDFs, documents, videos, audio, archives` 
        });
      }
    }
    
    console.log('All files validated successfully');
    
    const uploadedFiles = req.files.map(file => ({
      name: file.filename,
      originalName: file.originalname,
      size: file.size,
      mimeType: file.mimetype
    }));
    
    console.log('Files processed:', uploadedFiles.length);
    
    // Emit to all connected clients
    io.emit('files-updated', { action: 'upload', files: uploadedFiles });
    
    const response = { 
      message: 'Files uploaded successfully', 
      files: uploadedFiles 
    };
    
    console.log('Sending success response:', response);
    res.json(response);
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Upload failed' });
  }
});

// Download file
app.get('/api/download/:filename', (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(UPLOAD_DIR, filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    const originalName = filename.substring(filename.indexOf('-') + 1);
    res.download(filePath, originalName);
  } catch (error) {
    res.status(500).json({ error: 'Download failed' });
  }
});

// Delete file
app.delete('/api/delete/:filename', async (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(UPLOAD_DIR, filename);
    
    if (!await fs.pathExists(filePath)) {
      return res.status(404).json({ error: 'File not found' });
    }
    
    await fs.remove(filePath);
    
    // Emit to all connected clients
    io.emit('files-updated', { action: 'delete', filename });
    
    res.json({ message: 'File deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Delete failed' });
  }
});

// Download all files as ZIP
app.get('/api/download-all', (req, res) => {
  try {
    const archive = archiver('zip', {
      zlib: { level: 9 }
    });
    
    res.attachment('shared-files.zip');
    archive.pipe(res);
    
    // Add all files to archive
    fs.readdir(UPLOAD_DIR, (err, files) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to read files' });
      }
      
      files.forEach(filename => {
        const filePath = path.join(UPLOAD_DIR, filename);
        const originalName = filename.substring(filename.indexOf('-') + 1);
        archive.file(filePath, { name: originalName });
      });
      
      archive.finalize();
    });
  } catch (error) {
    res.status(500).json({ error: 'Archive creation failed' });
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Start server
server.listen(PORT, '0.0.0.0', () => {
  const localIP = getLocalIPAddress();
  const serverUrl = `http://${localIP}:${PORT}`;
  
  // Start network discovery
  const discoveryServer = startNetworkDiscovery();
  
  console.clear(); // Clear console for clean output
  console.log('');
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║                    FILE SHARE SERVER STARTED                ║');
  console.log('╠══════════════════════════════════════════════════════════════╣');
  console.log('║                   Created by Mehmet Kahya                   ║');
  console.log('╠══════════════════════════════════════════════════════════════╣');
  console.log('║                                                              ║');
  console.log(`║  📱 iOS DEVICE URL: ${serverUrl}${' '.repeat(26 - serverUrl.length)}║`);
  console.log('║                                                              ║');
  console.log(`║  🖥️  Local Access:  http://localhost:${PORT}                     ║`);
  console.log('║                                                              ║');
  console.log('╠══════════════════════════════════════════════════════════════╣');
  console.log('║  � QR CODE - Scan with iPhone Camera:                      ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log('');
  
  // Generate QR code in terminal
  qrTerminal.generate(serverUrl, { small: true }, (qrcode) => {
    // Add padding and border to QR code
    const qrLines = qrcode.split('\n');
    const maxLength = Math.max(...qrLines.map(line => line.length));
    
    console.log('┌' + '─'.repeat(maxLength + 2) + '┐');
    qrLines.forEach(line => {
      console.log('│ ' + line.padEnd(maxLength) + ' │');
    });
    console.log('└' + '─'.repeat(maxLength + 2) + '┘');
    console.log('');
    
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║  �💡 INSTRUCTIONS FOR iOS:                                   ║');
    console.log('║     1. Connect your iPhone/iPad to the same WiFi network    ║');
    console.log('║     2. Open Camera app and point at QR code above           ║');
    console.log('║     3. Tap the notification to open in Safari               ║');
    console.log('║     4. Bookmark the page for easy access                    ║');
    console.log('║                                                              ║');
    console.log('║  🔧 Alternative: Open Safari and type the URL manually      ║');
    console.log(`║     ${serverUrl}${' '.repeat(49 - serverUrl.length)}║`);
    console.log('║                                                              ║');
    console.log('║  📡 Network discovery enabled - Auto-discovery available    ║');
    console.log('║  🔒 Make sure Windows Firewall allows Node.js connections   ║');
    console.log('║                                                              ║');
    console.log('║  🛑 Press Ctrl+C to stop the server                         ║');
    console.log('╚══════════════════════════════════════════════════════════════╝');
    console.log('');
    console.log(`📡 Network discovery service started on port 41234`);
    console.log('');
  });
  
  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down server...');
    discoveryServer.close();
    server.close(() => {
      console.log('✅ Server stopped');
      process.exit(0);
    });
  });
});