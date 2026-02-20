import { NoteEntity } from "../../entities/note.entity";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import type { IOptions } from "sanitize-html";
import sanitizeHtml = require("sanitize-html");
import { AutoCategorizationService } from "../ai/auto-categorization.service";
import { TaskEntity } from "../../entities/task.entity";
import { NoteShareEntity } from "../../entities/note-share.entity";
import { DelegateEntity } from "../../entities/delegate.entity";
import { UserEntity } from "../../entities/user.entity";

const RICH_TEXT_SANITIZE_OPTIONS: IOptions = {
  allowedTags: [
    "p",
    "br",
    "ul",
    "ol",
    "li",
    "strong",
    "b",
    "em",
    "i",
    "u",
    "blockquote",
    "code",
    "pre",
    "span",
    "a",
    "h1",
    "h2",
    "h3"
  ],
  allowedAttributes: {
    a: ["href", "target", "rel"],
    span: [],
    code: [],
    pre: []
  },
  allowedSchemes: ["http", "https", "mailto"],
  allowedSchemesAppliedToAttributes: ["href"],
};

@Injectable()
export class NoteService {
  constructor(
    @InjectRepository(NoteEntity)
    private readonly noteRepository: Repository<NoteEntity>,
    @InjectRepository(TaskEntity)
    private readonly taskRepository: Repository<TaskEntity>,
    @InjectRepository(NoteShareEntity)
    private readonly noteShareRepository: Repository<NoteShareEntity>,
    @InjectRepository(DelegateEntity)
    private readonly delegateRepository: Repository<DelegateEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,


    private readonly autoCategorizationService: AutoCategorizationService,
  ) {}

  private sanitizeContent(content?: string | null): string {
    if (!content) {
      return "";
    }
    return sanitizeHtml(content, RICH_TEXT_SANITIZE_OPTIONS);
  }

  private normalizeTags(tags?: string[] | string | null): string[] | null {
    if (!tags) {
      return null;
    }
    const raw = Array.isArray(tags) ? tags : String(tags).split(',');
    const normalized = raw
      .map(tag => String(tag).trim())
      .filter(tag => tag.length > 0);
    return normalized.length ? normalized : null;
  }

  async createNote(
    createNoteDto: any,
    authHeader: string,
  ): Promise<NoteEntity> {
    const { title, content, taskId } = createNoteDto;
    const safeContent = this.sanitizeContent(content);

    const note = new NoteEntity();

    Object.assign(note, {
      title,
      content: safeContent,
      userUUID: authHeader,
    });
    if (createNoteDto?.category) {
      note.category = String(createNoteDto.category).trim();
    }
    const normalizedTags = this.normalizeTags(createNoteDto?.tags);
    if (normalizedTags) {
      note.tags = normalizedTags;
    }
    if (typeof createNoteDto?.isPrivate === "boolean") {
      note.isPrivate = createNoteDto.isPrivate;
    }
    if (createNoteDto?.createdByApiKeyId) {
      note.createdByApiKeyId = Number(createNoteDto.createdByApiKeyId);
      note.createdVia = createNoteDto.createdVia ?? "api";
    }

    if (typeof taskId !== "undefined" && taskId !== null) {
      const task = await this.ensureTaskOwnership(Number(taskId), authHeader);
      note.taskId = task?.id ?? null;
    }

    return await this.noteRepository.save(note);
  }

  async listNotesByUser(userUUID: string): Promise<NoteEntity[]> {
    const delegateLinks = await this.delegateRepository.find({
      where: { delegateUUID: userUUID },
    });
    const ownerUUIDs = delegateLinks.map(link => link.ownerUUID);

    if (!ownerUUIDs.length) {
      const notes = await this.noteRepository.find({ where: { userUUID } });
      return this.attachOwnerInfo(notes);
    }

    const notes = await this.noteRepository
      .createQueryBuilder("note")
      .where("note.userUUID = :userUUID", { userUUID })
      .orWhere("note.userUUID IN (:...ownerUUIDs) AND note.isPrivate = 0", {
        ownerUUIDs,
      })
      .getMany();
    return this.attachOwnerInfo(notes);
  }

  async getNoteById(id: number): Promise<NoteEntity> {
    const note = await this.noteRepository.findOne(id);
    if (!note) {
      throw new NotFoundException("Note not found");
    }
    return note;
  }

