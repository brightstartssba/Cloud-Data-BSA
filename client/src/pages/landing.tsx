import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-blue-50 to-purple-50">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="mb-12">
            <div className="w-24 h-24 bg-gradient-to-br from-orange-400 to-red-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-float">
              <span className="text-4xl">🦊</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-6">
              AnimalDrive
            </h1>
            <p className="text-xl text-neutral-600 mb-8 max-w-2xl mx-auto">
              The cutest way to store, organize, and share your files. Join our adorable animal friends in the cloud!
            </p>
            <Button 
              onClick={() => window.location.href = '/api/login'}
              className="bg-gradient-to-r from-primary to-pink-500 text-white px-8 py-4 text-lg rounded-2xl hover:shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              Get Started
            </Button>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-purple-50">
              <CardContent className="pt-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🐘</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Massive Storage</h3>
                <p className="text-neutral-600">Store all your files with our elephant-sized storage capacity. Never run out of space!</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-teal-50">
              <CardContent className="pt-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🐧</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Easy Sharing</h3>
                <p className="text-neutral-600">Share files as easily as penguins share fish. Simple links, powerful collaboration!</p>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-orange-50">
              <CardContent className="pt-8 text-center">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl">🦉</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Smart Organization</h3>
                <p className="text-neutral-600">Organize files with owl-like wisdom. Create folders and find anything instantly!</p>
              </CardContent>
            </Card>
          </div>

          {/* Call to Action */}
          <div className="bg-white/60 backdrop-blur-md rounded-3xl p-8 border border-neutral-200/50">
            <h2 className="text-3xl font-bold mb-4">Ready to join our animal kingdom?</h2>
            <p className="text-neutral-600 mb-6">Sign in to start your adorable file storage journey!</p>
            <Button 
              onClick={() => window.location.href = '/api/login'}
              className="bg-gradient-to-r from-secondary to-teal-500 text-white px-8 py-3 rounded-xl hover:shadow-md transition-all"
            >
              Sign In Now
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
