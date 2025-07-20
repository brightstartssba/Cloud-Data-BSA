import {
  users,
  folders,
  files,
  sharedFiles,
  type User,
  type UpsertUser,
  type InsertFolder,
  type Folder,
  type InsertFile,
  type File,
  type InsertSharedFile,
  type SharedFile,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, isNull, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Folder operations
  createFolder(folder: InsertFolder): Promise<Folder>;
  getFoldersByUserId(userId: string, parentId?: number): Promise<Folder[]>;
  getFolderById(id: number): Promise<Folder | undefined>;
  updateFolder(id: number, data: Partial<InsertFolder>): Promise<Folder | undefined>;
  deleteFolder(id: number): Promise<void>;
  
  // File operations
  createFile(file: InsertFile): Promise<File>;
  getFilesByUserId(userId: string, folderId?: number): Promise<File[]>;
  getFileById(id: number): Promise<File | undefined>;
  updateFile(id: number, data: Partial<InsertFile>): Promise<File | undefined>;
  deleteFile(id: number): Promise<void>;
  searchFiles(userId: string, query: string): Promise<File[]>;
  
  // Share operations
  createShare(share: InsertSharedFile): Promise<SharedFile>;
  getShareByToken(token: string): Promise<SharedFile | undefined>;
  getSharesByUserId(userId: string): Promise<(SharedFile & { file: File })[]>;
  updateShare(id: number, data: Partial<InsertSharedFile>): Promise<SharedFile | undefined>;
  deleteShare(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  // User operations (mandatory for Replit Auth)
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Folder operations
  async createFolder(folder: InsertFolder): Promise<Folder> {
    const [newFolder] = await db.insert(folders).values(folder).returning();
    return newFolder;
  }

  async getFoldersByUserId(userId: string, parentId?: number): Promise<Folder[]> {
    return await db
      .select()
      .from(folders)
      .where(
        and(
          eq(folders.userId, userId),
          parentId !== undefined ? eq(folders.parentId, parentId) : isNull(folders.parentId)
        )
      )
      .orderBy(asc(folders.name));
  }

  async getFolderById(id: number): Promise<Folder | undefined> {
    const [folder] = await db.select().from(folders).where(eq(folders.id, id));
    return folder;
  }

  async updateFolder(id: number, data: Partial<InsertFolder>): Promise<Folder | undefined> {
    const [folder] = await db
      .update(folders)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(folders.id, id))
      .returning();
    return folder;
  }

  async deleteFolder(id: number): Promise<void> {
    await db.delete(folders).where(eq(folders.id, id));
  }

  // File operations
  async createFile(file: InsertFile): Promise<File> {
    const [newFile] = await db.insert(files).values(file).returning();
    return newFile;
  }

  async getFilesByUserId(userId: string, folderId?: number): Promise<File[]> {
    return await db
      .select()
      .from(files)
      .where(
        and(
          eq(files.userId, userId),
          folderId !== undefined ? eq(files.folderId, folderId) : isNull(files.folderId)
        )
      )
      .orderBy(desc(files.createdAt));
  }

  async getFileById(id: number): Promise<File | undefined> {
    const [file] = await db.select().from(files).where(eq(files.id, id));
    return file;
  }

  async updateFile(id: number, data: Partial<InsertFile>): Promise<File | undefined> {
    const [file] = await db
      .update(files)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(files.id, id))
      .returning();
    return file;
  }

  async deleteFile(id: number): Promise<void> {
    await db.delete(files).where(eq(files.id, id));
  }

  async searchFiles(userId: string, query: string): Promise<File[]> {
    return await db
      .select()
      .from(files)
      .where(
        and(
          eq(files.userId, userId),
          // Simple name search - in production you'd use full-text search
          sql`${files.originalName} ILIKE ${`%${query}%`}`
        )
      )
      .orderBy(desc(files.createdAt));
  }

  // Share operations
  async createShare(share: InsertSharedFile): Promise<SharedFile> {
    const [newShare] = await db.insert(sharedFiles).values(share).returning();
    return newShare;
  }

  async getShareByToken(token: string): Promise<SharedFile | undefined> {
    const [share] = await db
      .select()
      .from(sharedFiles)
      .where(and(eq(sharedFiles.shareToken, token), eq(sharedFiles.isActive, true)));
    return share;
  }

  async getSharesByUserId(userId: string): Promise<(SharedFile & { file: File })[]> {
    return await db
      .select({
        id: sharedFiles.id,
        fileId: sharedFiles.fileId,
        sharedByUserId: sharedFiles.sharedByUserId,
        shareToken: sharedFiles.shareToken,
        accessLevel: sharedFiles.accessLevel,
        expiresAt: sharedFiles.expiresAt,
        isActive: sharedFiles.isActive,
        createdAt: sharedFiles.createdAt,
        file: files,
      })
      .from(sharedFiles)
      .innerJoin(files, eq(sharedFiles.fileId, files.id))
      .where(eq(sharedFiles.sharedByUserId, userId))
      .orderBy(desc(sharedFiles.createdAt));
  }

  async updateShare(id: number, data: Partial<InsertSharedFile>): Promise<SharedFile | undefined> {
    const [share] = await db
      .update(sharedFiles)
      .set(data)
      .where(eq(sharedFiles.id, id))
      .returning();
    return share;
  }

  async deleteShare(id: number): Promise<void> {
    await db.delete(sharedFiles).where(eq(sharedFiles.id, id));
  }
}

export const storage = new DatabaseStorage();
