import { NextResponse } from "next/server";

const MAX_CHARS = 15000;

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const fileName = file.name.toLowerCase();
    let text = "";

    if (fileName.endsWith(".txt")) {
      text = await file.text();
    } else if (fileName.endsWith(".pdf")) {
      // @ts-expect-error pdf-parse ESM default export compatibility
      const pdfParse = (await import("pdf-parse")).default;
      const buffer = Buffer.from(await file.arrayBuffer());
      const result = await pdfParse(buffer);
      text = result.text;
    } else if (fileName.endsWith(".docx")) {
      const mammoth = await import("mammoth");
      const buffer = Buffer.from(await file.arrayBuffer());
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else {
      return NextResponse.json(
        { error: "Unsupported file type. Please upload PDF, DOCX, or TXT." },
        { status: 400 }
      );
    }

    // Clean up whitespace and truncate
    text = text.replace(/\s+/g, " ").trim();
    if (text.length > MAX_CHARS) {
      text = text.slice(0, MAX_CHARS);
    }

    if (!text) {
      return NextResponse.json(
        { error: "Could not extract any text from the file." },
        { status: 400 }
      );
    }

    return NextResponse.json({ text, fileName: file.name });
  } catch (error) {
    console.error("Text extraction error:", error);
    return NextResponse.json(
      { error: "Failed to extract text from file" },
      { status: 500 }
    );
  }
}
