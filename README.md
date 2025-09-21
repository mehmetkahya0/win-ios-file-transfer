# Windows to iOS File Share System

A secure, local network file sharing solution that enables seamless file transfer between Windows computers and iOS devices. This web-based application creates a local server that iOS devices can access through a web browser to upload and download files.

## Features

### Core Features
- **Cross-platform file sharing** between Windows and iOS devices
- **Drag and drop file upload** support
- **Multiple file selection** for batch operations
- **Real-time file list updates** using WebSocket technology
- **Progressive Web App (PWA)** support for iOS home screen installation
- **Download all files** as a ZIP archive
- **QR code generation** for easy mobile device connection
- **Automatic network discovery** and IP address detection

### Security Features
- **Rate limiting** to prevent abuse (50 uploads per 15 minutes, 1000 requests per 15 minutes)
- **File size limits** (100MB per file)
- **Helmet.js security headers**
- **CORS protection**
- **Input sanitization**

### User Experience
- **Responsive design** optimized for mobile devices
- **Touch-friendly interface** for iOS devices
- **Real-time upload progress** tracking
- **File type detection** and appropriate icons
- **Cache-busting** to ensure latest version loads

## Prerequisites

- **Node.js** (version 14 or higher)
- **npm** (Node Package Manager)
- **Windows operating system** (for the server)
- **iOS device** with Safari browser (for file access)
- **Local network connection** (both devices must be on the same network)

## Installation

1. **Clone or download** the project to your Windows computer:
   ```bash
   git clone https://github.com/mehmetkahya0/win-ios-file-transfer.git
   cd wintoios-file-share-system
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Verify installation** by checking if all required packages are installed:
   ```bash
   npm list
   ```

## Usage

### Starting the Server

#### Method 1: Using Batch File (Recommended for Windows)
1. Double-click `start-server.bat`
2. The batch file will:
   - Check for Node.js installation
   - Install dependencies if needed
   - Start the server
   - Display QR code and connection information

#### Method 2: Using Command Line
1. Open Command Prompt or PowerShell in the project directory
2. Run the server:
   ```bash
   npm start
   ```

#### Method 3: Development Mode (with auto-restart)
```bash
npm run dev
```

### Connecting from iOS Device

1. **Ensure both devices are on the same Wi-Fi network**
2. **Note the server URL** displayed in the terminal (e.g., `http://192.168.1.100:3000`)
3. **On your iOS device**:
   - Open Safari browser
   - Navigate to the displayed URL
   - Or scan the QR code shown in the terminal

### Installing as PWA on iOS

1. **Open the web app** in Safari on your iOS device
2. **Tap the Share button** (square with arrow pointing up)
3. **Select "Add to Home Screen"**
4. **Customize the name** if desired and tap "Add"
5. **Launch from home screen** for a native app-like experience

### File Operations

#### Uploading Files
- **Tap the upload area** to select files
- **Drag and drop files** onto the upload area (on compatible devices)
- **Select multiple files** using the file picker
- **Click "Upload Files"** to transfer selected files

#### Downloading Files
- **Individual files**: Tap any file in the grid to download
- **All files**: Use the "Download All" button to get a ZIP archive
- **File information**: View file names, sizes, and upload dates

#### Managing Files
- **Real-time updates**: File list updates automatically when new files are added
- **File persistence**: Uploaded files remain available until manually deleted from the uploads folder
- **File organization**: Files are stored with timestamps to prevent naming conflicts

## Configuration

### Port Configuration
By default, the server runs on port 3000. To change this:

1. **Set environment variable**:
   ```bash
   set PORT=8080
   npm start
   ```

2. **Or modify the server.js file** and change the PORT constant

### Upload Directory
Files are stored in the `uploads` folder by default. This can be modified in `server.js` by changing the `UPLOAD_DIR` constant.

### Security Settings
Rate limiting and file size limits can be adjusted in `server.js`:
- **Upload rate limit**: Currently 50 uploads per 15 minutes
- **General rate limit**: Currently 1000 requests per 15 minutes
- **File size limit**: Currently 100MB per file

## File Structure

