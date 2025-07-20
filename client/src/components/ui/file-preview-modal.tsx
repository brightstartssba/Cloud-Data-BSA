import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Share, Edit, Trash2, X, Eye } from "lucide-react";
import type { File } from "@shared/schema";

interface FilePreviewModalProps {
  file: File;
  onClose: () => void;
  onShare: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

function formatFileSize(bytes: number | string): string {
  const numBytes = typeof bytes === 'string' ? parseInt(bytes) : bytes;
  if (numBytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(numBytes) / Math.log(k));
  return parseFloat((numBytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString();
}

export default function FilePreviewModal({ file, onClose, onShare, onEdit, onDelete }: FilePreviewModalProps) {
  const isImage = file.mimeType.startsWith('image/');
  const isVideo = file.mimeType.startsWith('video/');
  const isAudio = file.mimeType.startsWith('audio/');
  const isPdf = file.mimeType.includes('pdf');

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-red-500 rounded-xl flex items-center justify-center">
                <Eye className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold text-neutral-800">
                  {file.originalName}
                </DialogTitle>
                <p className="text-sm text-neutral-500">
                  {formatFileSize(file.size)} • Modified {formatDate(file.updatedAt || file.createdAt!)}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto">
          {/* File Preview Area */}
          <div className="bg-neutral-50 rounded-2xl p-8 mb-6 text-center">
            {isImage && (
              <img
                src={`/api/files/${file.id}/download`}
                alt={file.originalName}
                className="max-w-full h-auto rounded-xl shadow-lg mx-auto"
                style={{ maxHeight: '400px' }}
              />
            )}
            
            {isVideo && (
              <video
                controls
                className="max-w-full h-auto rounded-xl shadow-lg mx-auto"
                style={{ maxHeight: '400px' }}
              >
                <source src={`/api/files/${file.id}/download`} type={file.mimeType} />
                Your browser does not support the video tag.
              </video>
            )}

            {isAudio && (
              <div className="flex flex-col items-center space-y-4">
                <div className="w-32 h-32 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-4xl">🎵</span>
                </div>
                <audio controls className="w-full max-w-md">
                  <source src={`/api/files/${file.id}/download`} type={file.mimeType} />
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}

            {isPdf && (
              <div className="flex flex-col items-center space-y-4">
                <div className="w-32 h-32 bg-gradient-to-br from-red-400 to-pink-500 rounded-2xl flex items-center justify-center">
                  <span className="text-6xl">📄</span>
                </div>
                <p className="text-neutral-600">PDF files can be downloaded for viewing</p>
              </div>
            )}

            {!isImage && !isVideo && !isAudio && !isPdf && (
              <div className="flex flex-col items-center space-y-4">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center">
                  <span className="text-6xl">📄</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-neutral-800 mb-2">{file.originalName}</h3>
                  <Badge variant="secondary">{file.mimeType}</Badge>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 justify-center">
            <Button 
              onClick={() => window.open(`/api/files/${file.id}/download`)}
              className="flex items-center space-x-2 bg-gradient-to-r from-primary to-pink-500 text-white rounded-xl hover:shadow-lg transition-all"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </Button>
            
            <Button 
              onClick={onShare}
              className="flex items-center space-x-2 bg-gradient-to-r from-secondary to-teal-500 text-white rounded-xl hover:shadow-lg transition-all"
            >
              <Share className="w-4 h-4" />
              <span>Share</span>
            </Button>
            
            <Button 
              onClick={onEdit}
              variant="outline"
              className="flex items-center space-x-2 rounded-xl hover:bg-neutral-50 transition-all"
            >
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </Button>
            
            <Button 
              onClick={onDelete}
              variant="outline"
              className="flex items-center space-x-2 rounded-xl hover:bg-red-50 text-red-600 hover:text-red-700 border-red-200 transition-all"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete</span>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
