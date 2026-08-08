import { BadRequestException, Injectable } from "@nestjs/common";

const MAX_EXTRACTED_CHARACTERS = 120_000;

export type ExtractedPdf = {
  text: string;
  pageCount: number;
  wasTruncated: boolean;
};

@Injectable()
export class SyllabusPdfService {
  async extractText(fileBuffer: Buffer): Promise<ExtractedPdf> {
    if (
      fileBuffer.length < 5 ||
      fileBuffer.subarray(0, 5).toString() !== "%PDF-"
    ) {
      throw new BadRequestException("The uploaded file is not a valid PDF");
    }

    try {
      const { extractText, getDocumentProxy } = await import("unpdf");
      const document = await getDocumentProxy(new Uint8Array(fileBuffer));

      try {
        const result = await extractText(document, { mergePages: true });
        const extractedText = Array.isArray(result.text)
          ? result.text.join("\n")
          : result.text;
        const normalizedText = this.normalizeText(extractedText ?? "");

        if (normalizedText.length < 80) {
          throw new BadRequestException(
            "Almost no readable text was found. This PDF may be scanned or image-only."
          );
        }

        return {
          text: normalizedText.slice(0, MAX_EXTRACTED_CHARACTERS),
          pageCount: result.totalPages,
          wasTruncated: normalizedText.length > MAX_EXTRACTED_CHARACTERS,
        };
      } finally {
        const maybeDestroy = (
          document as { destroy?: () => Promise<void> | void }
        ).destroy;
        if (typeof maybeDestroy === "function") {
          await maybeDestroy.call(document);
        } else {
          document.loadingTask.destroy();
        }
      }
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new BadRequestException(
        "The PDF could not be read. Please try exporting it again as a text-based PDF."
      );
    }
  }

  private normalizeText(text: string): string {
    return text
      .replace(/\u0000/g, "")
      .replace(/[\u200e\u200f\u202a-\u202e\u2066-\u2069]/gi, "")
      .replace(/\r\n/g, "\n")
      .replace(/\r/g, "\n")
      .replace(/[\t ]+/g, " ")
      .replace(/ *\n */g, "\n")
      .replace(/\n{3,}/g, "\n\n")
      .trim();
  }
}
