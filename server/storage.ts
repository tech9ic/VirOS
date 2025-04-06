import { 
  tickets, users, tags, ticketTags, attachments, userActivities,
  type Ticket, type InsertTicket, 
  type User, type InsertUser,
  type Tag, type InsertTag,
  type TicketTag, type InsertTicketTag,
  type Attachment, type InsertAttachment,
  type UserActivity, type InsertUserActivity
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql, asc, or, not, isNull } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserPreferences(userId: number, preferences: any): Promise<User | undefined>;
  
  // Ticket operations
  getAllTickets(): Promise<Ticket[]>;
  getTicket(id: number): Promise<Ticket | undefined>;
  createTicket(ticket: InsertTicket): Promise<Ticket>;
  updateTicketStatus(id: number, status: string): Promise<Ticket | undefined>;
  updateTicketProgress(id: number, progress: string): Promise<Ticket | undefined>;
  updateTicketPriority(id: number, priority: string): Promise<Ticket | undefined>;
  getTicketsByStatus(status: string): Promise<Ticket[]>;
  getTicketsByProgress(progress: string): Promise<Ticket[]>;
  getTicketsByUser(userId: number): Promise<Ticket[]>;
  
  // Tag operations
  getAllTags(): Promise<Tag[]>;
  getTag(id: number): Promise<Tag | undefined>;
  getTagByName(name: string): Promise<Tag | undefined>;
  createTag(tag: InsertTag): Promise<Tag>;
  getUserCreatedTags(userId: number): Promise<Tag[]>;
  
  // Ticket-Tag operations
  getTicketTags(ticketId: number): Promise<Tag[]>;
  addTagToTicket(ticketId: number, tagId: number): Promise<void>;
  removeTagFromTicket(ticketId: number, tagId: number): Promise<void>;
  
  // Attachment operations
  createAttachment(attachment: InsertAttachment): Promise<Attachment>;
  getTicketAttachments(ticketId: number): Promise<Attachment[]>;
  getAttachment(id: number): Promise<Attachment | undefined>;
  deleteAttachment(id: number): Promise<void>;
  
  // User Activity operations
  logUserActivity(activity: InsertUserActivity): Promise<UserActivity>;
  getUserActivities(userId: number): Promise<UserActivity[]>;
  getRecentActivities(limit?: number): Promise<UserActivity[]>;
  
  // Session store for authentication
  sessionStore: session.Store;
}

// Setup PostgreSQL session store
const PostgresSessionStore = connectPg(session);

