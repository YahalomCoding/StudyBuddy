import { Body, Controller, Get, Post } from "@nestjs/common";
import { ApiBody, ApiCreatedResponse, ApiOkResponse } from "@nestjs/swagger";
import { ExampleDto } from "./app.dto";
import { AppService } from "./app.service";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOkResponse({ type: String })
  getHello(): string {
    return this.appService.getHello();
  }

  @Post("example")
  @ApiBody({ type: ExampleDto })
  @ApiCreatedResponse({ type: ExampleDto })
  getExample(@Body() body: ExampleDto): ExampleDto {
    return body;
  }
}
