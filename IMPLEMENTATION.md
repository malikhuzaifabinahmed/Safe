# Safe Application - Implementation Documentation

## Overview
This application provides a secure file explorer interface using Tauri and React with shadcn/ui components.

## Features Implemented

### 1. Safe Path Input Screen (`SafePathInput.tsx`)
- **Path Entry**: Users enter the path to their safe directory
- **Path Validation**: Checks if the path exists using Tauri's filesystem plugin
- **Password Screen**: After successful path validation, prompts for password
- **Beautiful UI**: Uses shadcn/ui Card, Input, Button, and Label components
- **Icons**: Utilizes lucide-react icons (FolderOpen, Lock)
- **Error Handling**: Displays error messages for invalid paths or authentication failures

### 2. File Explorer View (`FileExplorer.tsx`)
- **Tree Structure**: Displays files and folders in an expandable tree view
- **Nested Directories**: Supports infinite nesting of directories
- **Icons**: Different icons for files, folders, and expanded folders
- **Sorting**: Directories appear first, followed by files (alphabetically)
- **Navigation**: 
  - "Home" button to return to root safe directory
  - "Parent" button to navigate up one level
  - Click on folders to expand/collapse them
- **Current Path Display**: Shows the current directory path
- **Lock Safe**: Button to logout and return to the path input screen

### 3. Main App Flow (`App.tsx`)
```
Start → Path Input → Password Entry → File Explorer
                                              ↓
                                        (Lock Safe)
                                              ↓
                                        Path Input
```

## Components Structure

```
src/
├── App.tsx                      # Main app with authentication state
├── components/
│   ├── SafePathInput.tsx       # Path and password input screens
│   └── FileExplorer.tsx        # File/folder explorer with tree view
└── components/ui/              # shadcn/ui components
    ├── button.tsx
    ├── card.tsx
    ├── input.tsx
    └── label.tsx
```

## Technologies Used

- **Tauri**: Desktop application framework
- **React**: UI library
- **TypeScript**: Type-safe development
- **shadcn/ui**: Beautiful, accessible UI components
- **Tailwind CSS**: Utility-first CSS framework
- **lucide-react**: Icon library
- **@tauri-apps/plugin-fs**: Filesystem access plugin

## Permissions

The application requires the following Tauri permissions:
- `fs:default`: Default filesystem permissions
- `fs:allow-read-dir`: Read directory contents
- `fs:allow-exists`: Check if paths exist

## How to Use

1. **Start the Application**
   ```bash
   npm run tauri dev
   ```

2. **Enter Safe Path**
   - Enter the full path to your safe directory (e.g., `C:\Users\YourName\Documents\MySafe`)
   - Click "Continue"

3. **Enter Password**
   - After path validation, enter your password
   - Click "Unlock Safe"

4. **Browse Files**
   - Click on folders to expand/collapse them
   - View nested directory structures
   - Use navigation buttons (Home, Parent) to navigate
   - Click "Lock Safe" to logout

## Future Enhancements

To make this a fully functional safe application, consider adding:

1. **Encryption Backend**
   - Actual password verification against stored hash
   - File encryption/decryption on the Rust side
   - Secure key derivation from password

2. **File Operations**
   - Add files to safe
   - Remove files from safe
   - Open/view encrypted files
   - Create new directories

3. **File Preview**
   - Image preview
   - Document preview
   - File type icons

4. **Search Functionality**
   - Search files by name
   - Filter by file type
   - Recent files list

5. **Security Features**
   - Auto-lock after inactivity
   - Failed attempt tracking
   - Secure password storage
   - Two-factor authentication

## Notes

- Currently, password validation is simulated (accepts any non-empty password)
- Path validation uses Tauri's `exists()` function to check if the directory exists
- The app reads actual filesystem directories (no encryption currently)
- File paths use Windows-style backslashes (`\`)
