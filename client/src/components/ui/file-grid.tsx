import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Folder, 
  FileText, 
  Image, 
  Video, 
  Music, 
  Archive,
  Share,
  Download,
  MoreHorizontal,
  Edit,
  Trash2
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import type { Folder as FolderType, File } from "@shared/schema";

interface FileGridProps {
  folders: FolderType[];
  files: File[];
  viewMode: "grid" | "list";
  isLoading: boolean;
  onFolderClick: (folderId: number) => void;
  onFileClick: (file: File) => void;
  onShareClick: (file: File) => void;
  onEditClick: (file: File) => void;
  onDeleteClick: (file: File) => void;
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) return Image;
  if (mimeType.startsWith('video/')) return Video;
  if (mimeType.startsWith('audio/')) return Music;
  if (mimeType.includes('zip') || mimeType.includes('rar')) return Archive;
  return FileText;
}

function getFileEmoji(mimeType: string) {
  if (mimeType.startsWith('image/')) return '🖼️';
  if (mimeType.startsWith('video/')) return '🎬';
  if (mimeType.startsWith('audio/')) return '🎵';
  if (mimeType.includes('pdf')) return '📄';
  if (mimeType.includes('word')) return '📝';
  if (mimeType.includes('excel')) return '📊';
  if (mimeType.includes('zip') || mimeType.includes('rar')) return '📦';
  return '📄';
}

function formatFileSize(bytes: number | string): string {
  const numBytes = typeof bytes === 'string' ? parseInt(bytes) : bytes;
  if (numBytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(numBytes) / Math.log(k));
  return parseFloat((numBytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export default function FileGrid({ 
  folders, 
  files, 
  viewMode, 
  isLoading, 
  onFolderClick, 
  onFileClick, 
  onShareClick,
  onEditClick,
  onDeleteClick 
}: FileGridProps) {
  if (isLoading) {
    return (
      <div className={viewMode === "grid" ? "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4" : "space-y-2"}>
        {Array.from({ length: 12 }).map((_, i) => (
          <Card key={i} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <Skeleton className="w-full h-20 mb-3 rounded-xl" />
              <Skeleton className="w-3/4 h-4 mb-2" />
              <Skeleton className="w-1/2 h-3" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (folders.length === 0 && files.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="w-24 h-24 gradient-primary rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
          <span className="text-4xl">📁</span>
        </div>
        <h3 className="text-xl font-semibold text-white mb-2">No files yet</h3>
        <p className="text-white/60">Upload some files or create folders to get started!</p>
      </div>
    );
  }

  if (viewMode === "list") {
    return (
      <div className="space-y-2">
        {/* Folders */}
        {folders.map((folder) => (
          <Card 
            key={`folder-${folder.id}`} 
            className="border-0 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
            onClick={() => onFolderClick(folder.id)}
          >
            <CardContent className="p-4 flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center">
                <Folder className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-neutral-800">{folder.name}</h4>
                <p className="text-sm text-neutral-500">Folder</p>
              </div>
              <Badge variant="secondary">Folder</Badge>
            </CardContent>
          </Card>
        ))}

        {/* Files */}
        {files.map((file) => {
          const FileIcon = getFileIcon(file.mimeType);
          return (
            <Card 
              key={`file-${file.id}`} 
              className="border-0 shadow-sm hover:shadow-md transition-all duration-200"
            >
              <CardContent className="p-4 flex items-center space-x-4">
                <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-teal-500 rounded-xl flex items-center justify-center">
                  <FileIcon className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1 cursor-pointer" onClick={() => onFileClick(file)}>
                  <h4 className="font-medium text-neutral-800 truncate">{file.originalName}</h4>
                  <p className="text-sm text-neutral-500">{formatFileSize(file.size)}</p>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onFileClick(file)}>
                      <FileText className="mr-2 h-4 w-4" />
                      Preview
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onEditClick(file)}>
                      <Edit className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onShareClick(file)}>
                      <Share className="mr-2 h-4 w-4" />
                      Share
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => window.open(`/api/files/${file.id}/download`)}>
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteClick(file);
                      }}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </CardContent>
            </Card>
          );
        })}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {/* Folders */}
      {folders.map((folder) => (
        <Card 
          key={`folder-${folder.id}`} 
          className="border-0 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group"
          onClick={() => onFolderClick(folder.id)}
        >
          <CardContent className="p-4">
            <div className="flex flex-col items-center space-y-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-purple-500 rounded-xl flex items-center justify-center group-hover:animate-pulse">
                <span className="text-2xl">📁</span>
              </div>
              <div className="text-center">
                <h4 className="font-medium text-neutral-800 text-sm truncate w-full">{folder.name}</h4>
                <p className="text-xs text-neutral-500">Folder</p>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Files */}
      {files.map((file) => (
        <Card 
          key={`file-${file.id}`} 
          className="border-0 shadow-sm hover:shadow-md transition-all duration-200 group"
        >
          <CardContent className="p-4">
            <div className="flex flex-col items-center space-y-3">
              <div 
                className="w-12 h-12 bg-gradient-to-br from-green-400 to-teal-500 rounded-xl flex items-center justify-center group-hover:animate-bounce cursor-pointer"
                onClick={() => onFileClick(file)}
              >
                <span className="text-xl">{getFileEmoji(file.mimeType)}</span>
              </div>
              <div className="text-center">
                <h4 
                  className="font-medium text-neutral-800 text-sm truncate w-full cursor-pointer hover:text-primary"
                  onClick={() => onFileClick(file)}
                >
                  {file.originalName}
                </h4>
                <p className="text-xs text-neutral-500">{formatFileSize(file.size)}</p>
              </div>
              <div className="flex space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onEditClick(file)}
                  className="h-8 w-8 p-0"
                  title="Edit"
                >
                  <Edit className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => onShareClick(file)}
                  className="h-8 w-8 p-0"
                  title="Share"
                >
                  <Share className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => window.open(`/api/files/${file.id}/download`)}
                  className="h-8 w-8 p-0"
                  title="Download"
                >
                  <Download className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteClick(file);
                  }}
                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                  title="Delete"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
