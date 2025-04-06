import express, { type Express, type Request, type Response, type NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage as dbStorage } from "./storage";
import { insertTicketSchema, insertTagSchema, insertAttachmentSchema, insertUserActivitySchema, fileUploadSchema } from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { setupAuth } from "./auth";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";

// Rate limiting middleware for API endpoints
const createRateLimiter = (windowMs: number, maxRequests: number) => {
  const requests = new Map<string, number[]>();
  
  return (req: Request, res: Response, next: NextFunction) => {
    const ip = req.ip || 'unknown';
    const now = Date.now();
    
    // Get existing requests for this IP or create a new array
    const requestTimes = requests.get(ip) || [];
    
    // Filter requests within the time window
    const recentRequests = requestTimes.filter(time => time > now - windowMs);
    
    // Handle rate limiting
    if (recentRequests.length >= maxRequests) {
      return res.status(429).json({ 
        message: "Too many requests, please try again later." 
      });
    }
    
    // Update the request log
    recentRequests.push(now);
    requests.set(ip, recentRequests);
    
    // Clean up old entries periodically
    if (Math.random() < 0.01) { // 1% chance to clean up on each request
      requests.forEach((times, ip) => {
        const validTimes = times.filter((time: number) => time > now - windowMs);
        if (validTimes.length === 0) {
          requests.delete(ip);
        } else {
          requests.set(ip, validTimes);
        }
      });
    }
    
    next();
  };
};

