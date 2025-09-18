import { users, candidates, programs, darsData, type User, type InsertUser, type Candidate, type InsertCandidate, type Program, type InsertProgram, type DarsData, type InsertDarsData } from "@shared/schema";
import { db } from "./db";
import { eq, like, or, and, count, sql } from "drizzle-orm";

export interface IStorage {
  // User management
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(insertUser: InsertUser): Promise<User>;
  
  // Candidate management
  getAllCandidates(): Promise<Candidate[]>;
  getCandidate(id: number): Promise<Candidate | undefined>;
  getCandidateByCode(code: string): Promise<Candidate | undefined>;
  createCandidate(insertCandidate: InsertCandidate): Promise<Candidate>;
  updateCandidate(id: number, updateData: Partial<Candidate>): Promise<Candidate>;
  deleteCandidate(id: number): Promise<void>;
  searchCandidates(searchTerm: string, zone?: string): Promise<Candidate[]>;
  searchCandidatesAdvanced(searchTerm: string, zone?: string, category?: string): Promise<Candidate[]>;
  
  // Program management
  getAllPrograms(): Promise<Program[]>;
  createProgram(insertProgram: InsertProgram): Promise<Program>;
  updateProgram(id: number, updateData: Partial<Program>): Promise<Program>;
  deleteProgram(id: number): Promise<void>;
  
  // Dars management
  getAllDars(): Promise<DarsData[]>;
  createDars(insertDars: InsertDarsData): Promise<DarsData>;
  updateDars(id: number, updateData: Partial<DarsData>): Promise<DarsData>;
  deleteDars(id: number): Promise<void>;
  getDarsWithCandidateCounts(zone?: string, search?: string): Promise<any[]>;
  getProgramsWithCandidateCounts(category?: string, zone?: string): Promise<any[]>;
  
  // Statistics
  getStatistics(): Promise<{
    totalCandidates: number;
    totalPrograms: number;
    totalDars: number;
    candidatesByCategory: Record<string, number>;
    candidatesByZone: Record<string, number>;
  }>;
}

export class DatabaseStorage implements IStorage {
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

  // Candidate methods
  async getAllCandidates(): Promise<Candidate[]> {
    return await db.select().from(candidates).orderBy(candidates.code);
  }

  async getCandidate(id: number): Promise<Candidate | undefined> {
    const [candidate] = await db.select().from(candidates).where(eq(candidates.id, id));
    return candidate || undefined;
  }

  async getCandidateByCode(code: string): Promise<Candidate | undefined> {
    const [candidate] = await db.select().from(candidates).where(eq(candidates.code, code));
    return candidate || undefined;
  }

  async createCandidate(insertCandidate: InsertCandidate): Promise<Candidate> {
    const [candidate] = await db
      .insert(candidates)
      .values(insertCandidate)
      .returning();
    return candidate;
  }

