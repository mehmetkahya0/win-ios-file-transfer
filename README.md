# Windows to iOS File Share System

A lightweight, secure file sharing system designed for seamless transfer of files from Windows computers to iOS devices over a local network. This web-based application provides an intuitive interface accessible through any web browser on iOS devices.

## Features

- **Cross-Platform Compatibility**: Share files from Windows to any devi## File Structure

```
win-ios-file-transfer/
├── server.js              # Main server application
├── package.json           # Node.js dependencies
├── start-server.bat       # Windows startup script
├── uploads/               # Directory for uploaded files (created automatically)
└── public/                # Web interface files
    ├── index.html         # Main web page
    ├── styles.css         # Styling
    ├── app.js            # Client-side JavaScript
    ├── sw.js             # Service Worker for PWA
    └── manifest.json     # PWA manifest
```rowser
- **Real-Time Updates**: Live progress tracking and file management using WebSocket connections
- **QR Code Access**: Automatically generates QR codes for easy mobile device connection
- **Progressive Web App**: Can be installed on iOS devices for a native app-like experience
- **Secure Transfer**: Rate limiting and security headers to protect against abuse
- **Multiple File Support**: Upload multiple files simultaneously with drag-and-drop support
- **File Management**: Browse, download, and delete uploaded files
- **Bulk Operations**: Download multiple files as a ZIP archive
- **Mobile Optimized**: Responsive design specifically optimized for iOS Safari
- **Network Discovery**: Automatic IP address detection and QR code generation

## Technology Stack

- **Backend**: Node.js with Express.js framework
- **File Upload**: Multer middleware with configurable size limits
- **Real-Time Communication**: Socket.IO for live updates
- **Security**: Helmet.js for security headers and express-rate-limit for protection
- **File Compression**: Archiver for ZIP file creation
- **QR Code Generation**: QRCode library for easy mobile access
- **Cross-Origin Support**: CORS middleware for cross-platform compatibility

## Prerequisites

- Node.js (version 14 or higher)
- npm (Node Package Manager)
- Windows operating system (for the server)
- iOS device with Safari browser (for file access)

## Installation

1. **Clone or download the repository**:
   ```
   git clone https://github.com/mehmetkahya0/win-ios-file-transfer.git
   cd win-ios-file-transfer
   ```

2. **Install dependencies**:
   ```
   npm install
   ```

3. **Create uploads directory** (if not exists):
   The application will automatically create the uploads directory on first run.

## Usage

### Starting the Server

#### Option 1: Using npm scripts
```
npm start
```

#### Option 2: Using batch files (Windows)
- **Development mode**: Double-click `start-server.bat`
- **Debug mode**: Double-click `start-debug.bat`

#### Option 3: Manual start
```
node server.js
```

### Accessing the Application

1. **Start the server** using one of the methods above
2. **Note the server information** displayed in the console:
   - Local IP address
   - Port number (default: 3000)
   - QR code for mobile access
3. **On your iOS device**:
   - Scan the QR code with your camera app, or
   - Open Safari and navigate to `http://[IP-ADDRESS]:3000`

### File Operations

#### Uploading Files
- Tap the upload area to select files from your device
- Or drag and drop files onto the upload area
- Click "Upload Files" to start the transfer
- Monitor real-time progress for each file

#### Managing Files
- View all uploaded files in the file list
- Download individual files by tapping on them
- Delete files using the delete button
- Download multiple files as a ZIP archive

#### Installing as PWA
1. Open the application in Safari on iOS
2. Tap the Share button
3. Select "Add to Home Screen"
4. The app will be available as a standalone application

## Configuration

### Environment Variables

The application supports the following environment variables:

- `PORT`: Server port (default: 3000)

### Security Settings

- **Rate Limiting**: 50 uploads per 15 minutes per IP
- **File Size Limit**: 100MB per file
- **Upload Directory**: `./uploads` (configurable)

### Network Configuration

The server automatically detects available network interfaces and displays:
- Local IP addresses
- QR codes for easy mobile access
- Network interface information

## API Endpoints

### File Upload
- **POST** `/upload`
  - Accepts multipart/form-data
  - Multiple files supported
  - Returns upload status and file information

### File Management
- **GET** `/files` - List all uploaded files
- **GET** `/download/:filename` - Download specific file
- **DELETE** `/files/:filename` - Delete specific file
- **GET** `/download-all` - Download all files as ZIP

### System Information
- **GET** `/status` - Server status and statistics
- **GET** `/` - Main application interface

## File Structure

