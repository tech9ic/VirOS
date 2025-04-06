import { 
  tickets, users, tags, ticketTags,
  type Ticket, type InsertTicket, 
  type User, type InsertUser,
  type Tag, type InsertTag,
  type TicketTag, type InsertTicketTag
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Ticket operations
  getAllTickets(): Promise<Ticket[]>;
  getTicket(id: number): Promise<Ticket | undefined>;
  createTicket(ticket: InsertTicket): Promise<Ticket>;
  updateTicketStatus(id: number, status: string): Promise<Ticket | undefined>;
  
  // Tag operations
  getAllTags(): Promise<Tag[]>;
  getTag(id: number): Promise<Tag | undefined>;
  getTagByName(name: string): Promise<Tag | undefined>;
  createTag(tag: InsertTag): Promise<Tag>;
  
  // Ticket-Tag operations
  getTicketTags(ticketId: number): Promise<Tag[]>;
  addTagToTicket(ticketId: number, tagId: number): Promise<void>;
  removeTagFromTicket(ticketId: number, tagId: number): Promise<void>;
  
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
      .set({ status })
      .where(eq(tickets.id, id))
      .returning();
    return updatedTicket || undefined;
  }

  async getAllTags(): Promise<Tag[]> {
    return await db
      .select()
      .from(tags)
      .orderBy(tags.name);
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

  async getTicketTags(ticketId: number): Promise<Tag[]> {
    // Join ticketTags with tags to get the full tag objects
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
}

export const storage = new DatabaseStorage();