  async updateCandidate(id: number, updateData: Partial<Candidate>): Promise<Candidate> {
    const [candidate] = await db
      .update(candidates)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(candidates.id, id))
      .returning();
    return candidate;
  }

  async deleteCandidate(id: number): Promise<void> {
    await db.delete(candidates).where(eq(candidates.id, id));
  }

  async searchCandidates(searchTerm: string, zone?: string): Promise<Candidate[]> {
    const searchConditions = [
      like(candidates.name, `%${searchTerm}%`),
      like(candidates.code, `%${searchTerm}%`),
      like(candidates.darsname, `%${searchTerm}%`),
    ];

    const whereConditions = [or(...searchConditions)];
    
    if (zone) {
      whereConditions.push(eq(candidates.zone, zone));
    }

    return await db
      .select()
      .from(candidates)
      .where(whereConditions.length === 1 ? whereConditions[0] : and(...whereConditions))
      .orderBy(candidates.code);
  }

  async searchCandidatesAdvanced(searchTerm: string, zone?: string, category?: string): Promise<Candidate[]> {
    const searchConditions = [];
    
    if (searchTerm) {
      searchConditions.push(
        or(
          like(candidates.name, `%${searchTerm}%`),
          like(candidates.code, `%${searchTerm}%`),
          like(candidates.darsname, `%${searchTerm}%`)
        )
      );
    }
    
    if (zone) {
      searchConditions.push(eq(candidates.zone, zone));
    }
    
    if (category) {
      searchConditions.push(eq(candidates.category, category));
    }

    let query = db.select().from(candidates);
    
    if (searchConditions.length > 0) {
      query = query.where(searchConditions.length === 1 ? searchConditions[0] : and(...searchConditions));
    }

    return await query.orderBy(candidates.code);
  }

  // Program methods
  async getAllPrograms(): Promise<Program[]> {
    return await db.select().from(programs).orderBy(programs.name);
  }

  async createProgram(insertProgram: InsertProgram): Promise<Program> {
    const [program] = await db
      .insert(programs)
      .values(insertProgram)
      .returning();
    return program;
  }

  async updateProgram(id: number, updateData: Partial<Program>): Promise<Program> {
    const [program] = await db
      .update(programs)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(programs.id, id))
      .returning();
    return program;
  }

  async deleteProgram(id: number): Promise<void> {
    await db.delete(programs).where(eq(programs.id, id));
  }

  // Dars methods
  async getAllDars(): Promise<DarsData[]> {
    return await db.select().from(darsData).orderBy(darsData.darsname);
  }

  async createDars(insertDars: InsertDarsData): Promise<DarsData> {
    const [dars] = await db
      .insert(darsData)
      .values(insertDars)
      .returning();
    return dars;
  }

  async updateDars(id: number, updateData: Partial<DarsData>): Promise<DarsData> {
    const [dars] = await db
      .update(darsData)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(darsData.id, id))
      .returning();
    return dars;
  }

  async deleteDars(id: number): Promise<void> {
    await db.delete(darsData).where(eq(darsData.id, id));
  }

  async getDarsWithCandidateCounts(zone?: string, search?: string): Promise<any[]> {
    let query = db
      .select({
        darsname: candidates.darsname,
        darsplace: candidates.darsplace,
        zone: candidates.zone,
        slug: candidates.slug,
        candidateCount: count()
      })
      .from(candidates)
      .groupBy(candidates.darsname, candidates.darsplace, candidates.zone, candidates.slug);

    const whereConditions = [];
    
    if (zone) {
      whereConditions.push(eq(candidates.zone, zone));
    }
    
    if (search) {
      whereConditions.push(like(candidates.darsname, `%${search}%`));
    }

    if (whereConditions.length > 0) {
      query = query.where(whereConditions.length === 1 ? whereConditions[0] : and(...whereConditions));
    }

    const result = await query.orderBy(candidates.darsname);
    return result.map(item => ({
      ...item,
      candidateCount: Number(item.candidateCount)
    }));
  }

  async getProgramsWithCandidateCounts(category?: string, zone?: string): Promise<any[]> {
    // Get all program types from candidates data
    const allPrograms = [];
    
    // Stage programs
    const stagePrograms = await db
      .select({
        name: candidates.stage1,
        type: sql<string>`'stage'`,
        category: candidates.category,
        zone: candidates.zone,
        count: count()
      })
      .from(candidates)
      .where(candidates.stage1.isNotNull())
      .groupBy(candidates.stage1, candidates.category, candidates.zone);

    allPrograms.push(...stagePrograms);

    // Add more program queries as needed for stage2, stage3, etc.
    
    let filteredPrograms = allPrograms;
    
    if (category) {
      filteredPrograms = filteredPrograms.filter(p => p.category === category);
    }
    
    if (zone) {
      filteredPrograms = filteredPrograms.filter(p => p.zone === zone);
    }

    return filteredPrograms.map(item => ({
      ...item,
      count: Number(item.count)
    }));
  }

  async getStatistics() {
    const totalCandidates = await db.select({ count: count() }).from(candidates);
    const totalPrograms = await db.select({ count: count() }).from(programs);
    const totalDars = await db.select({ count: count() }).from(darsData);
    
    const candidatesByCategory = await db
      .select({ category: candidates.category, count: count() })
      .from(candidates)
      .groupBy(candidates.category);
    
    const candidatesByZone = await db
      .select({ zone: candidates.zone, count: count() })
      .from(candidates)
      .groupBy(candidates.zone);

    return {
      totalCandidates: Number(totalCandidates[0]?.count || 0),
      totalPrograms: Number(totalPrograms[0]?.count || 0),
      totalDars: Number(totalDars[0]?.count || 0),
      candidatesByCategory: Object.fromEntries(
        candidatesByCategory.map(item => [item.category, Number(item.count)])
      ),
      candidatesByZone: Object.fromEntries(
        candidatesByZone.map(item => [item.zone, Number(item.count)])
      ),
    };
  }
}

export const storage = new DatabaseStorage();