```
wintoios-file-share-system/
├── public/                    # Client-side files
│   ├── index.html            # Main web interface
│   ├── app.js               # Client-side JavaScript
│   ├── styles.css           # Styling
│   ├── manifest.json        # PWA manifest
│   ├── sw.js               # Service worker for PWA
│   ├── icon-192.svg        # PWA icon (192x192)
│   ├── icon-512.svg        # PWA icon (512x512)
│   └── test.html           # Testing page
├── uploads/                  # Uploaded files storage
├── server.js                # Main server application
├── package.json             # Node.js dependencies
├── start-server.bat         # Windows batch starter
├── start-debug.bat          # Debug mode starter
├── create-icons.js          # Icon generation utility
└── README.md               # This file
```

## API Endpoints

### File Operations
- `GET /` - Serve main web interface
- `POST /upload` - Upload files to server
- `GET /files` - Get list of uploaded files
- `GET /files/:filename` - Download specific file
- `GET /download-all` - Download all files as ZIP
- `DELETE /files/:filename` - Delete specific file

### Server Information
- `GET /server-info` - Get server status and network information
- `GET /qr` - Get QR code for easy mobile connection

### WebSocket Events
- `connection` - Client connected
- `disconnect` - Client disconnected
- `fileListUpdate` - Broadcast file list changes

## Troubleshooting

### Common Issues

#### Server Won't Start
- **Check Node.js installation**: Run `node --version`
- **Verify dependencies**: Run `npm install`
- **Check port availability**: Ensure port 3000 is not in use
- **Run as administrator**: Some Windows configurations require elevated privileges

#### iOS Device Can't Connect
- **Verify network connection**: Both devices must be on same Wi-Fi
- **Check firewall settings**: Windows firewall may block the connection
- **Try different browsers**: Use Safari on iOS for best compatibility
- **Check IP address**: Ensure you're using the correct IP address shown in terminal

#### File Upload Issues
- **Check file size**: Files must be under 100MB
- **Verify disk space**: Ensure sufficient storage in uploads directory
- **Rate limiting**: Wait if you've hit the upload rate limit
- **Browser compatibility**: Some older browsers may have issues

#### PWA Installation Problems
- **Use Safari**: PWA installation only works in Safari on iOS
- **Check manifest**: Ensure manifest.json is accessible
- **Clear cache**: Clear browser cache and try again

### Debug Mode
Use the debug batch file for detailed logging:
```bash
start-debug.bat
```

This provides additional console output for troubleshooting.

### Firewall Configuration
If iOS devices can't connect, configure Windows Firewall:
1. Open Windows Defender Firewall
2. Click "Allow an app or feature through Windows Defender Firewall"
3. Click "Change Settings" then "Allow another app"
4. Browse to Node.js executable or add port 3000

## Development

### Adding New Features
1. **Modify server.js** for backend changes
2. **Update public/app.js** for frontend functionality
3. **Adjust public/styles.css** for styling changes
4. **Test on both Windows and iOS** devices

### Dependencies
Key packages used:
- **express**: Web server framework
- **multer**: File upload handling
- **socket.io**: Real-time communication
- **qrcode**: QR code generation
- **archiver**: ZIP file creation
- **helmet**: Security headers
- **express-rate-limit**: Rate limiting

### Contributing
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly on both platforms
5. Submit a pull request

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

## Support

For issues and questions:
1. Check the troubleshooting section above
2. Review the console output for error messages
3. Ensure all prerequisites are met
4. Test with different devices and network configurations

## Version History

- **v1.0.0**: Initial release with core file sharing functionality
- PWA support for iOS devices
- Real-time file updates
- Security features and rate limiting
- QR code generation for easy connection

## Technical Notes

### Network Requirements
- Both Windows computer and iOS device must be on the same local network
- No internet connection required after initial setup
- Works with Wi-Fi networks, not recommended for public networks

### Performance Considerations
- File transfer speed depends on local network speed
- Large files (approaching 100MB limit) may take time to upload
- Multiple simultaneous uploads are supported but may affect performance

### Browser Compatibility
- **iOS**: Safari (recommended), Chrome, Firefox
- **Desktop**: Any modern browser for testing/admin access
- **PWA features**: Best support in Safari on iOS

This file sharing system provides a secure, efficient way to transfer files between Windows and iOS devices without requiring cloud services or complex setup procedures.