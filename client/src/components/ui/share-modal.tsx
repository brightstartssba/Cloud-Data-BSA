import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Copy, Share } from "lucide-react";
import type { File } from "@shared/schema";

interface ShareModalProps {
  file: File;
  onClose: () => void;
}

export default function ShareModal({ file, onClose }: ShareModalProps) {
  const [accessLevel, setAccessLevel] = useState("view");
  const [shareUrl, setShareUrl] = useState("");
  const { toast } = useToast();

  const shareMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/shares", {
        fileId: file.id,
        accessLevel,
      });
      return response.json();
    },
    onSuccess: (data) => {
      const url = `${window.location.origin}/share/${data.shareToken}`;
      setShareUrl(url);
      toast({
        title: "Success",
        description: "Share link generated successfully!",
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
        description: "Failed to generate share link",
        variant: "destructive",
      });
    },
  });

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: "Copied!",
      description: "Share link copied to clipboard",
    });
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center mx-auto mb-4 animate-float">
              <Share className="w-6 h-6 text-white" />
            </div>
            <DialogTitle className="text-xl font-semibold text-neutral-800 mb-2">
              Share File
            </DialogTitle>
            <p className="text-neutral-600">Generate a shareable link for this file</p>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {shareUrl ? (
            <div>
              <Label className="text-sm font-medium text-neutral-700 mb-2">Share Link</Label>
              <div className="flex items-center space-x-2">
                <Input
                  value={shareUrl}
                  readOnly
                  className="flex-1 px-4 py-2 border border-neutral-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                />
                <Button 
                  onClick={copyToClipboard}
                  className="px-4 py-2 bg-secondary text-white rounded-xl hover:bg-teal-600 transition-colors"
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <Label className="text-sm font-medium text-neutral-700 mb-2">Access Level</Label>
              <Select value={accessLevel} onValueChange={setAccessLevel}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="view">View Only</SelectItem>
                  <SelectItem value="edit">Can Edit</SelectItem>
                  <SelectItem value="comment">Can Comment</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            {shareUrl ? (
              <Button 
                onClick={onClose}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-primary to-pink-500 text-white rounded-xl hover:shadow-md transition-all"
              >
                Done
              </Button>
            ) : (
              <>
                <Button 
                  onClick={() => shareMutation.mutate()}
                  disabled={shareMutation.isPending}
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-primary to-pink-500 text-white rounded-xl hover:shadow-md transition-all"
                >
                  {shareMutation.isPending ? "Generating..." : "Generate Link"}
                </Button>
                <Button 
                  variant="ghost"
                  onClick={onClose}
                  className="px-4 py-2 text-neutral-600 hover:text-neutral-800 transition-colors"
                >
                  Cancel
                </Button>
              </>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
