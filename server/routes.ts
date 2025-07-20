import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import multer from "multer";
import path from "path";
import fs from "fs";
import { insertFolderSchema, insertFileSchema, insertSharedFileSchema } from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import crypto from "crypto";

// Configure multer for file uploads
const uploadDir = "uploads";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
    },
  }),
  limits: {
    fileSize: 10 * 1024 * 1024 * 1024, // 10GB limit per file
    files: 1000, // Max 1000 files per upload
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Folder routes
  app.post('/api/folders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const folderData = { ...req.body, userId };
      const validatedData = insertFolderSchema.parse(folderData);
      const folder = await storage.createFolder(validatedData);
      res.json(folder);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).toString() });
      }
      console.error("Error creating folder:", error);
      res.status(500).json({ message: "Failed to create folder" });
    }
  });

  app.get('/api/folders', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const parentId = req.query.parentId ? parseInt(req.query.parentId as string) : undefined;
      const folders = await storage.getFoldersByUserId(userId, parentId);
      res.json(folders);
    } catch (error) {
      console.error("Error fetching folders:", error);
      res.status(500).json({ message: "Failed to fetch folders" });
    }
  });

  app.put('/api/folders/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const folder = await storage.updateFolder(id, req.body);
      if (!folder) {
        return res.status(404).json({ message: "Folder not found" });
      }
      res.json(folder);
    } catch (error) {
      console.error("Error updating folder:", error);
      res.status(500).json({ message: "Failed to update folder" });
    }
  });

  app.delete('/api/folders/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteFolder(id);
      res.json({ message: "Folder deleted successfully" });
    } catch (error) {
      console.error("Error deleting folder:", error);
      res.status(500).json({ message: "Failed to delete folder" });
    }
  });

  // File routes
  app.post('/api/files/upload', isAuthenticated, upload.array('files'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const folderId = req.body.folderId ? parseInt(req.body.folderId) : null;
      const files = req.files as Express.Multer.File[];
      
      if (!files || files.length === 0) {
        return res.status(400).json({ message: "No files uploaded" });
      }

      const uploadedFiles = [];
      for (const file of files) {
        const fileData = {
          name: file.filename,
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size.toString(), // Convert to string for large file support
          path: file.path,
          folderId,
          userId,
          storageType: "local",
        };
        
        const savedFile = await storage.createFile(fileData);
        uploadedFiles.push(savedFile);
      }

      res.json(uploadedFiles);
    } catch (error) {
      console.error("Error uploading files:", error);
      res.status(500).json({ message: "Failed to upload files" });
    }
  });

  app.get('/api/files', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const folderId = req.query.folderId ? parseInt(req.query.folderId as string) : undefined;
      console.log('Fetching files for user:', userId, 'folderId:', folderId);
      const files = await storage.getFilesByUserId(userId, folderId);
      console.log('Found files:', files.length);
      res.json(files);
    } catch (error) {
      console.error("Error fetching files:", error);
      res.status(500).json({ message: "Failed to fetch files" });
    }
  });

  app.get('/api/files/search', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const query = req.query.q as string;
      if (!query) {
        return res.status(400).json({ message: "Search query is required" });
      }
      const files = await storage.searchFiles(userId, query);
      res.json(files);
    } catch (error) {
      console.error("Error searching files:", error);
      res.status(500).json({ message: "Failed to search files" });
    }
  });

  app.get('/api/files/:id/download', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const file = await storage.getFileById(id);
      
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }

      if (!fs.existsSync(file.path)) {
        return res.status(404).json({ message: "File not found on disk" });
      }

      res.download(file.path, file.originalName);
    } catch (error) {
      console.error("Error downloading file:", error);
      res.status(500).json({ message: "Failed to download file" });
    }
  });

  app.put('/api/files/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const file = await storage.updateFile(id, req.body);
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }
      res.json(file);
    } catch (error) {
      console.error("Error updating file:", error);
      res.status(500).json({ message: "Failed to update file" });
    }
  });

  app.delete('/api/files/:id', isAuthenticated, async (req: any, res) => {
    try {
      const id = parseInt(req.params.id);
      const file = await storage.getFileById(id);
      
      if (!file) {
        return res.status(404).json({ message: "File not found" });
      }

      // Delete file from disk
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      await storage.deleteFile(id);
      res.json({ message: "File deleted successfully" });
    } catch (error) {
      console.error("Error deleting file:", error);
      res.status(500).json({ message: "Failed to delete file" });
    }
  });

  // Share routes
  app.post('/api/shares', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const shareToken = crypto.randomBytes(32).toString('hex');
      const shareData = {
        ...req.body,
        sharedByUserId: userId,
        shareToken,
      };
      
      const validatedData = insertSharedFileSchema.parse(shareData);
      const share = await storage.createShare(validatedData);
      res.json(share);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: fromZodError(error).toString() });
      }
      console.error("Error creating share:", error);
      res.status(500).json({ message: "Failed to create share" });
    }
  });

  app.get('/api/shares/token/:token', async (req, res) => {
    try {
      const token = req.params.token;
      const share = await storage.getShareByToken(token);
      
      if (!share) {
        return res.status(404).json({ message: "Share not found" });
      }

      if (share.expiresAt && new Date() > share.expiresAt) {
        return res.status(410).json({ message: "Share has expired" });
      }

      const file = await storage.getFileById(share.fileId);
      res.json({ share, file });
    } catch (error) {
      console.error("Error fetching share:", error);
      res.status(500).json({ message: "Failed to fetch share" });
    }
  });

  app.get('/api/shares', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const shares = await storage.getSharesByUserId(userId);
      res.json(shares);
    } catch (error) {
      console.error("Error fetching shares:", error);
      res.status(500).json({ message: "Failed to fetch shares" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