```
win-ios-file-transfer/
├── public/                 # Client-side files
│   ├── index.html         # Main application interface
│   ├── app.js             # Client-side JavaScript
│   ├── styles.css         # Application styling
│   ├── manifest.json      # PWA manifest
│   ├── sw.js              # Service worker
│   └── icons/             # Application icons
├── uploads/               # File storage directory
├── server.js              # Main server application
├── package.json           # Project dependencies
├── start-server.bat       # Windows startup script
├── start-debug.bat        # Debug startup script
└── README.md              # This file
```

## Security Considerations

- The application is designed for local network use only
- Rate limiting prevents abuse
- File uploads are restricted by size and quantity
- No authentication is implemented (suitable for trusted local networks)
- Consider firewall settings when running on production networks

## Troubleshooting

### Common Issues

1. **Cannot access from iOS device**:
   - Ensure both devices are on the same network
   - Check firewall settings on Windows
   - Verify the correct IP address is being used

2. **File upload fails**:
   - Check file size (must be under 100MB)
   - Ensure sufficient disk space
   - Verify network connectivity

3. **QR code not working**:
   - Try manually entering the URL in Safari
   - Ensure QR code scanner has camera permissions

### Debug Mode

Run in debug mode for additional logging:
```
npm run dev
```

Or use the debug batch file: `start-debug.bat`

## Development

### Running in Development Mode
```
npm run dev
```

This uses nodemon for automatic server restart on file changes.

### Adding Features

The application is built with modularity in mind:
- Client-side code in `/public`
- Server routes in `server.js`
- WebSocket events for real-time updates
- Progressive Web App capabilities

## License

This project is licensed under the MIT License. See the LICENSE file for details.

## Contributing

