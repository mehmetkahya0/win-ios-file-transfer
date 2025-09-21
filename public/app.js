class FileShareApp {
    constructor() {
        this.socket = io();
        this.selectedFiles = [];
        this.currentPreviewFile = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupSocketListeners();
        this.loadFiles();
        this.loadServerInfo();
    }

    setupEventListeners() {
        // File input and upload area
        const fileInput = document.getElementById('fileInput');
        const uploadArea = document.getElementById('uploadArea');
        const uploadBtn = document.getElementById('uploadBtn');

        console.log('Setting up event listeners...');
        console.log('Upload button found:', !!uploadBtn);
        console.log('File input found:', !!fileInput);
        console.log('Upload area found:', !!uploadArea);

        uploadArea.addEventListener('click', () => {
            console.log('Upload area clicked, opening file dialog...');
            fileInput.click();
        });
        fileInput.addEventListener('change', (e) => {
            console.log('Files selected:', e.target.files.length);
            this.handleFileSelection(e.target.files);
        });
        uploadBtn.addEventListener('click', () => {
            console.log('Upload button clicked, starting upload...');
            this.uploadFiles();
        });

        // Drag and drop
        uploadArea.addEventListener('dragover', (e) => this.handleDragOver(e));
        uploadArea.addEventListener('dragleave', (e) => this.handleDragLeave(e));
        uploadArea.addEventListener('drop', (e) => this.handleDrop(e));

        // Other buttons
        document.getElementById('refreshBtn').addEventListener('click', () => this.loadFiles());
        document.getElementById('downloadAllBtn').addEventListener('click', () => this.downloadAll());
        document.getElementById('serverInfoBtn').addEventListener('click', () => {
            console.log('Server Info button clicked!');
            this.showServerInfo();
        });

        // Modal controls
        document.getElementById('closeModalBtn').addEventListener('click', () => this.hideModal('serverInfoModal'));
        document.getElementById('closePreviewBtn').addEventListener('click', () => this.hideModal('filePreviewModal'));
        document.getElementById('downloadFileBtn').addEventListener('click', () => this.downloadCurrentFile());
        document.getElementById('deleteFileBtn').addEventListener('click', () => this.deleteCurrentFile());

        // Click outside modal to close
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.hideModal(e.target.id);
            }
        });
    }

    setupSocketListeners() {
        this.socket.on('files-updated', (data) => {
            console.log('Files updated:', data);
            this.loadFiles();
            this.showNotification(`Files ${data.action}d successfully`);
        });

        this.socket.on('connect', () => {
            console.log('Connected to server');
        });

        this.socket.on('disconnect', () => {
            console.log('Disconnected from server');
        });
    }

    async loadServerInfo() {
        try {
            const response = await fetch('/api/server-info');
            const data = await response.json();
            
            document.getElementById('serverDetails').innerHTML = `
                <div class="server-details">
                    <p><strong>Server URL:</strong> ${data.serverUrl}</p>
                    <p><strong>Local IP:</strong> ${data.localIP}</p>
                    <p><strong>Port:</strong> ${data.port}</p>
                    <div class="qr-code">
                        <p><strong>QR Code for easy access:</strong></p>
                        <img src="${data.qrCode}" alt="QR Code" />
                        <p><small>Scan with iPhone camera to open</small></p>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Failed to load server info:', error);
        }
    }

    async loadFiles() {
        try {
            this.showLoading(true);
            const response = await fetch('/api/files');
            const files = await response.json();
            this.renderFiles(files);
        } catch (error) {
            console.error('Failed to load files:', error);
            this.showNotification('Failed to load files', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    renderFiles(files) {
        const filesList = document.getElementById('filesList');
        
        if (files.length === 0) {
            filesList.innerHTML = `
                <div class="file-item" style="grid-column: 1 / -1; text-align: center; opacity: 0.6;">
                    <div class="file-icon">📂</div>
                    <p>No files shared yet</p>
                    <small>Upload some files to get started</small>
                </div>
            `;
            return;
        }

        filesList.innerHTML = files.map(file => {
            const icon = this.getFileIcon(file);
            const sizeFormatted = this.formatFileSize(file.size);
            
            return `
                <div class="file-item" onclick="fileShareApp.previewFile('${file.name}')">
                    ${file.isImage ? 
                        `<img src="/uploads/${file.name}" alt="${file.originalName}" class="file-preview-img" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" />
                         <div class="file-icon" style="display: none;">${icon}</div>` :
                        `<div class="file-icon">${icon}</div>`
                    }
                    <div class="file-name" title="${file.originalName}">${this.truncateFileName(file.originalName)}</div>
                    <div class="file-size">${sizeFormatted}</div>
                </div>
            `;
        }).join('');
    }

    getFileIcon(file) {
        if (file.isImage) return '🖼️';
        if (file.isPDF) return '📄';
        if (file.mimeType.startsWith('video/')) return '🎥';
        if (file.mimeType.startsWith('audio/')) return '🎵';
        if (file.mimeType.includes('zip') || file.mimeType.includes('archive')) return '📦';
        if (file.mimeType.includes('text/')) return '📝';
        return '📄';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    truncateFileName(fileName, maxLength = 20) {
        if (fileName.length <= maxLength) return fileName;
        const ext = fileName.split('.').pop();
        const name = fileName.substring(0, fileName.lastIndexOf('.'));
        const truncatedName = name.substring(0, maxLength - ext.length - 4) + '...';
        return truncatedName + '.' + ext;
    }

    handleFileSelection(files) {
        console.log('Handling file selection:', files.length, 'files');
        this.selectedFiles = Array.from(files);
        console.log('Selected files:', this.selectedFiles.map(f => f.name));
        this.updateUploadButton();
        this.updateUploadArea();
    }

    updateUploadButton() {
        const uploadBtn = document.getElementById('uploadBtn');
        const wasDisabled = uploadBtn.disabled;
        uploadBtn.disabled = this.selectedFiles.length === 0;
        uploadBtn.textContent = this.selectedFiles.length > 0 
            ? `Upload ${this.selectedFiles.length} file(s)` 
            : 'Upload Files';
        console.log('Upload button updated - disabled:', uploadBtn.disabled, 'was disabled:', wasDisabled);
    }

    updateUploadArea() {
        const uploadArea = document.getElementById('uploadArea');
        if (this.selectedFiles.length > 0) {
            uploadArea.innerHTML = `
                <div class="upload-icon">📁</div>
                <p>${this.selectedFiles.length} file(s) selected</p>
                <small>${this.selectedFiles.map(f => f.name).join(', ')}</small>
            `;
        } else {
            uploadArea.innerHTML = `
                <div class="upload-icon">📁</div>
                <p>Tap to select files or drag & drop</p>
            `;
        }
    }

    handleDragOver(e) {
        e.preventDefault();
        e.currentTarget.classList.add('dragover');
    }

    handleDragLeave(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('dragover');
    }

    handleDrop(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('dragover');
        const files = e.dataTransfer.files;
        this.handleFileSelection(files);
    }

    async uploadFiles() {
        console.log('Upload function called with', this.selectedFiles.length, 'files');
        
        if (this.selectedFiles.length === 0) {
            console.warn('No files selected for upload');
            this.showNotification('No files selected', 'error');
            return;
        }

        try {
            this.showLoading(true);
            console.log('Creating FormData...');
            const formData = new FormData();
            
            this.selectedFiles.forEach((file, index) => {
                console.log(`Adding file ${index + 1}:`, file.name, file.size, 'bytes');
                formData.append('files', file);
            });

            console.log('Sending upload request...');
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData
            });

            console.log('Upload response status:', response.status);
            console.log('Upload response headers:', Object.fromEntries(response.headers.entries()));
            
            if (!response.ok) {
                const errorText = await response.text();
                console.error('Upload error response (raw):', errorText);
                console.error('Upload error response (length):', errorText.length);
                
                // Try to parse JSON error response
                let errorMessage = `Upload failed: ${response.status}`;
                try {
                    const errorData = JSON.parse(errorText);
                    console.log('Parsed error data:', errorData);
                    if (errorData.error) {
                        errorMessage = errorData.error;
                    }
                } catch (e) {
                    console.error('Failed to parse error response as JSON:', e);
                    // If not JSON, use the raw text
                    errorMessage = errorText || errorMessage;
                }
                
                throw new Error(errorMessage);
            }

            const responseText = await response.text();
            console.log('Upload success response (raw):', responseText);
            console.log('Upload success response (length):', responseText.length);
            
            let result;
            try {
                result = JSON.parse(responseText);
                console.log('Upload successful (parsed):', result);
            } catch (e) {
                console.error('Failed to parse success response as JSON:', e);
                console.error('Response was:', responseText);
                throw new Error('Server returned invalid JSON response');
            }
            this.showNotification(`${result.files.length} file(s) uploaded successfully`);
            
            // Reset form
            this.selectedFiles = [];
            document.getElementById('fileInput').value = '';
            this.updateUploadButton();
            this.updateUploadArea();
            
            // Refresh file list
            this.loadFiles();
        } catch (error) {
            console.error('Upload failed:', error);
            this.showNotification(`Upload failed: ${error.message}`, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async previewFile(filename) {
        try {
            const response = await fetch('/api/files');
            const files = await response.json();
            const file = files.find(f => f.name === filename);
            
            if (!file) return;

            this.currentPreviewFile = file;
            const modal = document.getElementById('filePreviewModal');
            const previewTitle = document.getElementById('previewTitle');
            const previewContent = document.getElementById('previewContent');

            previewTitle.textContent = file.originalName;

            if (file.isImage) {
                previewContent.innerHTML = `
                    <img src="/uploads/${file.name}" alt="${file.originalName}" style="max-width: 100%; max-height: 60vh;" />
                `;
            } else if (file.isPDF) {
                previewContent.innerHTML = `
                    <iframe src="/uploads/${file.name}" style="width: 100%; height: 60vh;"></iframe>
                `;
            } else {
                previewContent.innerHTML = `
                    <div style="text-align: center; padding: 40px;">
                        <div style="font-size: 4rem; margin-bottom: 20px;">${this.getFileIcon(file)}</div>
                        <h3>${file.originalName}</h3>
                        <p>Size: ${this.formatFileSize(file.size)}</p>
                        <p>Type: ${file.mimeType}</p>
                        <br>
                        <p>Click download to save this file</p>
                    </div>
                `;
            }

            this.showModal('filePreviewModal');
        } catch (error) {
            console.error('Failed to preview file:', error);
            this.showNotification('Failed to preview file', 'error');
        }
    }

    downloadCurrentFile() {
        if (!this.currentPreviewFile) return;
        window.open(`/api/download/${this.currentPreviewFile.name}`, '_blank');
    }

    async deleteCurrentFile() {
        if (!this.currentPreviewFile) return;
        
        if (!confirm(`Are you sure you want to delete "${this.currentPreviewFile.originalName}"?`)) {
            return;
        }

        try {
            this.showLoading(true);
            const response = await fetch(`/api/delete/${this.currentPreviewFile.name}`, {
                method: 'DELETE'
            });

            if (!response.ok) throw new Error('Delete failed');

            this.showNotification('File deleted successfully');
            this.hideModal('filePreviewModal');
            this.currentPreviewFile = null;
            this.loadFiles();
        } catch (error) {
            console.error('Delete failed:', error);
            this.showNotification('Delete failed', 'error');
        } finally {
            this.showLoading(false);
        }
    }

    downloadAll() {
        window.open('/api/download-all', '_blank');
    }

    showServerInfo() {
        console.log('showServerInfo method called');
        console.log('Modal element exists:', !!document.getElementById('serverInfoModal'));
        this.loadServerInfo();
        this.showModal('serverInfoModal');
    }

    showModal(modalId) {
        console.log('showModal called with ID:', modalId);
        const modal = document.getElementById(modalId);
        console.log('Modal element found:', !!modal);
        if (modal) {
            console.log('Modal classes before:', modal.className);
            modal.classList.remove('hidden');
            console.log('Modal classes after:', modal.className);
        }
    }

    hideModal(modalId) {
        document.getElementById(modalId).classList.add('hidden');
        if (modalId === 'filePreviewModal') {
            this.currentPreviewFile = null;
        }
    }

    showLoading(show) {
        const overlay = document.getElementById('loadingOverlay');
        if (show) {
            overlay.classList.remove('hidden');
        } else {
            overlay.classList.add('hidden');
        }
    }

    showNotification(message, type = 'success') {
        // Create a simple notification
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'error' ? '#e74c3c' : '#27ae60'};
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            z-index: 1001;
            font-weight: 500;
            box-shadow: 0 5px 15px rgba(0,0,0,0.2);
            transform: translateX(100%);
            transition: transform 0.3s ease;
        `;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Auto remove
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.fileShareApp = new FileShareApp();
});

// Service Worker registration for PWA capabilities
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
                console.log('SW registered: ', registration);
                
                // Check for updates
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    console.log('New service worker found');
                    
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            console.log('New service worker installed, showing update notification');
                            // Optionally show update notification
                            if (window.fileShareApp) {
                                window.fileShareApp.showNotification('App updated! Refresh to use new version.');
                            }
                        }
                    });
                });
            })
            .catch((registrationError) => {
                console.error('SW registration failed: ', registrationError);
            });
            
        // Listen for service worker updates
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            console.log('Service worker controller changed');
            // Optionally reload the page
            // window.location.reload();
        });
    });
}