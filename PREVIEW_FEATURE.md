# File Preview Feature

## 🎉 New Feature: File Preview Panel

The Safe Explorer now includes a **fully functional file preview panel** that appears when you click on any file!

## Features

### 📋 File Information Display
When you click on a file, you'll see:
- **File Name** - Full name with extension
- **File Type** - Shows the file extension (e.g., TXT, JPG, PDF)
- **File Size** - Formatted (B, KB, MB, GB)
- **Full Path** - Complete file system path

### 👁️ Preview Content Types

#### 1. **Text Files**
Previews for:
- `.txt`, `.md`, `.log` - Plain text
- `.json`, `.xml` - Configuration files
- `.html`, `.css` - Web files
- `.js`, `.ts`, `.tsx`, `.jsx` - JavaScript/TypeScript
- `.py`, `.java`, `.cpp`, `.c`, `.h` - Source code

**Display**: Syntax-highlighted code block with scrolling

#### 2. **Image Files**
Previews for:
- `.jpg`, `.jpeg`, `.png`, `.gif`
- `.bmp`, `.webp`

**Display**: Full image preview, scaled to fit the panel

#### 3. **Unsupported Files**
For binary files, videos, archives, etc.:
- Shows message: "Preview not available for this file type"
- Still displays file information

## How to Use

### Step 1: Navigate the File Tree
- Browse folders by clicking on them
- Folders will expand to show contents

### Step 2: Click on a File
- Click on any file (not folder)
- An **eye icon** (👁️) indicates it's a file you can preview

### Step 3: View the Preview
- Preview panel appears on the right side
- Shows file info at the top
- Preview content below

### Step 4: Close Preview
- Click the **X** button in the preview panel header
- Or click on another file to switch previews

## UI Layout

```
┌─────────────────────────────────────────────────────┐
│  Safe Explorer                     🔒 Lock Safe     │
├──────────────────────────┬──────────────────────────┤
│                          │                          │
│  📁 File Tree            │  📄 File Preview        │
│  (2/3 width)             │  (1/3 width)            │
│                          │                          │
│  └─ Documents            │  FileName.txt           │
│     ├─ File1.txt         │  Type: TXT              │
│     ├─ File2.jpg    ←───────  Size: 1.2 KB          │
│     └─ Folder            │  Path: C:\...           │
│        └─ File3.md       │                          │
│                          │  ─────────────────       │
│                          │  Preview                 │
│                          │  ┌──────────────┐       │
│                          │  │ File content │       │
│                          │  │ shown here   │       │
│                          │  └──────────────┘       │
│                          │                          │
└──────────────────────────┴──────────────────────────┘
```

## Visual Indicators

### File Icons by Type
- 📷 **Purple** - Images
- 🎬 **Red** - Videos  
- 🎵 **Green** - Audio
- 📦 **Yellow** - Archives
- 💻 **Blue** - Code files
- 📄 **Gray** - Documents
- 📁 **Blue** - Folders

### Selection Highlight
- Selected file has **blue background**
- Makes it easy to see which file is being previewed

### Preview States
1. **Loading** - "Loading preview..." message
2. **Content** - Shows the actual preview
3. **Error** - Shows error message if preview fails
4. **Not Available** - Message for unsupported file types

## Technical Details

### File Reading
```typescript
// Text files
const content = await readTextFile(item.path);

// Binary files (images)
const bytes = await readFile(item.path);
const base64 = btoa(String.fromCharCode(...bytes));
```

### Permissions Required
Added to `capabilities/default.json`:
- `fs:allow-read-file` - Read binary files
- `fs:allow-read-text-file` - Read text files
- `fs:scope` - Access to specified directories

### Security
- Only reads files you explicitly click
- Respects filesystem permissions
- No automatic file access

## Example Usage

### Preview a Text File
1. Navigate to a folder with `.txt` files
2. Click on any `.txt` file
3. See the full text content in the preview panel
4. Scroll through long files

### Preview an Image
1. Navigate to a folder with images
2. Click on a `.jpg` or `.png` file
3. See the image rendered in the preview panel
4. Image scales to fit the panel width

### Preview Code
1. Click on a `.js`, `.py`, or other code file
2. See syntax-highlighted code
3. Scroll through the entire file
4. Copy code if needed

## Responsive Design

- **Desktop (Large Screen)**: 
  - File tree: 2/3 width
  - Preview: 1/3 width
  
- **No Selection**: 
  - File tree: Full width
  
- **Small Screens**: 
  - Stacks vertically (future enhancement)

## Future Enhancements

Possible additions:
- 🎬 Video player for video files
- 🎵 Audio player for audio files
- 📄 PDF viewer
- 🔍 Syntax highlighting for code
- ⬇️ Download button
- 🖼️ Image zoom/pan controls
- 📊 File metadata (creation date, modified date)
- 🔐 Decryption preview for encrypted files

## Try It Now!

1. Run: `npm run tauri dev`
2. Enter a directory path with various file types
3. Click on files to see previews!
4. Test with text files, images, and code files

Enjoy exploring your files! 🎉
