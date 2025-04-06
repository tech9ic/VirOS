import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTicketSchema, insertTagSchema } from "@shared/schema";
import { z } from "zod";
import { fromZodError } from "zod-validation-error";
import { setupAuth } from "./auth";

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
  
  // Apply rate limiters to specific routes
  const apiRateLimiter = createRateLimiter(60 * 1000, 30); // 30 requests per minute
  const ticketCreationLimiter = createRateLimiter(5 * 60 * 1000, 5); // 5 requests per 5 minutes
  
  // Get all tickets with caching headers
  app.get("/api/tickets", apiRateLimiter, async (req: Request, res: Response) => {
    try {
      const tickets = await storage.getAllTickets();
      
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
      
      const ticket = await storage.getTicket(id);
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
      
      const newTicket = await storage.createTicket(sanitizedData);
      
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
      
      const updatedTicket = await storage.updateTicketStatus(id, result.data.status);
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
      const allTags = await storage.getAllTags();
      
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
      
      const newTag = await storage.createTag(sanitizedData);
      
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
      
      const tags = await storage.getTicketTags(id);
      
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
      
      await storage.addTagToTicket(ticketId, tagId);
      
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
      
      await storage.removeTagFromTicket(ticketId, tagId);
      
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

  const httpServer = createServer(app);

  return httpServer;
}
