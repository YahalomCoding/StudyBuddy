import { createZodDto } from "nestjs-zod";
import { getExampleSchema } from "@studybuddy/schemas";

export class ExampleDto extends createZodDto(getExampleSchema) {}
