import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import Header from "@/components/ui/header";
import Sidebar from "@/components/ui/sidebar";
import FileUpload from "@/components/ui/file-upload";
import FileGrid from "@/components/ui/file-grid";
import FilePreviewModal from "@/components/ui/file-preview-modal";
import ShareModal from "@/components/ui/share-modal";
import FileEditorModal from "@/components/ui/file-editor-modal";
import FileCategoryStats from "@/components/ui/file-category-stats";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { Folder, File } from "@shared/schema";
import { Plus, Upload, Grid, List, Search } from "lucide-react";

export default function Home() {
  const { toast } = useToast();
  const { isAuthenticated, isLoading } = useAuth();
  const queryClient = useQueryClient();
  const [currentFolderId, setCurrentFolderId] = useState<number | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [shareFile, setShareFile] = useState<File | null>(null);
  const [editFile, setEditFile] = useState<File | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Redirect to home if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
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
  }, [isAuthenticated, isLoading, toast]);

  // Fetch folders
  const { data: folders = [], isLoading: foldersLoading } = useQuery({
    queryKey: ["/api/folders", currentFolderId ? { parentId: currentFolderId } : {}],
    enabled: isAuthenticated,
  });

  // Fetch files
  const { data: files = [], isLoading: filesLoading } = useQuery({
    queryKey: ["/api/files", currentFolderId ? { folderId: currentFolderId } : {}],
    enabled: isAuthenticated,
  });

  // Search files
  const { data: searchResults = [] } = useQuery({
    queryKey: ["/api/files/search", { q: searchQuery }],
    enabled: isAuthenticated && searchQuery.length > 0,
  });

  // Create folder mutation
  const createFolderMutation = useMutation({
    mutationFn: async (name: string) => {
      await apiRequest("POST", "/api/folders", {
        name,
        parentId: currentFolderId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/folders"] });
      toast({
        title: "Success",
        description: "Folder created successfully!",
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
        description: "Failed to create folder",
        variant: "destructive",
      });
    },
  });

  const handleCreateFolder = () => {
    const name = prompt("Enter folder name:");
    if (name?.trim()) {
      createFolderMutation.mutate(name.trim());
    }
  };

  const handleFileUploaded = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/files"] });
  };

  // Delete file mutation
  const deleteFileMutation = useMutation({
    mutationFn: async (fileId: number) => {
      return await apiRequest("DELETE", `/api/files/${fileId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/files"] });
      toast({
        title: "Success",
        description: "File deleted successfully!",
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
        description: "Failed to delete file",
        variant: "destructive",
      });
    },
  });

  const handleDeleteFile = (file: File) => {
    if (confirm(`Are you sure you want to delete "${file.originalName}"?`)) {
      deleteFileMutation.mutate(file.id);
    }
  };

  const handleFolderClick = (folderId: number) => {
    setCurrentFolderId(folderId);
  };

  const handleBackClick = () => {
    setCurrentFolderId(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
            <span className="text-2xl">🦊</span>
          </div>
          <p className="text-neutral-600">Loading...</p>
        </div>
      </div>
    );
  }

  const displayFiles = searchQuery ? searchResults : files;

  return (
    <div className="min-h-screen">
      <Header searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      
      <div className="flex min-h-screen pt-16">
        <Sidebar />
        
        <main className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* File Category Stats */}
            <FileCategoryStats files={displayFiles} />

            {/* My Files Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">My Files</h2>
              <div className="flex items-center space-x-3">
                <Button
                  onClick={handleCreateFolder}
                  className="gradient-primary text-white rounded-2xl hover:shadow-lg transition-all px-6 py-3"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Folder
                </Button>
                
                <div className="flex items-center space-x-2 bg-white/10 rounded-2xl p-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className={`rounded-xl ${viewMode === "grid" ? "bg-white/20 text-white" : "text-white/60 hover:text-white"}`}
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className={`rounded-xl ${viewMode === "list" ? "bg-white/20 text-white" : "text-white/60 hover:text-white"}`}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* File Upload Area */}
            <FileUpload 
              folderId={currentFolderId} 
              onFileUploaded={handleFileUploaded}
            />

            {/* File Grid */}
            <FileGrid
              folders={folders}
              files={displayFiles}
              viewMode={viewMode}
              isLoading={foldersLoading || filesLoading}
              onFolderClick={handleFolderClick}
              onFileClick={setSelectedFile}
              onShareClick={setShareFile}
              onEditClick={setEditFile}
              onDeleteClick={handleDeleteFile}
            />
          </div>
        </main>
      </div>

      {/* Modals */}
      {selectedFile && (
        <FilePreviewModal
          file={selectedFile}
          onClose={() => setSelectedFile(null)}
          onShare={() => {
            setShareFile(selectedFile);
            setSelectedFile(null);
          }}
          onEdit={() => {
            setEditFile(selectedFile);
            setSelectedFile(null);
          }}
          onDelete={() => {
            if (selectedFile) {
              handleDeleteFile(selectedFile);
              setSelectedFile(null);
            }
          }}
        />
      )}

      {shareFile && (
        <ShareModal
          file={shareFile}
          onClose={() => setShareFile(null)}
        />
      )}

      {editFile && (
        <FileEditorModal
          file={editFile}
          onClose={() => setEditFile(null)}
        />
      )}
    </div>
  );
}
