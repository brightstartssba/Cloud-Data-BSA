import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Save, X, Edit, FileText, Image as ImageIcon, Video, Music } from "lucide-react";
import type { File } from "@shared/schema";

interface FileEditorModalProps {
  file: File;
  onClose: () => void;
}

export default function FileEditorModal({ file, onClose }: FileEditorModalProps) {
  const [fileName, setFileName] = useState(file.originalName);
  const [fileContent, setFileContent] = useState("");
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const isTextFile = file.mimeType.startsWith('text/') || 
                    file.mimeType.includes('json') || 
                    file.mimeType.includes('xml') ||
                    file.mimeType.includes('javascript') ||
                    file.mimeType.includes('css') ||
                    file.mimeType.includes('html');

  const isImage = file.mimeType.startsWith('image/');
  const isVideo = file.mimeType.startsWith('video/');
  const isAudio = file.mimeType.startsWith('audio/');

  // Load file content for text files
  useEffect(() => {
    if (isTextFile) {
      setIsLoadingContent(true);
      fetch(`/api/files/${file.id}/download`, {
        credentials: 'include',
      })
        .then(response => response.text())
        .then(content => {
          setFileContent(content);
        })
        .catch(error => {
          console.error('Error loading file content:', error);
          toast({
            title: "Error",
            description: "Could not load file content for editing",
            variant: "destructive",
          });
        })
        .finally(() => {
          setIsLoadingContent(false);
        });
    }
  }, [file.id, isTextFile, toast]);

  // Update file name mutation
  const updateFileNameMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("PUT", `/api/files/${file.id}`, {
        originalName: fileName,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/files"] });
      toast({
        title: "Success",
        description: "File name updated successfully!",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update file name",
        variant: "destructive",
      });
    },
  });

  // Save content mutation (for text files)
  const saveContentMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      const blob = new Blob([fileContent], { type: file.mimeType });
      formData.append('files', blob, fileName);
      if (file.folderId) {
        formData.append('folderId', file.folderId.toString());
      }

      // First delete the old file
      await apiRequest("DELETE", `/api/files/${file.id}`);
      
      // Then upload the new content
      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`${response.status}: ${error}`);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/files"] });
      toast({
        title: "Success",
        description: "File content saved successfully!",
      });
      onClose();
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to save file content",
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    if (fileName !== file.originalName) {
      updateFileNameMutation.mutate();
    }
    
    if (isTextFile && fileContent !== "") {
      saveContentMutation.mutate();
    } else if (!isTextFile) {
      onClose();
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center">
                <Edit className="w-5 h-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold text-neutral-800">
                  Edit File
                </DialogTitle>
                <p className="text-sm text-neutral-500">
                  Make changes to your file
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-auto space-y-6">
          {/* File Name Editor */}
          <div>
            <Label className="text-sm font-medium text-neutral-700 mb-2">File Name</Label>
            <Input
              value={fileName}
              onChange={(e) => setFileName(e.target.value)}
              className="w-full px-4 py-2 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Enter file name"
            />
          </div>

          {/* Content Editor for Text Files */}
          {isTextFile && (
            <div>
              <Label className="text-sm font-medium text-neutral-700 mb-2">File Content</Label>
              {isLoadingContent ? (
                <div className="flex items-center justify-center h-64 bg-neutral-50 rounded-xl">
                  <div className="text-center">
                    <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-2 animate-spin">
                      <FileText className="w-4 h-4 text-white" />
                    </div>
                    <p className="text-neutral-600">Loading file content...</p>
                  </div>
                </div>
              ) : (
                <Textarea
                  value={fileContent}
                  onChange={(e) => setFileContent(e.target.value)}
                  className="w-full h-64 px-4 py-3 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent font-mono text-sm"
                  placeholder="File content will appear here..."
                />
              )}
            </div>
          )}

          {/* Preview for Non-Text Files */}
          {!isTextFile && (
            <div className="bg-neutral-50 rounded-2xl p-8 text-center">
              {isImage && (
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center">
                    <ImageIcon className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-neutral-600">Image files can only have their name changed</p>
                </div>
              )}
              
              {isVideo && (
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-red-400 to-pink-500 rounded-xl flex items-center justify-center">
                    <Video className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-neutral-600">Video files can only have their name changed</p>
                </div>
              )}

              {isAudio && (
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center">
                    <Music className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-neutral-600">Audio files can only have their name changed</p>
                </div>
              )}

              {!isImage && !isVideo && !isAudio && (
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-neutral-400 to-neutral-600 rounded-xl flex items-center justify-center">
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-neutral-600">This file type can only have its name changed</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-3 pt-4">
          <Button 
            onClick={handleSave}
            disabled={updateFileNameMutation.isPending || saveContentMutation.isPending}
            className="flex items-center space-x-2 bg-gradient-to-r from-primary to-pink-500 text-white rounded-xl hover:shadow-lg transition-all"
          >
            <Save className="w-4 h-4" />
            <span>
              {updateFileNameMutation.isPending || saveContentMutation.isPending 
                ? "Saving..." 
                : "Save Changes"
              }
            </span>
          </Button>
          
          <Button 
            variant="ghost"
            onClick={onClose}
            className="px-4 py-2 text-neutral-600 hover:text-neutral-800 transition-colors"
          >
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}