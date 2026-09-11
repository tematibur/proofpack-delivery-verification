from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.pdfgen import canvas
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "sample-data"
OUT.mkdir(parents=True, exist_ok=True)

TEAL = colors.HexColor("#078F99")
INK = colors.HexColor("#12243A")
MUTED = colors.HexColor("#64748B")
BORDER = colors.HexColor("#D9E1E8")
SUBTLE = colors.HexColor("#F7F9FB")


def build_packing_list() -> None:
    path = OUT / "packing-list.pdf"
    doc = SimpleDocTemplate(
        str(path),
        pagesize=A4,
        leftMargin=18 * mm,
        rightMargin=18 * mm,
        topMargin=18 * mm,
        bottomMargin=18 * mm,
        title="Proofpack Sample Packing List",
        author="Proofpack test kit",
    )
    styles = getSampleStyleSheet()
    title = ParagraphStyle(
        "Title",
        parent=styles["Title"],
        fontName="Helvetica-Bold",
        fontSize=22,
        leading=26,
        textColor=INK,
        alignment=TA_CENTER,
        spaceAfter=6 * mm,
    )
    meta = ParagraphStyle(
        "Meta",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=9,
        leading=13,
        textColor=MUTED,
    )
    note = ParagraphStyle(
        "Note",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=9,
        leading=13,
        textColor=INK,
        backColor=colors.HexColor("#EAF8F3"),
        borderColor=colors.HexColor("#B7E4D5"),
        borderWidth=0.6,
        borderPadding=8,
    )

    story = [
        Paragraph("PACKING LIST", title),
        Table(
            [
                [Paragraph("Order", meta), "PP-2026-0911"],
                [Paragraph("Delivery", meta), "Controlled sample delivery"],
                [Paragraph("Expected packages", meta), "5 physical units across 4 product types"],
            ],
            colWidths=[38 * mm, 120 * mm],
            style=TableStyle(
                [
                    ("FONT", (1, 0), (1, -1), "Helvetica-Bold", 9),
                    ("TEXTCOLOR", (1, 0), (1, -1), INK),
                    ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
                    ("TOPPADDING", (0, 0), (-1, -1), 4),
                ]
            ),
        ),
        Spacer(1, 9 * mm),
    ]

    rows = [
        ["Row", "Item", "SKU", "Expected qty"],
        ["1", "Ceramic mug - blue", "MUG-BLUE-12", "1"],
        ["2", "Hand towel - sand", "TOWEL-SAND-02", "1"],
        ["3", "Lavender soap bar", "SOAP-LAV-100", "2"],
        ["4", "Vanilla candle", "CANDLE-VAN-08", "1"],
    ]
    table = Table(rows, colWidths=[18 * mm, 67 * mm, 48 * mm, 30 * mm], rowHeights=[12 * mm] + [15 * mm] * 4)
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), INK),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONT", (0, 0), (-1, 0), "Helvetica-Bold", 9),
                ("FONT", (0, 1), (-1, -1), "Helvetica", 10),
                ("FONT", (2, 1), (2, -1), "Helvetica-Bold", 10),
                ("ALIGN", (0, 0), (0, -1), "CENTER"),
                ("ALIGN", (3, 0), (3, -1), "CENTER"),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("GRID", (0, 0), (-1, -1), 0.6, BORDER),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, SUBTLE]),
                ("LEFTPADDING", (0, 0), (-1, -1), 7),
                ("RIGHTPADDING", (0, 0), (-1, -1), 7),
            ]
        )
    )
    story.extend(
        [
            table,
            Spacer(1, 12 * mm),
            Paragraph(
                "Capture convention: every physical object must keep one unique UNIT-XX label attached in every photograph. Submit one overview image and label close-ups without moving or relabelling objects.",
                note,
            ),
            Spacer(1, 8 * mm),
            Paragraph(
                "This document is a controlled, shareable test input. Product identity is established only by the printed SKU; visual retail-product recognition is outside the test scope.",
                meta,
            ),
        ]
    )
    doc.build(story)


def draw_label(c: canvas.Canvas, x: float, y: float, sku: str, unit_id: str, note: str) -> None:
    width = 82 * mm
    height = 49 * mm
    c.setStrokeColor(BORDER)
    c.setLineWidth(1)
    c.roundRect(x, y, width, height, 4 * mm, stroke=1, fill=0)
    c.setFillColor(TEAL)
    c.rect(x, y + height - 10 * mm, width, 10 * mm, stroke=0, fill=1)
    c.setFillColor(colors.white)
    c.setFont("Helvetica-Bold", 12)
    c.drawString(x + 5 * mm, y + height - 6.7 * mm, "PROOFPACK TEST UNIT")
    c.setFillColor(INK)
    c.setFont("Helvetica-Bold", 18)
    c.drawString(x + 5 * mm, y + 25 * mm, sku)
    c.setFont("Helvetica-Bold", 16)
    c.drawString(x + 5 * mm, y + 14 * mm, unit_id)
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 8)
    c.drawString(x + 5 * mm, y + 5 * mm, note)


def build_labels() -> None:
    path = OUT / "printable-unit-labels.pdf"
    c = canvas.Canvas(str(path), pagesize=A4, pageCompression=1)
    c.setTitle("Proofpack Printable Unit Labels")
    c.setFillColor(INK)
    c.setFont("Helvetica-Bold", 18)
    c.drawString(18 * mm, 281 * mm, "Cut out and attach one label to each object")
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 9)
    c.drawString(18 * mm, 274 * mm, "Keep UNIT IDs visible across overview and close-up photos.")

    labels = [
        ("MUG-BLUE-12", "UNIT-01", "Correct mug"),
        ("TOWEL-SAND-20", "UNIT-02", "Wrong but similarly named towel"),
        ("SOAP-LAV-100", "UNIT-03", "Expected soap 1 of 2"),
        ("SOAP-LAV-100", "UNIT-04", "Expected soap 2 of 2"),
        ("SOAP-LAV-100", "UNIT-05", "Extra soap unit"),
        ("CANDLE-VAN-08", "UNIT-06", "Obscure SKU in submitted photos"),
        ("TOWEL-SAND-02", "UNIT-07", "Correction: correct replacement towel"),
    ]
    positions = []
    for row in range(3):
        for col in range(2):
            positions.append((18 * mm + col * 92 * mm, 217 * mm - row * 60 * mm))
    for (sku, unit_id, note), (x, y) in zip(labels[:6], positions):
        draw_label(c, x, y, sku, unit_id, note)

    c.showPage()
    c.setFillColor(INK)
    c.setFont("Helvetica-Bold", 18)
    c.drawString(18 * mm, 281 * mm, "Corrected-delivery label")
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 9)
    c.drawString(18 * mm, 274 * mm, "Replace the wrong towel with this separately labelled unit.")
    draw_label(c, 18 * mm, 210 * mm, *labels[6])
    c.save()


if __name__ == "__main__":
    build_packing_list()
    build_labels()
    print(OUT / "packing-list.pdf")
    print(OUT / "printable-unit-labels.pdf")