1. Fork the repository at [https://github.com/mehmetkahya0/win-ios-file-transfer](https://github.com/mehmetkahya0/win-ios-file-transfer)
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the console output for error messages
3. Ensure all prerequisites are met
4. Verify network connectivity between devices
5. Create an issue at [https://github.com/mehmetkahya0/win-ios-file-transfer/issues](https://github.com/mehmetkahya0/win-ios-file-transfer/issues)

A local network file sharing system that allows Windows computers to share files with iOS devices seamlessly. No cloud services required - everything works on your local network!

## 🌟 Features

- **Easy File Sharing**: Share images, PDFs, documents, and more between Windows and iOS
- **No Internet Required**: Works entirely on your local network
- **Mobile-Friendly Interface**: Optimized web interface that works great on iOS Safari
- **Real-time Updates**: See file uploads and deletions in real-time using WebSocket
- **QR Code Access**: Generate QR codes for easy iOS device connection
- **Network Discovery**: Automatic server discovery for iOS devices
- **Drag & Drop Upload**: Easy file uploads via drag and drop or file selection
- **File Preview**: Preview images and PDFs directly in the browser
- **Batch Operations**: Upload multiple files at once or download all as ZIP
- **Security**: Built-in rate limiting and security headers

## 🚀 Quick Start

### Prerequisites

- **Windows Computer**: Windows 10/11 recommended
- **Node.js**: Download and install from [nodejs.org](https://nodejs.org/) (LTS version recommended)
- **iOS Device**: iPhone or iPad with Safari browser

### Installation

1. **Download/Clone the project** to your Windows computer
2. **Double-click `start-server.bat`** - This will automatically:
   - Install all required dependencies
   - Start the file sharing server
   - Display connection information

### Connecting from iOS

#### Method 1: QR Code (Recommended)
1. Open the web interface on your Windows computer
2. Click "Server Info" button
3. Use your iPhone/iPad camera to scan the QR code
4. Safari will open automatically with the file sharing interface

#### Method 2: Manual URL Entry
1. Note the "Network" URL displayed in the Windows terminal (e.g., `http://192.168.1.100:3000`)
2. Open Safari on your iOS device
3. Enter the URL in the address bar
4. Bookmark the page for quick access

## 📱 How to Use

### Uploading Files from iOS
1. Open the file sharing interface in Safari
2. Tap the upload area or use drag & drop
3. Select files from your iPhone/iPad (Photos, Files app, etc.)
4. Tap "Upload Files"
5. Files will appear in the shared files grid

### Downloading Files to iOS
1. Tap any file in the grid to preview it
2. For images and PDFs, you'll see a preview
3. Tap "Download" to save to your device
4. Use "Download All" to get a ZIP file with all shared files

### Managing Files
- **Delete**: Tap a file, then tap "Delete" in the preview
- **Refresh**: Tap the refresh button to update the file list
- **Real-time Updates**: Changes appear automatically on all connected devices

## 🔧 Configuration

### Default Settings
- **Port**: 3000 (customizable via environment variable `PORT`)
- **Upload Limit**: 100MB per file
- **Rate Limiting**: 50 uploads per 15 minutes per IP
- **Supported Files**: Images, PDFs, documents, videos, audio, archives, text files

### Changing the Port
Create a `.env` file in the project directory:
```
PORT=8080
```

### Custom Upload Directory
Edit `server.js` and change the `UPLOAD_DIR` variable to your preferred location.

## 🛡️ Security Features

- **Rate Limiting**: Prevents abuse with configurable limits
- **File Type Validation**: Only allows safe file types
- **Security Headers**: Helmet.js provides security headers
- **Input Validation**: All uploads and requests are validated
- **Local Network Only**: Server binds to all interfaces but works best on local network

## 🚨 Troubleshooting

### "Cannot connect to server" on iOS
1. **Check Windows Firewall**: Make sure it allows Node.js connections
   - Go to Windows Defender Firewall → Allow an app through firewall
   - Add Node.js if not present
2. **Verify Network**: Both devices must be on the same WiFi network
3. **Check IP Address**: Use `ipconfig` in Windows terminal to verify IP
4. **Try Different Port**: Some networks block certain ports

### Server won't start
1. **Node.js Installation**: Run `node --version` in Command Prompt
2. **Port Conflicts**: Close other applications using port 3000
3. **Dependencies**: Delete `node_modules` folder and run `npm install`

### Files not uploading
1. **File Size**: Ensure files are under 100MB
2. **File Type**: Check if file type is supported
3. **Network Connection**: Verify stable WiFi connection
4. **Storage Space**: Ensure Windows computer has enough disk space

### Slow Performance
1. **Network Quality**: Check WiFi signal strength
2. **File Size**: Large files take longer to transfer
3. **Multiple Users**: Performance may decrease with many simultaneous users

## 🖥️ Advanced Usage

### Running as Windows Service
To run the server automatically when Windows starts:

1. Install `pm2` globally:
   ```bash
   npm install -g pm2
   npm install -g pm2-windows-service
   ```

2. Setup the service:
   ```bash
   pm2 start server.js --name "file-share"
   pm2 save
   pm2-service-install
   ```

### Network Configuration
For advanced users who want to access from different subnets:
1. Configure router port forwarding (port 3000)
2. Update Windows Firewall rules
3. Use static IP for Windows computer

### Custom Domain
Add entries to your router's DNS settings to use a custom domain like `http://fileshare.local:3000`

## 🔐 Security Considerations

- **Local Network Only**: This system is designed for trusted local networks
- **No Authentication**: By default, anyone on the network can access files
- **File Permissions**: Uploaded files are stored with standard file permissions
- **HTTPS**: Consider using a reverse proxy with HTTPS for additional security

## 📁 File Structure

```
win-ios-file-transfer/
├── server.js              # Main server application
├── package.json           # Node.js dependencies
├── start-server.bat       # Windows startup script
├── uploads/               # Directory for uploaded files (created automatically)
└── public/                # Web interface files
    ├── index.html         # Main web page
    ├── styles.css         # Styling
    ├── app.js            # Client-side JavaScript
    ├── sw.js             # Service Worker for PWA
    └── manifest.json     # PWA manifest
```

## 🤝 Contributing

Feel free to submit issues, feature requests, or pull requests to improve this file sharing system at [https://github.com/mehmetkahya0/win-ios-file-transfer](https://github.com/mehmetkahya0/win-ios-file-transfer)!

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 💡 Tips for Best Experience

1. **Bookmark on iOS**: Add the page to your iOS home screen for app-like experience
2. **WiFi Signal**: Ensure strong WiFi signal for best transfer speeds
3. **File Organization**: Use descriptive filenames for easier management
4. **Regular Cleanup**: Periodically delete old files to save storage space
5. **Backup Important Files**: This system is for temporary sharing, not permanent storage

## 🎯 Use Cases

- **Photo Sharing**: Quickly share photos from iPhone to Windows PC
- **Document Transfer**: Move PDFs and documents between devices
- **Work Files**: Share presentations, spreadsheets, and other work files
- **Media Files**: Transfer videos and audio files
- **Quick Backup**: Temporary backup of important files from iOS to PC

---

**Need Help?** Check the troubleshooting section above or create an issue at [https://github.com/mehmetkahya0/win-ios-file-transfer/issues](https://github.com/mehmetkahya0/win-ios-file-transfer/issues).