  async getNoteByIdForUser(id: number, userUUID: string): Promise<NoteEntity> {
    const note = await this.noteRepository.findOne({ where: { id } });
    if (!note) {
      throw new NotFoundException("Note not found");
    }
    const canView = await this.canViewNote(note, userUUID);
    if (!canView) {
      throw new NotFoundException("Note not found or unauthorized");
    }
    return note;
  }

  private async ensureTaskOwnership(
    taskId: number | null | undefined,
    userUUID: string,
  ): Promise<TaskEntity | null> {
    if (taskId === null || taskId === undefined) {
      return null;
    }
    const task = await this.taskRepository.findOne({
      where: { id: taskId, userUUID },
    });
    if (!task) {
      throw new NotFoundException("Task not found or unauthorized");
    }
    return task;
  }

  async updateNoteById(
    id: number,
    updateNoteDto: any,
    authHeader?: string,
  ): Promise<NoteEntity> {
    const note = await this.noteRepository.findOne({
      where: { id },
    });
    if (!note) {
      throw new NotFoundException("Note not found or unauthorized");
    }
    if (authHeader) {
      const canEdit = await this.canEditNote(note, authHeader);
      if (!canEdit) {
        throw new NotFoundException("Note not found or unauthorized");
      }
    }

    const { title, content, taskId, tags, isPrivate, ...rest } = updateNoteDto;

    if (typeof title === "string") {
      note.title = title;
    }
    if (typeof content === "string") {
      note.content = this.sanitizeContent(content);
    }
    if (typeof tags !== "undefined") {
      note.tags = this.normalizeTags(tags) ?? [];
    }
    if (Object.keys(rest).length) {
      Object.assign(note, rest);
    }
    if (typeof isPrivate === "boolean" && note.userUUID === authHeader) {
      note.isPrivate = isPrivate;
    }

    if ("taskId" in updateNoteDto) {
      if (taskId === null || taskId === undefined || taskId === "") {
        note.taskId = null;
      } else {
        const task = await this.ensureTaskOwnership(Number(taskId), note.userUUID);
        note.taskId = task?.id ?? null;
      }
    }

    note.updatedAt = new Date();

    return await this.noteRepository.save(note);
  }

  async deleteNoteById(
    id: number,
    authHeader: string,
  ): Promise<{ message: string }> {
    const note = await this.noteRepository.findOne({
      where: { id },
    });
    if (!note) {
      throw new NotFoundException("Note not found or unauthorized");
    }
    const canEdit = await this.canEditNote(note, authHeader);
    if (!canEdit) {
      throw new NotFoundException("Note not found or unauthorized");
    }

    await this.noteShareRepository.delete({ noteId: id });
    await this.noteRepository.delete(id);
    return { message: "Note deleted successfully" };
  }

  async searchNotes(
    searchQuery: string,
    authHeader: string,
  ): Promise<NoteEntity[]> {
    if (!searchQuery) {
      return await this.listNotesByUser(authHeader);
    }

    const delegateLinks = await this.delegateRepository.find({
      where: { delegateUUID: authHeader },
    });
    const ownerUUIDs = delegateLinks.map(link => link.ownerUUID);

    return await this.noteRepository
      .createQueryBuilder("note")
      .where("note.userUUID = :userUUID", { userUUID: authHeader })
      .orWhere(
        ownerUUIDs.length
          ? "note.userUUID IN (:...ownerUUIDs) AND note.isPrivate = 0"
          : "1=0",
        { ownerUUIDs },
      )
      .andWhere("(note.title LIKE :search OR note.content LIKE :search)", {
        search: `%${searchQuery}%`,
      })
      .orderBy("note.createdAt", "DESC")
      .getMany()
      .then(notes => this.attachOwnerInfo(notes));
  }

  async getNotesByCategory(
    category: string,
    authHeader: string,
  ): Promise<NoteEntity[]> {
    return await this.noteRepository.find({
      where: { userUUID: authHeader, category },
      order: { createdAt: "DESC" },
    });
  }

  async getFavoriteNotes(authHeader: string): Promise<NoteEntity[]> {
    return await this.noteRepository.find({
      where: { userUUID: authHeader, isFavorite: true },
      order: { updatedAt: "DESC" },
    });
  }

  async toggleFavorite(id: number, authHeader: string): Promise<NoteEntity> {
    const note = await this.noteRepository.findOne({
      where: { id, userUUID: authHeader },
    });
    if (!note) {
      throw new NotFoundException("Note not found or unauthorized");
    }

    note.isFavorite = !note.isFavorite;
    note.updatedAt = new Date();

    return await this.noteRepository.save(note);
  }

