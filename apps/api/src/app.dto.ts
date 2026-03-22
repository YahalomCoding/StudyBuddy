import { getExampleSchema } from "@studybuddy/schemas";
import { createZodDto } from "nestjs-zod";

export class ExampleDto extends createZodDto(getExampleSchema) {}
