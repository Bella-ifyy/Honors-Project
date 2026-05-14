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

  @Get("/")
  @UseGuards(AuthGuard)
  async listNotes(
    @Req() req: ExpressRequest,
    @Headers("authorization") authHeader: string,
  ) {
    const userUUID = req.user?.uuid || authHeader;
    return await this.noteService.listNotesByUser(userUUID);
  }

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

  @Get("/search/query")
  async searchNotes(
    @Query("q") searchQuery: string,
    @Headers("authorization") authHeader: string,
  ) {
    return await this.noteService.searchNotes(searchQuery, authHeader);
  }

  @Get("/category/:category")
  async getNotesByCategory(
    @Param("category") category: string,
    @Headers("authorization") authHeader: string,
  ) {
    return await this.noteService.getNotesByCategory(category, authHeader);
  }

  @Get("/favorites/list")
  async getFavoriteNotes(@Headers("authorization") authHeader: string) {
    return await this.noteService.getFavoriteNotes(authHeader);
  }

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
    @Body()
    payload: { shares?: Array<{ delegateUUID: string; canEdit?: boolean }> },
    @Headers("authorization") authHeader: string,
  ) {
    const userUUID = req.user?.uuid || authHeader;
    return await this.noteService.updateNoteShares(
      id,
      userUUID,
      payload?.shares ?? [],
    );
  }
}
