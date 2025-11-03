import { AuthGuard } from "../../guards/auth.guard";
import { ExpressRequest } from "../../types/expressRequest.interface";
import {
  Body,
  Controller,
  Headers,
  Get,
  Param,
  Post,
  Put,
  Delete,
  Query,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { NoteEntity } from "../../entities/note.entity";
import { NoteService } from "./note.service";

@Controller("note")
export class NoteController {
  constructor(private readonly noteService: NoteService) {}

  @Post("/create")
  @UseGuards(AuthGuard)
  async createNote(
    @Req() req: ExpressRequest,
    @Body() createNoteDto: any,
    @Headers("authorization") authHeader: string,
  ) {
    const userUUID = req.user?.uuid || authHeader;
    return await this.noteService.createNote(createNoteDto, userUUID);
  }

  // List all notes with optional search functionality
  @Get("/")
  @UseGuards(AuthGuard)
  async listNotes(@Req() req: ExpressRequest, @Headers("authorization") authHeader: string) {
    const userUUID = req.user?.uuid || authHeader;
    return await this.noteService.listNotesByUser(userUUID);
  }

  // Fetch a single note by its ID
  @Get("/:id")
  @UseGuards(AuthGuard)
  async getNote(
    @Req() req: ExpressRequest,
    @Param("id") id: number,
    @Headers("authorization") authHeader: string,
  ) {
    const userUUID = req.user?.uuid || authHeader;
    return await this.noteService.getNoteByIdForUser(id, userUUID);
  }

  // Update a note's details by its ID
  @Put("/:id")
  @UseGuards(AuthGuard)
  async updateNote(
    @Req() req: ExpressRequest,
    @Param("id") id: number,
    @Body() updateNoteDto: any,
    @Headers("authorization") authHeader: string,
  ) {
    const userUUID = req.user?.uuid || authHeader;
    return await this.noteService.updateNoteById(id, updateNoteDto, userUUID);
  }

  // Update a note's details by its ID (alternative route for frontend compatibility)
  @Put("/update/:id")
  @UseGuards(AuthGuard)
  async updateNoteByUpdateRoute(
    @Req() req: ExpressRequest,
    @Param("id") id: number,
    @Body() updateNoteDto: any,
    @Headers("authorization") authHeader: string,
  ) {
    const userUUID = req.user?.uuid || authHeader;
    return await this.noteService.updateNoteById(id, updateNoteDto, userUUID);
  }

  // Delete a note by its ID
  @Delete("/:id")
  @UseGuards(AuthGuard)
  async deleteNote(
    @Req() req: ExpressRequest,
    @Param("id") id: number,
    @Headers("authorization") authHeader: string,
  ) {
    const userUUID = req.user?.uuid || authHeader;
    return await this.noteService.deleteNoteById(id, userUUID);
  }

  // Search notes by title or content
  @Get("/search/query")
  async searchNotes(
    @Query("q") searchQuery: string,
    @Headers("authorization") authHeader: string,
  ) {
    return await this.noteService.searchNotes(searchQuery, authHeader);
  }

  // Get notes by category
  @Get("/category/:category")
  async getNotesByCategory(
    @Param("category") category: string,
    @Headers("authorization") authHeader: string,
  ) {
    return await this.noteService.getNotesByCategory(category, authHeader);
  }

  // Get favorite notes
  @Get("/favorites/list")
  async getFavoriteNotes(@Headers("authorization") authHeader: string) {
    return await this.noteService.getFavoriteNotes(authHeader);
  }

  // Toggle favorite status
  @Put("/:id/favorite")
  async toggleFavorite(
    @Param("id") id: number,
    @Headers("authorization") authHeader: string,
  ) {
    return await this.noteService.toggleFavorite(id, authHeader);
  }

  @Get("/:id/shares")
  @UseGuards(AuthGuard)
  async listShares(
    @Req() req: ExpressRequest,
    @Param("id") id: number,
    @Headers("authorization") authHeader: string,
  ) {
    const userUUID = req.user?.uuid || authHeader;
    return await this.noteService.listNoteShares(id, userUUID);
  }

  @Get("/:id/access")
  @UseGuards(AuthGuard)
  async getAccess(
    @Req() req: ExpressRequest,
    @Param("id") id: number,
    @Headers("authorization") authHeader: string,
  ) {
    const userUUID = req.user?.uuid || authHeader;
    return await this.noteService.getNoteAccess(id, userUUID);
  }

  @Put("/:id/shares")
  @UseGuards(AuthGuard)
  async updateShares(
    @Req() req: ExpressRequest,
    @Param("id") id: number,
    @Body() payload: { shares?: Array<{ delegateUUID: string; canEdit?: boolean }> },
    @Headers("authorization") authHeader: string,
  ) {
    const userUUID = req.user?.uuid || authHeader;
    return await this.noteService.updateNoteShares(id, userUUID, payload?.shares ?? []);
  }
}
