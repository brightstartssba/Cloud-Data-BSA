import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { 
  Folder, 
  Clock, 
  Share, 
  Trash, 
  Database,
  CloudUpload 
} from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="w-64 glass border-r border-white/10 hidden lg:block h-screen sticky top-16">
      <div className="p-6 h-full overflow-y-auto">
        {/* Upload Button */}
        <Button className="w-full gradient-primary text-white py-3 px-6 rounded-2xl hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-medium flex items-center justify-center space-x-2">
          <CloudUpload className="w-4 h-4" />
          <span>Upload Files</span>
        </Button>

        {/* Navigation Menu */}
        <nav className="mt-8 space-y-2">
          {/* My Files */}
          <Button
            variant="ghost"
            className="w-full justify-start p-3 text-white/80 hover:bg-white/10 rounded-xl transition-colors group"
          >
            <div className="w-8 h-8 gradient-blue rounded-2xl flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
              <Folder className="w-4 h-4 text-white" />
            </div>
            <span className="font-medium">My Files</span>
          </Button>

          {/* Recent */}
          <Button
            variant="ghost"
            className="w-full justify-start p-3 text-white/80 hover:bg-white/10 rounded-xl transition-colors group"
          >
            <div className="w-8 h-8 gradient-secondary rounded-2xl flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
              <Clock className="w-4 h-4 text-white" />
            </div>
            <span className="font-medium">Recent</span>
          </Button>

          {/* Shared */}
          <Button
            variant="ghost"
            className="w-full justify-start p-3 text-white/80 hover:bg-white/10 rounded-xl transition-colors group"
          >
            <div className="w-8 h-8 gradient-orange rounded-2xl flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
              <Share className="w-4 h-4 text-white" />
            </div>
            <span className="font-medium">Shared</span>
          </Button>

          {/* Trash */}
          <Button
            variant="ghost"
            className="w-full justify-start p-3 text-white/80 hover:bg-white/10 rounded-xl transition-colors group"
          >
            <div className="w-8 h-8 gradient-pink rounded-2xl flex items-center justify-center mr-3 group-hover:scale-110 transition-transform">
              <Trash className="w-4 h-4 text-white" />
            </div>
            <span className="font-medium">Trash</span>
          </Button>
        </nav>

        {/* Storage Usage */}
        <Card className="mt-8 glass border-white/10">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center animate-float">
                <Database className="w-4 h-4 text-white" />
              </div>
              <span className="font-medium text-neutral-700">Storage</span>
            </div>
            <Progress value={60} className="mb-2" />
            <p className="text-sm text-neutral-600">4.2 GB of 15 GB used</p>
          </CardContent>
        </Card>
      </div>
    </aside>
  );
}
