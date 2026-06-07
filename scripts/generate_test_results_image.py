from pathlib import Path

from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "docs" / "test-results-infographic-word.png"
FONT = "/System/Library/Fonts/Supplemental/Arial.ttf"
BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"


def font(size, bold=False):
    return ImageFont.truetype(BOLD if bold else FONT, size)


def text(draw, xy, value, size=24, fill="#0F172A", bold=False, anchor=None):
    draw.text(xy, value, font=font(size, bold), fill=fill, anchor=anchor)


def rounded(draw, box, radius=24, fill="#FFFFFF", outline=None, width=1):
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def check_icon(draw, center, color):
    x, y = center
    draw.line((x - 17, y, x - 5, y + 12, x + 18, y - 16), fill=color, width=8, joint="curve")


def exclamation_icon(draw, center, color):
    x, y = center
    draw.line((x, y - 18, x, y + 8), fill=color, width=7)
    draw.ellipse((x - 4, y + 18, x + 4, y + 26), fill=color)


def main():
    img = Image.new("RGB", (1600, 1000), "#F8FAFC")
    draw = ImageDraw.Draw(img)

    # Soft background bands.
    for y in range(1000):
        r = int(239 + (248 - 239) * y / 1000)
        g = int(246 + (250 - 246) * y / 1000)
        b = int(255 + (252 - 255) * y / 1000)
        draw.line([(0, y), (1600, y)], fill=(r, g, b))

    rounded(draw, (70, 55, 1530, 930), 36, "#FFFFFF", "#E2E8F0", 2)
    rounded(draw, (70, 55, 1530, 230), 36, "#2563EB")
    draw.rectangle((70, 170, 1530, 230), fill="#2563EB")

    text(draw, (125, 122), "Xarajat Taqsimlagich", 56, "#FFFFFF", True)
    text(draw, (125, 178), "Unit va integration test natijalari", 28, "#DBEAFE", True)
    text(draw, (1320, 130), "Backend + Frontend", 26, "#DBEAFE", True, "ra")
    text(draw, (1320, 176), "2026-yil · BMI uchun", 24, "#DBEAFE", False, "ra")

    cards = [
        ("13", "Backend", "pytest passed", "#DCFCE7", "#16A34A"),
        ("12", "Frontend", "Vitest passed", "#DBEAFE", "#2563EB"),
        ("25", "Jami test", "hammasi muvaffaqiyatli", "#ECFDF5", "#059669"),
        ("0", "Xatolik", "lint/build errors", "#FEF3C7", "#D97706"),
    ]
    x = 125
    for number, title, subtitle, icon_bg, color in cards:
        rounded(draw, (x, 285, x + 310, 455), 24, "#F8FAFC", "#E2E8F0", 2)
        draw.ellipse((x + 36, 320, x + 96, 380), fill=icon_bg)
        if number != "0":
            check_icon(draw, (x + 66, 352), color)
        else:
            exclamation_icon(draw, (x + 66, 346), color)
        text(draw, (x + 36, 423), number, 64, "#0F172A", True)
        text(draw, (x + 132, 392), title, 28, "#0F172A", True)
        text(draw, (x + 132, 424), subtitle, 19, "#64748B", True)
        x += 350

    # Bar chart card.
    rounded(draw, (125, 505, 805, 825), 28, "#FFFFFF", "#E2E8F0", 2)
    text(draw, (165, 555), "Testlar taqsimoti", 32, "#0F172A", True)
    text(draw, (165, 592), "Backend va frontend bo‘yicha passed testlar soni", 22, "#64748B")
    draw.line((220, 760, 735, 760), fill="#CBD5E1", width=3)
    draw.line((220, 625, 220, 760), fill="#CBD5E1", width=3)
    text(draw, (205, 625), "15", 18, "#64748B", False, "ra")
    text(draw, (205, 690), "8", 18, "#64748B", False, "ra")
    text(draw, (205, 765), "0", 18, "#64748B", False, "ra")

    backend_h = int(130 * 13 / 15)
    frontend_h = int(130 * 12 / 15)
    rounded(draw, (300, 760 - backend_h, 430, 760), 14, "#16A34A")
    rounded(draw, (560, 760 - frontend_h, 690, 760), 14, "#2563EB")
    text(draw, (365, 760 - backend_h - 22), "13", 30, "#0F172A", True, "mm")
    text(draw, (625, 760 - frontend_h - 22), "12", 30, "#0F172A", True, "mm")
    text(draw, (365, 805), "Backend", 24, "#64748B", True, "mm")
    text(draw, (625, 805), "Frontend", 24, "#64748B", True, "mm")

    # Donut chart.
    rounded(draw, (850, 505, 1130, 825), 28, "#FFFFFF", "#E2E8F0", 2)
    text(draw, (890, 555), "Umumiy holat", 32, "#0F172A", True)
    text(draw, (890, 592), "25 / 25 test passed", 22, "#64748B")
    draw.ellipse((930, 630, 1050, 750), outline="#DCFCE7", width=28)
    draw.arc((930, 630, 1050, 750), start=-90, end=270, fill="#16A34A", width=28)
    text(draw, (990, 690), "100%", 34, "#0F172A", True, "mm")
    text(draw, (990, 730), "muvaffaqiyat", 16, "#64748B", True, "mm")

    # Checklist.
    rounded(draw, (1170, 505, 1450, 825), 28, "#FFFFFF", "#E2E8F0", 2)
    text(draw, (1210, 555), "Tekshiruvlar", 32, "#0F172A", True)
    items = [("pytest", "13 passed", "#16A34A"), ("Vitest", "12 passed", "#2563EB"), ("Build/Lint", "0 error", "#D97706")]
    y = 620
    for title, subtitle, color in items:
        draw.ellipse((1210, y - 18, 1246, y + 18), fill="#F0FDF4")
        check_icon(draw, (1228, y), color)
        text(draw, (1265, y - 5), title, 24, "#0F172A", True)
        text(draw, (1265, y + 25), subtitle, 19, "#64748B")
        y += 72

    draw.line((125, 865, 1450, 865), fill="#E2E8F0", width=2)
    text(draw, (125, 905), "Xulosa: testlar autentifikatsiya, guruh yaratish, xarajat qo‘shish, balans hisoblash,", 22, "#64748B")
    text(draw, (125, 935), "settlement va frontend state boshqaruvi to‘g‘ri ishlashini tasdiqlaydi.", 22, "#64748B")

    OUT.parent.mkdir(parents=True, exist_ok=True)
    img.save(OUT, quality=95)
    print(OUT)


if __name__ == "__main__":
    main()
