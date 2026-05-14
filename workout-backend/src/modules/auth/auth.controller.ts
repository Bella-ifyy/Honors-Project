import { AuthGuard } from "@app/guards/auth.guard";
import { ExpressRequest } from "@app/types/expressRequest.interface";
import {
  Body,
  Controller,
  Headers,
  Get,
  HttpException,
  HttpStatus,
  Param,
  Post,
  Put,
  Query,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { User } from "./decorators/user.decorator";
import { UserEntity } from "../../entities/user.entity";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("register")
  @UsePipes(new ValidationPipe())
  create(@Body() createUserDto: any) {
    return this.authService.create(createUserDto);
  }

  @Get("user/list")
  getUsers(@Query() query: any): any {
    return this.authService.getUsers(query);
  }

  @Post("change-password")
  changePassword(@Body() user: any) {
    return this.authService.updateUserPassword(
      user?.user_id,
      user?.newPassword,
    );
  }

  @Get("echo")
  @UsePipes(new ValidationPipe())
  echo() {
    console.log("echo");
    return {
      echo: "echo",
      environment: process.env.NODE_ENV,
    };
  }

  @Post("login")
  @UsePipes(new ValidationPipe())
  async login(@Body() loginUserDto: any) {
    return await this.authService.login(loginUserDto);
  }

  @Put("repair-user-data")
  @UseGuards(AuthGuard)
  async repairUserData(
    @Req() req: ExpressRequest,
    @Headers("authorization") authHeader: string,
  ) {
    const userUUID = req.user?.uuid || authHeader;
    return await this.authService.repairUserData(authHeader, userUUID);
  }

  @Post("add-push-token")
  addPushToken(
    @Body() payload: any,
    @Headers("authorization") authHeader: string,
  ) {
    return this.authService.addPushToken(payload, authHeader);
  }

  @Post("forgot-password")
  @UsePipes(new ValidationPipe())
  async forgotPassword(@Body() forgotPasswordDto: any) {
    return await this.authService.forgotPassword(forgotPasswordDto.email);
  }

  @Put("user")
  @UseGuards(AuthGuard)
  @Get("/")
  hello() {
    return "Hello";
  }

  @Post("delete-user")
  @UsePipes(new ValidationPipe())
  deleteUser(@Body() deleteUserDto: { email: string }) {
    return this.authService.deleteUser(deleteUserDto.email);
  }

  @Post("account/delete")
  @UseGuards(AuthGuard)
  @UsePipes(new ValidationPipe())
  deleteAccount(
    @Body() deleteAccountDto: { password: string },
    @Req() request: ExpressRequest,
  ) {
    return this.authService.deleteAccount(
      request.user.uuid,
      deleteAccountDto.password,
    );
  }
}
