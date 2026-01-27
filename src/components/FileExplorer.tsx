import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  File,
  Folder,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  Home,
  Lock,
  ArrowLeft,
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  FileArchive,
  FileCode,
  X,
  Eye,
} from 'lucide-react';

interface FileItem {
  name: string;
  path: string;
  isDirectory: boolean;
  children?: FileItem[];
  isExpanded?: boolean;
  size?: number;
}

interface FileExplorerProps {
  safePath: string;
  onLogout: () => void;
}

export function FileExplorer({ safePath, onLogout }: FileExplorerProps) {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [currentPath, setCurrentPath] = useState(safePath);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [previewContent, setPreviewContent] = useState<string>('');
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);

  useEffect(() => {
    loadDirectory(safePath);
  }, [safePath]);

  const getFileIcon = (fileName: string) => {
    const ext = fileName.toLowerCase().split('.').pop() || '';
    
    // Image files
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp', 'ico'].includes(ext)) {
      return <FileImage className="w-5 h-5 text-purple-500" />;
    }
    // Video files
    if (['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm'].includes(ext)) {
      return <FileVideo className="w-5 h-5 text-red-500" />;
    }
    // Audio files
    if (['mp3', 'wav', 'flac', 'aac', 'ogg', 'wma', 'm4a'].includes(ext)) {
      return <FileAudio className="w-5 h-5 text-green-500" />;
    }
    // Archive files
    if (['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz'].includes(ext)) {
      return <FileArchive className="w-5 h-5 text-yellow-600" />;
    }
    // Code files
    if (['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp', 'c', 'h', 'cs', 'go', 'rs', 'php', 'rb', 'swift', 'kt'].includes(ext)) {
      return <FileCode className="w-5 h-5 text-blue-600" />;
    }
    // Text/Document files
    if (['txt', 'md', 'doc', 'docx', 'pdf', 'rtf', 'odt'].includes(ext)) {
      return <FileText className="w-5 h-5 text-gray-600" />;
    }
    
    // Default file icon
    return <File className="w-5 h-5 text-gray-500" />;
  };

  const handleFileClick = async (item: FileItem) => {
    if (item.isDirectory) return;
    
    setSelectedFile(item);
    setIsLoadingPreview(true);
    setPreviewContent('');
    
    try {
      const ext = item.name.toLowerCase().split('.').pop() || '';
      const { readTextFile, readFile } = await import('@tauri-apps/plugin-fs');
      
      // Text files
      if (['txt', 'md', 'json', 'xml', 'html', 'css', 'js', 'ts', 'tsx', 'jsx', 'py', 'java', 'cpp', 'c', 'h', 'log'].includes(ext)) {
        const content = await readTextFile(item.path);
        setPreviewContent(content);
      }
      // Images - convert to base64
      else if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp'].includes(ext)) {
        const bytes = await readFile(item.path);
        const base64 = btoa(String.fromCharCode(...bytes));
        setPreviewContent(`data:image/${ext};base64,${base64}`);
      }
      else {
        setPreviewContent('Preview not available for this file type');
      }
    } catch (err) {
      console.error('Failed to load preview:', err);
      setPreviewContent('Failed to load preview: ' + (err as Error).message);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  const closePreview = () => {
    setSelectedFile(null);
    setPreviewContent('');
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB';
  };

  const loadDirectory = async (path: string) => {
    setIsLoading(true);
    setError('');

    try {
      console.log('Loading directory:', path);
      // Import Tauri file system plugin
      const { readDir } = await import('@tauri-apps/plugin-fs');
      
      const entries = await readDir(path);
      console.log('Found entries:', entries.length);
      
      const fileItems: FileItem[] = entries.map((entry: any) => ({
        name: entry.name || '',
        path: path + '\\' + entry.name,
        isDirectory: entry.isDirectory || false,
        isExpanded: false,
      }));

      console.log('Processed file items:', fileItems);

      // Sort: directories first, then files, alphabetically
      fileItems.sort((a, b) => {
        if (a.isDirectory && !b.isDirectory) return -1;
        if (!a.isDirectory && b.isDirectory) return 1;
        return a.name.localeCompare(b.name);
      });

      setFiles(fileItems);
      setCurrentPath(path);
    } catch (err) {
      console.error('Directory load error:', err);
      setError('Failed to load directory: ' + (err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleDirectory = async (item: FileItem, index: number) => {
    if (!item.isDirectory) return;

    const newFiles = [...files];
    
    if (item.isExpanded) {
      // Collapse
      console.log('Collapsing:', item.name);
      newFiles[index].isExpanded = false;
      newFiles[index].children = undefined;
    } else {
      // Expand
      console.log('Expanding:', item.name, 'at path:', item.path);
      try {
        const { readDir } = await import('@tauri-apps/plugin-fs');
        const entries = await readDir(item.path);
        console.log('Found', entries.length, 'items in', item.name);
        
        const children: FileItem[] = entries.map((entry: any) => ({
          name: entry.name || '',
          path: item.path + '\\' + entry.name,
          isDirectory: entry.isDirectory || false,
          isExpanded: false,
        }));

        // Sort children
        children.sort((a, b) => {
          if (a.isDirectory && !b.isDirectory) return -1;
          if (!a.isDirectory && b.isDirectory) return 1;
          return a.name.localeCompare(b.name);
        });

        newFiles[index].isExpanded = true;
        newFiles[index].children = children;
      } catch (err) {
        console.error('Failed to load subdirectory:', item.path, err);
        setError('Failed to access: ' + item.name);
      }
    }

    setFiles(newFiles);
  };

  const renderFileTree = (items: FileItem[], level: number = 0) => {
    return items.map((item, index) => (
      <div key={item.path}>
        <div
          className={`flex items-center gap-2 px-3 py-2 hover:bg-accent hover:text-accent-foreground rounded-md cursor-pointer transition-colors ${
            level > 0 ? 'ml-' + (level * 4) : ''
          } ${selectedFile?.path === item.path ? 'bg-blue-100 dark:bg-blue-900' : ''}`}
          style={{ paddingLeft: `${level * 1.5 + 0.75}rem` }}
          onClick={() => item.isDirectory ? toggleDirectory(item, index) : handleFileClick(item)}
        >
          {item.isDirectory && (
            <span className="flex-shrink-0">
              {item.isExpanded ? (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              )}
            </span>
          )}
          {!item.isDirectory && (
            <span className="flex-shrink-0">
              <Eye className="w-4 h-4 text-muted-foreground" />
            </span>
          )}
          
          <span className="flex-shrink-0">
            {item.isDirectory ? (
              item.isExpanded ? (
                <FolderOpen className="w-5 h-5 text-blue-500" />
              ) : (
                <Folder className="w-5 h-5 text-blue-500" />
              )
            ) : (
              getFileIcon(item.name)
            )}
          </span>
          
          <span className="text-sm truncate flex-1">{item.name}</span>
        </div>
        
        {item.isExpanded && item.children && (
          <div>{renderFileTree(item.children, level + 1)}</div>
        )}
      </div>
    ));
  };

  const goToParent = () => {
    const parentPath = currentPath.substring(0, currentPath.lastIndexOf('\\'));
    if (parentPath && parentPath.length >= safePath.length) {
      loadDirectory(parentPath);
    }
  };

  const goToRoot = () => {
    loadDirectory(safePath);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <Lock className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Safe Explorer</h1>
              <p className="text-sm text-muted-foreground font-mono">
                {currentPath}
              </p>
            </div>
          </div>
          <Button onClick={onLogout} variant="outline">
            <Lock className="w-4 h-4 mr-2" />
            Lock Safe
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* File Explorer */}
          <Card className={selectedFile ? 'lg:col-span-2' : 'lg:col-span-3'}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Files & Folders</CardTitle>
                <div className="flex gap-2">
                  <Button
                    onClick={goToRoot}
                    variant="ghost"
                    size="sm"
                    disabled={currentPath === safePath}
                  >
                    <Home className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={goToParent}
                    variant="ghost"
                    size="sm"
                    disabled={currentPath === safePath}
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    Parent
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-12 text-muted-foreground">
                  Loading...
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <div className="text-red-500 bg-red-50 dark:bg-red-900/20 p-4 rounded-md">
                    {error}
                  </div>
                </div>
              ) : files.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  This directory is empty
                </div>
              ) : (
                <div className="space-y-1 max-h-[600px] overflow-y-auto">
                  {renderFileTree(files)}
                </div>
              )}
            </CardContent>
          </Card>

          {/* File Preview Panel */}
          {selectedFile && (
            <Card className="lg:col-span-1">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg truncate">{selectedFile.name}</CardTitle>
                  <Button onClick={closePreview} variant="ghost" size="sm">
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* File Info */}
                  <div className="text-sm space-y-2">
                    <div>
                      <span className="font-semibold">Type:</span>{' '}
                      {selectedFile.name.split('.').pop()?.toUpperCase() || 'Unknown'}
                    </div>
                    <div>
                      <span className="font-semibold">Size:</span>{' '}
                      {formatFileSize(selectedFile.size)}
                    </div>
                    <div className="break-all">
                      <span className="font-semibold">Path:</span>{' '}
                      <span className="text-xs font-mono">{selectedFile.path}</span>
                    </div>
                  </div>

                  {/* Preview Content */}
                  <div className="border-t pt-4">
                    <h3 className="font-semibold mb-2">Preview</h3>
                    {isLoadingPreview ? (
                      <div className="text-center py-8 text-muted-foreground">
                        Loading preview...
                      </div>
                    ) : previewContent.startsWith('data:image') ? (
                      <img 
                        src={previewContent} 
                        alt={selectedFile.name}
                        className="w-full rounded-lg"
                      />
                    ) : previewContent.startsWith('Preview not available') || previewContent.startsWith('Failed') ? (
                      <div className="text-sm text-muted-foreground py-4">
                        {previewContent}
                      </div>
                    ) : (
                      <pre className="text-xs bg-slate-100 dark:bg-slate-800 p-3 rounded-lg overflow-x-auto max-h-96 overflow-y-auto">
                        {previewContent}
                      </pre>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
