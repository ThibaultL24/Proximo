#!/usr/bin/env python3
"""Render source code changed since the refactor baseline as searchable PDFs."""
from __future__ import annotations

import os
from pathlib import Path
import subprocess

from reportlab.lib import colors
from reportlab.lib.pagesizes import A3, landscape
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas

BASE = os.environ.get("CODE_PDF_BASE", "origin/refactor/lot1-domain-extraction")
HEAD = "HEAD"
OUT = Path(os.environ.get("CODE_PDF_DIR", "code_artifacts"))
OUT.mkdir(parents=True, exist_ok=True)

FONT_PATHS = [
    "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf",
    "/usr/share/fonts/truetype/liberation2/LiberationMono-Regular.ttf",
]
FONT_PATH = next((p for p in FONT_PATHS if Path(p).is_file()), None)
FONT = "Courier"
if FONT_PATH:
    pdfmetrics.registerFont(TTFont("CodeMono", FONT_PATH))
    FONT = "CodeMono"

PAGESIZE = landscape(A3)
PAGE_W, PAGE_H = PAGESIZE
MARGIN_X = 32
MARGIN_TOP = 27
MARGIN_BOTTOM = 29
HEADER_H = 25
TEXT_SIZE = 7.7
LINE_H = 10.8
DIGITS = 5
TEXT_X = MARGIN_X + 1
MAX_W = PAGE_W - 2 * MARGIN_X
CHAR_W = pdfmetrics.stringWidth("M", FONT, TEXT_SIZE)
MAX_CHARS = max(80, int(MAX_W / CHAR_W) - 3)

EXTENSIONS = {
    ".rb", ".rake", ".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs",
    ".css", ".scss", ".sass", ".html", ".erb", ".sql", ".sh",
    ".json", ".yml", ".yaml", ".py", ".toml", ".xml",
}
CODE_FILENAMES = {
    "Gemfile", "Rakefile", "Dockerfile", "Procfile", ".rubocop.yml",
    ".gitignore", ".env.example",
}


def command(*args: str) -> str:
    return subprocess.check_output(args, stderr=subprocess.PIPE).decode("utf-8", "replace")


def changed_files(prefix: str) -> list[str]:
    raw = command("git", "diff", "--name-only", "--diff-filter=ACMRT",
                  BASE, HEAD, "--", prefix).splitlines()
    return [name for name in raw
            if Path(name).suffix.lower() in EXTENSIONS or Path(name).name in CODE_FILENAMES]


def full_source(path: str) -> str:
    return command("git", "show", f"{HEAD}:{path}")


