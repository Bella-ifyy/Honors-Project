import {
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { DiaryEntryEntity } from "../../entities/diary-entry.entity";

type DiaryMood = "reflective" | "grateful" | "energized" | "calm" | "melancholy";

const ALLOWED_MOODS: DiaryMood[] = [
  "reflective",
  "grateful",
  "energized",
  "calm",
  "melancholy",
];

const DEFAULT_MOOD: DiaryMood = "reflective";

interface UpsertDiaryPayload {
  title?: string;
  content?: string;
  mood?: DiaryMood;
  tags?: string[];
  favorite?: boolean;
}

@Injectable()
export class DiaryService {
  constructor(
    @InjectRepository(DiaryEntryEntity)
    private readonly diaryRepository: Repository<DiaryEntryEntity>,
  ) {}

  private normalizeMood(mood?: string): DiaryMood {
    if (mood && ALLOWED_MOODS.includes(mood as DiaryMood)) {
      return mood as DiaryMood;
    }
    return DEFAULT_MOOD;
  }

  private sanitizePayload(payload: UpsertDiaryPayload) {
    return {
      title: payload.title?.trim() || "Untitled entry",
      content: payload.content ?? "",
      mood: this.normalizeMood(payload.mood),
      tags: Array.isArray(payload.tags)
        ? payload.tags.filter((tag) => Boolean(tag?.trim()))
        : undefined,
      favorite: typeof payload.favorite === "boolean" ? payload.favorite : undefined,
    };
  }

  async listEntries(userUUID: string): Promise<DiaryEntryEntity[]> {
    return this.diaryRepository.find({
      where: { userUUID },
      order: { updatedAt: "DESC" },
    });
  }

  async searchEntries(userUUID: string, query?: string): Promise<DiaryEntryEntity[]> {
    if (!query?.trim()) {
      return this.listEntries(userUUID);
    }
    const likeQuery = `%${query.trim()}%`;
    return this.diaryRepository
      .createQueryBuilder("diary")
      .where("diary.userUUID = :userUUID", { userUUID })
      .andWhere("(diary.title LIKE :search OR diary.content LIKE :search)", {
        search: likeQuery,
      })
      .orderBy("diary.updatedAt", "DESC")
      .getMany();
  }

  async getEntryById(id: number, userUUID: string): Promise<DiaryEntryEntity> {
    const entry = await this.diaryRepository.findOne({
      where: { id, userUUID },
    });
    if (!entry) {
      throw new NotFoundException("Diary entry not found");
    }
    return entry;
  }

  async createEntry(
    payload: UpsertDiaryPayload,
    userUUID: string,
  ): Promise<DiaryEntryEntity> {
    const sanitized = this.sanitizePayload(payload);
    const entry = this.diaryRepository.create({
      ...sanitized,
      userUUID,
      favorite: sanitized.favorite ?? false,
      tags: sanitized.tags,
    });
    return this.diaryRepository.save(entry);
  }

  async updateEntry(
    id: number,
    userUUID: string,
    payload: UpsertDiaryPayload,
  ): Promise<DiaryEntryEntity> {
    const entry = await this.getEntryById(id, userUUID);
    const sanitized = this.sanitizePayload(payload);

    entry.title = sanitized.title;
    entry.content = sanitized.content;
    entry.mood = sanitized.mood;
    entry.tags = sanitized.tags ?? entry.tags;
    if (typeof sanitized.favorite === "boolean") {
      entry.favorite = sanitized.favorite;
    }
    entry.updatedAt = new Date();

    return this.diaryRepository.save(entry);
  }

  async deleteEntry(id: number, userUUID: string): Promise<{ message: string }> {
    const entry = await this.getEntryById(id, userUUID);
    await this.diaryRepository.delete(entry.id);
    return { message: "Diary entry deleted" };
  }

  async toggleFavorite(id: number, userUUID: string): Promise<DiaryEntryEntity> {
    const entry = await this.getEntryById(id, userUUID);
    entry.favorite = !entry.favorite;
    entry.updatedAt = new Date();
    return this.diaryRepository.save(entry);
  }
}
