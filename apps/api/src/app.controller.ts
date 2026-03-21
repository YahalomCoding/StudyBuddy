import { Body, Controller, Get, Post } from "@nestjs/common";
import { ExampleDto } from "./app.dto";
import { AppService } from "./app.service";

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post("example")
  getExample(@Body() body: ExampleDto): ExampleDto {
    return body;
  }
}