  async deleteUserNotes(userUUID: string): Promise<void> {
    try {
      await this.noteRepository.delete({ userUUID });
      await this.noteShareRepository.delete({ ownerUUID: userUUID });
    } catch (error) {
      console.error('Error deleting user notes:', error);
      throw error;
    }
  }

  async listNoteShares(noteId: number, ownerUUID: string) {
    const note = await this.noteRepository.findOne({
      where: { id: noteId, userUUID: ownerUUID },
    });
    if (!note) {
      throw new NotFoundException("Note not found or unauthorized");
    }
    return await this.noteShareRepository.find({
      where: { noteId, ownerUUID },
    });
  }

  async updateNoteShares(
    noteId: number,
    ownerUUID: string,
    shares: Array<{ delegateUUID: string; canEdit?: boolean }>,
  ) {
    const note = await this.noteRepository.findOne({
      where: { id: noteId, userUUID: ownerUUID },
    });
    if (!note) {
      throw new NotFoundException("Note not found or unauthorized");
    }

    const delegates = await this.delegateRepository.find({
      where: { ownerUUID },
    });
    const allowed = new Set(delegates.map(delegate => delegate.delegateUUID));

    const normalized = shares
      .filter(share => allowed.has(share.delegateUUID))
      .reduce<Map<string, { delegateUUID: string; canEdit: boolean }>>(
        (acc, share) => {
          acc.set(share.delegateUUID, {
            delegateUUID: share.delegateUUID,
            canEdit: Boolean(share.canEdit),
          });
          return acc;
        },
        new Map(),
      );

    if (shares.length && !normalized.size) {
      throw new BadRequestException("No valid delegates found for this note");
    }

    await this.noteShareRepository.delete({ noteId, ownerUUID });

    if (normalized.size > 0) {
      const newShares = Array.from(normalized.values()).map(share =>
        this.noteShareRepository.create({
          noteId,
          ownerUUID,
          delegateUUID: share.delegateUUID,
          canEdit: share.canEdit,
        }),
      );
      await this.noteShareRepository.save(newShares);
    }

    return await this.noteShareRepository.find({
      where: { noteId, ownerUUID },
    });
  }

  async getNoteAccess(noteId: number, userUUID: string) {
    const note = await this.noteRepository.findOne({ where: { id: noteId } });
    if (!note) {
      throw new NotFoundException("Note not found");
    }
    const canView = await this.canViewNote(note, userUUID);
    if (!canView) {
      throw new NotFoundException("Note not found or unauthorized");
    }
    const isOwner = note.userUUID === userUUID;
    const canEdit = await this.canEditNote(note, userUUID);
    return { isOwner, canEdit, canView };
  }

  private async canViewNote(note: NoteEntity, userUUID: string): Promise<boolean> {
    if (note.userUUID === userUUID) {
      return true;
    }
    if (note.isPrivate) {
      return false;
    }
    const delegate = await this.delegateRepository.findOne({
      where: { ownerUUID: note.userUUID, delegateUUID: userUUID },
    });
    return Boolean(delegate);
  }

  private async canEditNote(note: NoteEntity, userUUID: string): Promise<boolean> {
    if (note.userUUID === userUUID) {
      return true;
    }
    if (note.isPrivate) {
      return false;
    }
    const delegate = await this.delegateRepository.findOne({
      where: { ownerUUID: note.userUUID, delegateUUID: userUUID },
    });
    return Boolean(delegate);
  }

  private async attachOwnerInfo(notes: NoteEntity[]): Promise<any[]> {
    if (!notes.length) {
      return notes;
    }
    const ownerUUIDs = Array.from(new Set(notes.map(note => note.userUUID)));
    const owners = await this.userRepository.find({
      where: { uuid: In(ownerUUIDs) },
    });
    const ownerMap = new Map(
      owners.map(owner => [
        owner.uuid,
        {
          ownerName: `${owner.firstName ?? ""} ${owner.lastName ?? ""}`.trim(),
          ownerEmail: owner.email,
        },
      ]),
    );
    return notes.map(note => ({
      ...note,
      ownerName: ownerMap.get(note.userUUID)?.ownerName || null,
      ownerEmail: ownerMap.get(note.userUUID)?.ownerEmail || null,
    }));
  }
}