export class DatabaseStorage implements IStorage {
  sessionStore: session.Store;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async updateUserPreferences(userId: number, preferences: any): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ preferences })
      .where(eq(users.id, userId))
      .returning();
    return user || undefined;
  }

  // Ticket operations
  async getAllTickets(): Promise<Ticket[]> {
    return await db
      .select()
      .from(tickets)
      .orderBy(desc(tickets.createdAt));
  }

  async getTicket(id: number): Promise<Ticket | undefined> {
    const [ticket] = await db
      .select()
      .from(tickets)
      .where(eq(tickets.id, id));
    return ticket || undefined;
  }

  async createTicket(insertTicket: InsertTicket): Promise<Ticket> {
    const [ticket] = await db
      .insert(tickets)
      .values(insertTicket)
      .returning();
    return ticket;
  }

  async updateTicketStatus(id: number, status: string): Promise<Ticket | undefined> {
    const [updatedTicket] = await db
      .update(tickets)
      .set({ 
        status,
        updatedAt: new Date()
      })
      .where(eq(tickets.id, id))
      .returning();
    return updatedTicket || undefined;
  }

  async updateTicketProgress(id: number, progress: string): Promise<Ticket | undefined> {
    const [updatedTicket] = await db
      .update(tickets)
      .set({ 
        progress,
        updatedAt: new Date()
      })
      .where(eq(tickets.id, id))
      .returning();
    return updatedTicket || undefined;
  }

  async updateTicketPriority(id: number, priority: string): Promise<Ticket | undefined> {
    const [updatedTicket] = await db
      .update(tickets)
      .set({ 
        priority,
        updatedAt: new Date()
      })
      .where(eq(tickets.id, id))
      .returning();
    return updatedTicket || undefined;
  }

  async getTicketsByStatus(status: string): Promise<Ticket[]> {
    return await db
      .select()
      .from(tickets)
      .where(eq(tickets.status, status))
      .orderBy(desc(tickets.createdAt));
  }

  async getTicketsByProgress(progress: string): Promise<Ticket[]> {
    return await db
      .select()
      .from(tickets)
      .where(eq(tickets.progress, progress))
      .orderBy(desc(tickets.createdAt));
  }

  async getTicketsByUser(userId: number): Promise<Ticket[]> {
    return await db
      .select()
      .from(tickets)
      .where(eq(tickets.createdBy, userId))
      .orderBy(desc(tickets.createdAt));
  }

  // Tag operations
  async getAllTags(): Promise<Tag[]> {
    return await db
      .select()
      .from(tags)
      .orderBy(asc(tags.name));
  }

  async getTag(id: number): Promise<Tag | undefined> {
    const [tag] = await db
      .select()
      .from(tags)
      .where(eq(tags.id, id));
    return tag || undefined;
  }

  async getTagByName(name: string): Promise<Tag | undefined> {
    const [tag] = await db
      .select()
      .from(tags)
      .where(eq(tags.name, name));
    return tag || undefined;
  }

  async createTag(insertTag: InsertTag): Promise<Tag> {
    const [tag] = await db
      .insert(tags)
      .values(insertTag)
      .returning();
    return tag;
  }

  async getUserCreatedTags(userId: number): Promise<Tag[]> {
    return await db
      .select()
      .from(tags)
      .where(eq(tags.createdBy, userId))
      .orderBy(asc(tags.name));
  }

  // Ticket-Tag operations
  async getTicketTags(ticketId: number): Promise<Tag[]> {
    const result = await db
      .select({
        tag: tags
      })
      .from(ticketTags)
      .innerJoin(tags, eq(ticketTags.tagId, tags.id))
      .where(eq(ticketTags.ticketId, ticketId));
    
    return result.map(r => r.tag);
  }

  async addTagToTicket(ticketId: number, tagId: number): Promise<void> {
    // Check if the association already exists
    const [existing] = await db
      .select()
      .from(ticketTags)
      .where(and(
        eq(ticketTags.ticketId, ticketId),
        eq(ticketTags.tagId, tagId)
      ));
    
    // If not exists, create the association
    if (!existing) {
      await db.insert(ticketTags).values({
        ticketId,
        tagId
      });
    }
  }

  async removeTagFromTicket(ticketId: number, tagId: number): Promise<void> {
    await db
      .delete(ticketTags)
      .where(and(
        eq(ticketTags.ticketId, ticketId),
        eq(ticketTags.tagId, tagId)
      ));
  }

  // Attachment operations
  async createAttachment(attachment: InsertAttachment): Promise<Attachment> {
    const [newAttachment] = await db
      .insert(attachments)
      .values(attachment)
      .returning();
    return newAttachment;
  }

  async getTicketAttachments(ticketId: number): Promise<Attachment[]> {
    return await db
      .select()
      .from(attachments)
      .where(eq(attachments.ticketId, ticketId))
      .orderBy(desc(attachments.uploadedAt));
  }

  async getAttachment(id: number): Promise<Attachment | undefined> {
    const [attachment] = await db
      .select()
      .from(attachments)
      .where(eq(attachments.id, id));
    return attachment || undefined;
  }

  async deleteAttachment(id: number): Promise<void> {
    await db
      .delete(attachments)
      .where(eq(attachments.id, id));
  }

  // User Activity operations
  async logUserActivity(activity: InsertUserActivity): Promise<UserActivity> {
    const [newActivity] = await db
      .insert(userActivities)
      .values(activity)
      .returning();
    return newActivity;
  }

  async getUserActivities(userId: number): Promise<UserActivity[]> {
    return await db
      .select()
      .from(userActivities)
      .where(eq(userActivities.userId, userId))
      .orderBy(desc(userActivities.timestamp));
  }

  async getRecentActivities(limit = 20): Promise<UserActivity[]> {
    return await db
      .select()
      .from(userActivities)
      .orderBy(desc(userActivities.timestamp))
      .limit(limit);
  }
}

export const storage = new DatabaseStorage();
