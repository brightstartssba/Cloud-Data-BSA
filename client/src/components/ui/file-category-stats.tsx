import { useState } from "react";
import { Card } from "@/components/ui/card";
import { FileText, Image, Video, Music } from "lucide-react";
import type { File } from "@shared/schema";

interface FileCategoryStatsProps {
  files: File[];
}

export default function FileCategoryStats({ files }: FileCategoryStatsProps) {
  const stats = {
    videos: files.filter(f => f.mimeType.startsWith('video/')).length,
    photos: files.filter(f => f.mimeType.startsWith('image/')).length,
    music: files.filter(f => f.mimeType.startsWith('audio/')).length,
    docs: files.filter(f => 
      f.mimeType.includes('document') || 
      f.mimeType.includes('pdf') || 
      f.mimeType.includes('text')
    ).length,
  };

  return (
    <div className="grid grid-cols-2 gap-4 mb-6">
      {/* Videos */}
      <Card className="glass border-white/10 p-4 group hover:scale-105 transition-all cursor-pointer">
        <div className="flex items-center space-x-3">
          <div className="file-video w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg">
            <Video className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-white/80 text-sm">Videos</p>
            <p className="text-2xl font-bold text-white">{stats.videos}</p>
          </div>
        </div>
      </Card>

      {/* Photos */}
      <Card className="glass border-white/10 p-4 group hover:scale-105 transition-all cursor-pointer">
        <div className="flex items-center space-x-3">
          <div className="file-photo w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg">
            <Image className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-white/80 text-sm">Photos</p>
            <p className="text-2xl font-bold text-white">{stats.photos}</p>
          </div>
        </div>
      </Card>

      {/* Music */}
      <Card className="glass border-white/10 p-4 group hover:scale-105 transition-all cursor-pointer">
        <div className="flex items-center space-x-3">
          <div className="file-music w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg">
            <Music className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-white/80 text-sm">Music</p>
            <p className="text-2xl font-bold text-white">{stats.music}</p>
          </div>
        </div>
      </Card>

      {/* Documents */}
      <Card className="glass border-white/10 p-4 group hover:scale-105 transition-all cursor-pointer">
        <div className="flex items-center space-x-3">
          <div className="file-docs w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <p className="text-white/80 text-sm">Docs</p>
            <p className="text-2xl font-bold text-white">{stats.docs}</p>
          </div>
        </div>
      </Card>
    </div>
  );
}