// Security headers middleware
const securityHeaders = (req: Request, res: Response, next: NextFunction) => {
  // Add security headers to all responses
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Content-Security-Policy', "default-src 'self'; img-src 'self' data:; style-src 'self' 'unsafe-inline'; script-src 'self' 'unsafe-inline'");
  res.setHeader('Referrer-Policy', 'no-referrer-when-downgrade');
  next();
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Apply global middlewares
  app.use(securityHeaders);
  
  // Set up authentication
  setupAuth(app);
  
  // Create uploads directory if it doesn't exist
  const uploadsDir = path.join(process.cwd(), 'uploads');
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
  
  // Configure multer for file uploads
  const diskStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, uploadsDir)
    },
    filename: function (req, file, cb) {
      // Create a unique filename with original extension
      const uniqueSuffix = Date.now() + '-' + crypto.randomBytes(8).toString('hex');
      const ext = path.extname(file.originalname);
      cb(null, uniqueSuffix + ext);
    }
  });
  
  const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Add allowed file types
    const allowedFileTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain', 'text/csv', 'application/json',
      'application/zip', 'application/x-zip-compressed'
    ];
    
    if (allowedFileTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Unsupported file type'));
    }
  };
  
  const upload = multer({ 
    storage: diskStorage,
    fileFilter: fileFilter,
    limits: {
      fileSize: 10 * 1024 * 1024 // Limit file size to 10MB
    }
  });
  
  // Serve static files from uploads directory
  app.use('/uploads', express.static(uploadsDir));
  
  // Apply rate limiters to specific routes
  const apiRateLimiter = createRateLimiter(60 * 1000, 30); // 30 requests per minute
  const ticketCreationLimiter = createRateLimiter(5 * 60 * 1000, 5); // 5 requests per 5 minutes
  const uploadLimiter = createRateLimiter(5 * 60 * 1000, 10); // 10 file uploads per 5 minutes
  
  // Get all tickets with caching headers
  app.get("/api/tickets", apiRateLimiter, async (req: Request, res: Response) => {
    try {
      const tickets = await dbStorage.getAllTickets();
      
      // Set cache-control headers for public caching
      res.setHeader('Cache-Control', 'public, max-age=5'); // Cache for 5 seconds
      res.json(tickets);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch tickets" });
    }
  });

  // Get a single ticket with caching headers
  app.get("/api/tickets/:id", apiRateLimiter, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ticket ID" });
      }
      
      const ticket = await dbStorage.getTicket(id);
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }
      
      // Set cache-control headers
      res.setHeader('Cache-Control', 'public, max-age=10'); // Cache for 10 seconds
      res.json(ticket);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch ticket" });
    }
  });

  // Create a new ticket with stricter rate limiting
  app.post("/api/tickets", ticketCreationLimiter, async (req: Request, res: Response) => {
    try {
      const result = insertTicketSchema.safeParse(req.body);
      
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({ message: validationError.message });
      }
      
      // Sanitize inputs to prevent XSS
      const sanitizedData = {
        ...result.data,
        title: result.data.title.trim(),
        description: result.data.description.trim()
      };
      
      const newTicket = await dbStorage.createTicket(sanitizedData);
      
      // Set proper no-cache headers for POST requests
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('Surrogate-Control', 'no-store');
      
      res.status(201).json(newTicket);
    } catch (error) {
      res.status(500).json({ message: "Failed to create ticket" });
    }
  });

  // Update ticket status
  app.patch("/api/tickets/:id/status", apiRateLimiter, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ticket ID" });
      }
      
      const statusSchema = z.object({
        status: z.enum(["solved", "unsolved"])
      });
      
      const result = statusSchema.safeParse(req.body);
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({ message: validationError.message });
      }
      
      const updatedTicket = await dbStorage.updateTicketStatus(id, result.data.status);
      if (!updatedTicket) {
        return res.status(404).json({ message: "Ticket not found" });
      }
      
      // Set proper no-cache headers for PATCH requests
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      res.setHeader('Surrogate-Control', 'no-store');
      
      res.json(updatedTicket);
    } catch (error) {
      res.status(500).json({ message: "Failed to update ticket status" });
    }
  });

  // Tags API
  app.get("/api/tags", apiRateLimiter, async (req: Request, res: Response) => {
    try {
      const allTags = await dbStorage.getAllTags();
      
      // Set cache-control headers for public caching
      res.setHeader('Cache-Control', 'public, max-age=60'); // Cache for 60 seconds
      res.json(allTags);
    } catch (error) {
      console.error("Error fetching tags:", error);
      res.status(500).json({ message: "Failed to fetch tags" });
    }
  });

  app.post("/api/tags", apiRateLimiter, async (req: Request, res: Response) => {
    try {
      const result = insertTagSchema.safeParse(req.body);
      
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({ message: validationError.message });
      }
      
      // Sanitize inputs
      const sanitizedData = {
        ...result.data,
        name: result.data.name.trim(),
        color: result.data.color.trim()
      };
      
      const newTag = await dbStorage.createTag(sanitizedData);
      
      // Set proper no-cache headers for POST requests
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      
      res.status(201).json(newTag);
    } catch (error) {
      console.error("Error creating tag:", error);
      res.status(500).json({ message: "Failed to create tag" });
    }
  });

  // Ticket Tags API
  app.get("/api/tickets/:id/tags", apiRateLimiter, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ticket ID" });
      }
      
      const tags = await dbStorage.getTicketTags(id);
      
      // Set cache-control headers
      res.setHeader('Cache-Control', 'public, max-age=10'); // Cache for 10 seconds
      res.json(tags);
    } catch (error) {
      console.error("Error fetching ticket tags:", error);
      res.status(500).json({ message: "Failed to fetch ticket tags" });
    }
  });

  app.post("/api/tickets/:id/tags", apiRateLimiter, async (req: Request, res: Response) => {
    try {
      const ticketId = parseInt(req.params.id);
      const { tagId } = req.body;
      
      if (isNaN(ticketId) || typeof tagId !== 'number') {
        return res.status(400).json({ message: "Invalid ticket ID or tag ID" });
      }
      
      await dbStorage.addTagToTicket(ticketId, tagId);
      
      // Set proper no-cache headers for POST requests
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      
      res.status(201).send();
    } catch (error) {
      console.error("Error adding tag to ticket:", error);
      res.status(500).json({ message: "Failed to add tag to ticket" });
    }
  });

  app.delete("/api/tickets/:ticketId/tags/:tagId", apiRateLimiter, async (req: Request, res: Response) => {
    try {
      const ticketId = parseInt(req.params.ticketId);
      const tagId = parseInt(req.params.tagId);
      
      if (isNaN(ticketId) || isNaN(tagId)) {
        return res.status(400).json({ message: "Invalid ticket ID or tag ID" });
      }
      
      await dbStorage.removeTagFromTicket(ticketId, tagId);
      
      // Set proper no-cache headers for DELETE requests
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      
      res.status(204).send();
    } catch (error) {
      console.error("Error removing tag from ticket:", error);
      res.status(500).json({ message: "Failed to remove tag from ticket" });
    }
  });

  // Update ticket progress (for different progress tracking states)
  app.patch("/api/tickets/:id/progress", apiRateLimiter, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ticket ID" });
      }
      
      const progressSchema = z.object({
        progress: z.enum(["not_started", "in_progress", "solved"])
      });
      
      const result = progressSchema.safeParse(req.body);
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({ message: validationError.message });
      }
      
      const updatedTicket = await dbStorage.updateTicketProgress(id, result.data.progress);
      if (!updatedTicket) {
        return res.status(404).json({ message: "Ticket not found" });
      }
      
      // Set proper no-cache headers
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      
      res.json(updatedTicket);
    } catch (error) {
      console.error("Error updating ticket progress:", error);
      res.status(500).json({ message: "Failed to update ticket progress" });
    }
  });

  // Update ticket priority
  app.patch("/api/tickets/:id/priority", apiRateLimiter, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ticket ID" });
      }
      
      const prioritySchema = z.object({
        priority: z.enum(["low", "medium", "high", "critical"])
      });
      
      const result = prioritySchema.safeParse(req.body);
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({ message: validationError.message });
      }
      
      const updatedTicket = await dbStorage.updateTicketPriority(id, result.data.priority);
      if (!updatedTicket) {
        return res.status(404).json({ message: "Ticket not found" });
      }
      
      // Set proper no-cache headers
      res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
      res.setHeader('Pragma', 'no-cache');
      res.setHeader('Expires', '0');
      
      res.json(updatedTicket);
    } catch (error) {
      console.error("Error updating ticket priority:", error);
      res.status(500).json({ message: "Failed to update ticket priority" });
    }
  });

  // Get filtered tickets by status
  app.get("/api/tickets/status/:status", apiRateLimiter, async (req: Request, res: Response) => {
    try {
      const { status } = req.params;
      if (!["solved", "unsolved"].includes(status)) {
        return res.status(400).json({ message: "Invalid status parameter" });
      }
      
      const tickets = await dbStorage.getTicketsByStatus(status);
      
      res.setHeader('Cache-Control', 'public, max-age=5');
      res.json(tickets);
    } catch (error) {
      console.error("Error fetching tickets by status:", error);
      res.status(500).json({ message: "Failed to fetch tickets by status" });
    }
  });

  // Get filtered tickets by progress
  app.get("/api/tickets/progress/:progress", apiRateLimiter, async (req: Request, res: Response) => {
    try {
      const { progress } = req.params;
      if (!["not_started", "in_progress", "solved"].includes(progress)) {
        return res.status(400).json({ message: "Invalid progress parameter" });
      }
      
      const tickets = await dbStorage.getTicketsByProgress(progress);
      
      res.setHeader('Cache-Control', 'public, max-age=5');
      res.json(tickets);
    } catch (error) {
      console.error("Error fetching tickets by progress:", error);
      res.status(500).json({ message: "Failed to fetch tickets by progress" });
    }
  });
  
  // Get tickets created by the current user
  app.get("/api/tickets/user", apiRateLimiter, async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const userTickets = await dbStorage.getTicketsByUser(req.user!.id);
      res.json(userTickets);
    } catch (error) {
      console.error("Error fetching user tickets:", error);
      res.status(500).json({ message: "Failed to fetch user tickets" });
    }
  });
  
  // Get tags created by the current user
  app.get("/api/user/tags", apiRateLimiter, async (req: Request, res: Response) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    
    try {
      const userTags = await dbStorage.getUserCreatedTags(req.user!.id);
      res.json(userTags);
    } catch (error) {
      console.error("Error fetching user tags:", error);
      res.status(500).json({ message: "Failed to fetch user tags" });
    }
  });

  // User preferences
  app.get("/api/user/preferences", apiRateLimiter, async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const user = await dbStorage.getUser(req.user!.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      res.json(user.preferences || {});
    } catch (error) {
      console.error("Error fetching user preferences:", error);
      res.status(500).json({ message: "Failed to fetch user preferences" });
    }
  });

  app.patch("/api/user/preferences", apiRateLimiter, async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const preferencesSchema = z.object({
        darkMode: z.boolean().optional(),
        dashboardLayout: z.string().optional(),
      });
      
      const result = preferencesSchema.safeParse(req.body);
      if (!result.success) {
        const validationError = fromZodError(result.error);
        return res.status(400).json({ message: validationError.message });
      }
      
      // Get current preferences and merge with updates
      const user = await dbStorage.getUser(req.user!.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      const currentPrefs = user.preferences || {};
      const updatedPrefs = { ...currentPrefs, ...result.data };
      
      const updatedUser = await dbStorage.updateUserPreferences(req.user!.id, updatedPrefs);
      
      res.json(updatedUser!.preferences);
    } catch (error) {
      console.error("Error updating user preferences:", error);
      res.status(500).json({ message: "Failed to update user preferences" });
    }
  });

  // File attachment routes
  app.post("/api/tickets/:id/attachments", uploadLimiter, upload.single('file'), async (req: Request, res: Response) => {
    try {
      const ticketId = parseInt(req.params.id);
      if (isNaN(ticketId)) {
        return res.status(400).json({ message: "Invalid ticket ID" });
      }
      
      // Verify that the ticket exists
      const ticket = await dbStorage.getTicket(ticketId);
      if (!ticket) {
        return res.status(404).json({ message: "Ticket not found" });
      }
      
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }
      
      // Create attachment record
      const attachment = await dbStorage.createAttachment({
        ticketId,
        fileName: req.file.originalname,
        fileType: req.file.mimetype,
        fileUrl: `/uploads/${req.file.filename}`,
        fileSize: req.file.size
      });
      
      res.status(201).json(attachment);
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ message: "Failed to upload file" });
    }
  });

  app.get("/api/tickets/:id/attachments", apiRateLimiter, async (req: Request, res: Response) => {
    try {
      const ticketId = parseInt(req.params.id);
      if (isNaN(ticketId)) {
        return res.status(400).json({ message: "Invalid ticket ID" });
      }
      
      const attachments = await dbStorage.getTicketAttachments(ticketId);
      
      res.json(attachments);
    } catch (error) {
      console.error("Error fetching attachments:", error);
      res.status(500).json({ message: "Failed to fetch attachments" });
    }
  });

  app.delete("/api/attachments/:id", apiRateLimiter, async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid attachment ID" });
      }
      
      // Get the attachment to find the file path
      const attachment = await dbStorage.getAttachment(id);
      if (!attachment) {
        return res.status(404).json({ message: "Attachment not found" });
      }
      
      // Delete the file from disk
      const filePath = path.join(process.cwd(), attachment.fileUrl.slice(1)); // Remove leading /
      try {
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      } catch (err) {
        console.error("Error deleting file from disk:", err);
        // Continue with deletion from database even if file delete fails
      }
      
      // Delete from database
      await dbStorage.deleteAttachment(id);
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting attachment:", error);
      res.status(500).json({ message: "Failed to delete attachment" });
    }
  });

  // User Activity Tracking
  app.get("/api/user/activities", apiRateLimiter, async (req: Request, res: Response) => {
    try {
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Not authenticated" });
      }
      
      const activities = await dbStorage.getUserActivities(req.user!.id);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching user activities:", error);
      res.status(500).json({ message: "Failed to fetch user activities" });
    }
  });

  app.get("/api/activities/recent", apiRateLimiter, async (req: Request, res: Response) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 20;
      const activities = await dbStorage.getRecentActivities(limit);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching recent activities:", error);
      res.status(500).json({ message: "Failed to fetch recent activities" });
    }
  });



  const httpServer = createServer(app);

  return httpServer;
}