class PdfCode:
    def __init__(self, filename: Path, title: str, kind: str):
        self.pdf = canvas.Canvas(str(filename), pagesize=PAGESIZE, pageCompression=1)
        self.pdf.setTitle(title)
        self.pdf.setAuthor("Source GitHub — ThibaultL24/Proximo")
        self.kind = kind
        self.title = title
        self.page_no = 0
        self.current_file = ""
        self.y = 0
        self.lines = 0
        self.start_page()

    def start_page(self):
        if self.page_no:
            self.pdf.showPage()
        self.page_no += 1
        self.y = PAGE_H - MARGIN_TOP - HEADER_H
        self._header()

    def _header(self):
        self.pdf.setFillColor(colors.HexColor("#161e30"))
        self.pdf.rect(0, PAGE_H - 42, PAGE_W, 42, stroke=0, fill=1)
        self.pdf.setFont(FONT, 9)
        self.pdf.setFillColor(colors.white)
        caption = (self.title + " | " + self.current_file).strip()
        self.pdf.drawString(MARGIN_X, PAGE_H - 27, caption[:175])
        self.pdf.setFillColor(colors.HexColor("#d8e0ed"))
        self.pdf.setFont(FONT, 8)
        self.pdf.drawRightString(PAGE_W - MARGIN_X, PAGE_H - 27, f"{self.page_no}")
        self.pdf.setFillColor(colors.HexColor("#b8c2cf"))
        self.pdf.rect(MARGIN_X, 16, PAGE_W - 2 * MARGIN_X, 0.5, fill=1, stroke=0)

    def _font_color(self, line: str):
        if self.kind != "diff":
            return colors.HexColor("#1b2635")
        if line.startswith("+") and not line.startswith("+++"):
            return colors.HexColor("#006f3d")
        if line.startswith("-") and not line.startswith("---"):
            return colors.HexColor("#b02430")
        if line.startswith("@@"):
            return colors.HexColor("#2058a3")
        if line.startswith("diff --git") or line.startswith("index "):
            return colors.HexColor("#72519e")
        return colors.HexColor("#1b2635")

    def _line(self, text: str, color, continuation: bool = False):
        if self.y < MARGIN_BOTTOM + LINE_H:
            self.start_page()
        self.pdf.setFillColor(color)
        self.pdf.setFont(FONT, TEXT_SIZE)
        self.pdf.drawString(TEXT_X, self.y, text)
        self.y -= LINE_H
        self.lines += 1

    def textline(self, text: str, linenum: int | None = None):
        text = text.expandtabs(4).replace("\x00", "\\0")
        prefix = f"{linenum:0{DIGITS}d} | " if linenum is not None else ""
        width = MAX_CHARS - len(prefix)
        if width < 20:
            raise ValueError("PDF width too small for line numbers")
        if not text:
            self._line(prefix, self._font_color(text))
            return
        first = True
        while text:
            chunk, text = text[:width], text[width:]
            line_prefix = prefix if first else " " * len(prefix)
            self._line(line_prefix + chunk, self._font_color(chunk), continuation=not first)
            first = False

    def section(self, file_path: str):
        if self.current_file or self.lines > 0:
            self.start_page()
        self.current_file = file_path
        # Show full filename at the beginning of each source file.
        self.pdf.setFillColor(colors.HexColor("#ecf1f8"))
        self.pdf.rect(MARGIN_X, self.y - 9, MAX_W, 25, stroke=0, fill=1)
        self.pdf.setFillColor(colors.HexColor("#162c48"))
        self.pdf.setFont(FONT, 9)
        self.pdf.drawString(MARGIN_X + 8, self.y + 2, file_path[:175])
        self.y -= 30

    def save(self):
        self.pdf.save()
        return self.page_no, self.lines


def make_source(prefix: str, output_name: str) -> None:
    files = changed_files(prefix)
    if not files:
        raise RuntimeError(f"No changed source files in {prefix}")
    pdf = PdfCode(OUT / output_name, prefix, "source")
    for file_path in files:
        pdf.section(file_path)
        content = full_source(file_path)
        for n, line in enumerate(content.splitlines(), 1):
            pdf.textline(line, n)
    pages, lines = pdf.save()
    print(f"GENERATED {output_name}: {pages} pages, {len(files)} files, {lines} rendered code lines")


def make_diff(prefix: str, output_name: str) -> None:
    diff = command("git", "diff", "--no-ext-diff", "--find-renames",
                   "--unified=5", BASE, HEAD, "--", prefix)
    if not diff.strip():
        raise RuntimeError(f"No diff found in {prefix}")
    pdf = PdfCode(OUT / output_name, f"{BASE}...{HEAD} | {prefix}", "diff")
    for line in diff.splitlines():
        if line.startswith("diff --git"):
            pdf.current_file = line.removeprefix("diff --git ")
        pdf.textline(line)
    pages, lines = pdf.save()
    print(f"GENERATED {output_name}: {pages} pages, {lines} rendered diff lines")


def main():
    target = [
        ("apps/proximo/", "Proximo_code_complet_fichiers_modifies.pdf",
         "Proximo_diff_integral.pdf"),
        ("apps/fenetre-ouverte/", "Fenetre_Ouverte_code_complet_fichiers_modifies.pdf",
         "Fenetre_Ouverte_diff_integral.pdf"),
    ]
    for prefix, full_name, diff_name in target:
        make_source(prefix, full_name)
        make_diff(prefix, diff_name)
    for file in OUT.glob("*.pdf"):
        if file.stat().st_size < 3_000:
            raise RuntimeError(f"Suspiciously small PDF: {file}")
    print("ALL SOURCE-CODE PDFS GENERATED")


if __name__ == "__main__":
    main()
