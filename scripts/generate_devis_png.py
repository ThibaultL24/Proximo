#!/usr/bin/env python3
# scripts/generate_devis_png.py

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

OUT = Path(__file__).resolve().parent.parent / "docs" / "DEVIS-Code-Immobilier.png"
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
FONT_B = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"

W = 1080
PAD = 48
BG = "#f4f6fb"
WHITE = "#ffffff"
INK = "#0f172a"
MUTED = "#64748b"
ACCENT = "#1d4ed8"
ACCENT_SOFT = "#dbeafe"
GREEN = "#059669"
GREEN_SOFT = "#d1fae5"
AMBER_SOFT = "#fef3c7"
LINE = "#e2e8f0"


class Canvas:
    def __init__(self):
        self.img = Image.new("RGB", (W, 6000), BG)
        self.draw = ImageDraw.Draw(self.img)
        self.y = PAD
        self.content_w = W - PAD * 2

    def fnt(self, size, bold=False):
        return ImageFont.truetype(FONT_B if bold else FONT, size)

    def wrap(self, text, size, max_w, bold=False):
        f = self.fnt(size, bold)
        words = text.split()
        lines, cur = [], ""
        for w in words:
            t = f"{cur} {w}".strip()
            if self.draw.textlength(t, font=f) <= max_w:
                cur = t
            else:
                if cur:
                    lines.append(cur)
                cur = w
        if cur:
            lines.append(cur)
        return lines or [""]

    def text_block(self, text, size=11, color=MUTED, bold=False, gap=6):
        for line in self.wrap(text, size, self.content_w, bold):
            self.draw.text((PAD, self.y), line, font=self.fnt(size, bold), fill=color)
            self.y += size + gap
        self.y += 4

    def section(self, title):
        self.y += 10
        self.draw.text((PAD, self.y), title, font=self.fnt(16, True), fill=INK)
        self.y += 26
        self.draw.line((PAD, self.y, W - PAD, self.y), fill=ACCENT, width=2)
        self.y += 14

    def card_start(self):
        self.card_top = self.y
        return self.y

    def card_end(self, padding_bottom=20):
        rounded_rect(self.draw, (PAD, self.card_top, W - PAD, self.y + padding_bottom), 14, WHITE, LINE)
        self.y = self.card_top + padding_bottom
        inner = self.card_top + 16
        return inner

    def table(self, headers, rows, col_widths, header=True):
        x0 = PAD + 16
        base_h = 28
        total_w = sum(col_widths)
        cy = self.y

        def cell_lines(cell, w, bold=False):
            usable = w - 16
            return self.wrap(cell, 10, usable, bold) or [""]

        def row_height(cells):
            max_lines = 1
            for cell, w in zip(cells, col_widths):
                max_lines = max(max_lines, len(cell_lines(cell, w)))
            return base_h + (max_lines - 1) * 14

        def draw_row(cells, bold=False, bg=None):
            nonlocal cy
            rh = row_height(cells)
            if bg:
                self.draw.rectangle((x0, cy, x0 + total_w, cy + rh), fill=bg)
            cx = x0
            for i, (cell, w) in enumerate(zip(cells, col_widths)):
                lines = cell_lines(cell, w, bold)
                ty = cy + 8
                for line in lines:
                    align_x = cx + 8
                    if i == len(cells) - 1 and i > 0:
                        tw = self.draw.textlength(line, font=self.fnt(10, bold))
                        align_x = cx + w - tw - 8
                    self.draw.text((align_x, ty), line, font=self.fnt(10, bold), fill=INK)
                    ty += 14
                if i < len(cells) - 1:
                    self.draw.line((cx + w, cy, cx + w, cy + rh), fill=LINE, width=1)
                cx += w
            self.draw.line((x0, cy + rh, x0 + total_w, cy + rh), fill=LINE, width=1)
            cy += rh

        if header:
            draw_row(headers, bold=True, bg=ACCENT_SOFT)
        for row in rows:
            draw_row(row)
        self.y = cy + 8

    def bullet_list(self, items, size=11):
        for item in items:
            self.draw.ellipse((PAD + 20, self.y + 5, PAD + 28, self.y + 13), fill=ACCENT)
            for i, line in enumerate(self.wrap(item, size, self.content_w - 52)):
                x = PAD + 38 if i == 0 else PAD + 38
                self.draw.text((x, self.y), line, font=self.fnt(size), fill=INK)
                self.y += size + 5
            self.y += 4

    def save(self):
        final = self.img.crop((0, 0, W, self.y + PAD))
        OUT.parent.mkdir(parents=True, exist_ok=True)
        final.save(OUT, "PNG", optimize=True)
        print(f"PNG genere : {OUT} ({final.size[0]}x{final.size[1]})")


def rounded_rect(draw, xy, radius, fill, outline=None):
    draw.rounded_rectangle(xy, radius=radius, fill=fill, outline=outline, width=1 if outline else 0)


def generate():
    c = Canvas()
    d = c.draw

    # Header
    rounded_rect(d, (PAD, c.y, W - PAD, c.y + 120), 16, ACCENT)
    d.text((PAD + 24, c.y + 16), "DEVIS", font=c.fnt(12), fill="#bfdbfe")
    d.text((PAD + 24, c.y + 34), "Code Immobilier", font=c.fnt(30, True), fill=WHITE)
    d.text(
        (PAD + 24, c.y + 76),
        "Gazette locale, annuaire commercants & reseau d'apporteurs d'affaires",
        font=c.fnt(12),
        fill="#dbeafe",
    )
    c.y += 136

    meta = [("Prestataire", "[Votre nom]"), ("Client", "[Nom client]"), ("Ref.", "DEV-CI-2025-001")]
    meta2 = [("Date", "17 juin 2025"), ("Validite", "30 jours"), ("Duree", "10-12 semaines")]
    bw = (c.content_w - 16) // 3
    for row_i, row in enumerate([meta, meta2]):
        for i, (k, v) in enumerate(row):
            x = PAD + i * (bw + 8)
            y = c.y + row_i * 58
            rounded_rect(d, (x, y, x + bw, y + 50), 10, WHITE, LINE)
            d.text((x + 12, y + 8), k, font=c.fnt(10), fill=MUTED)
            d.text((x + 12, y + 26), v, font=c.fnt(11, True), fill=INK)
    c.y += 128

    # Objet
    c.section("1. Objet du devis")
    c.text_block(
        "Conception, developpement et mise en ligne d'une application web modulaire connectant "
        "l'agence immobiliere, les commercants locaux et un reseau d'apporteurs d'affaires. "
        "L'outil combine une gazette locale numerique (visibilite des commercants, articles, QR codes) "
        "et un systeme structure de recommandation immobiliere (depot de leads, suivi, commissions)."
    )

    # Perimetre
    c.section("2. Perimetre fonctionnel")
    c.table(
        ["Module", "Description"],
        [
            ("Front office public", "Accueil, annuaire, fiches commercants, gazette, pages QR"),
            ("Espace commercant", "Connexion, profil, depot de lead, suivi des recommandations"),
            ("Back-office immobilier", "Gestion commercants, CMS, reception & qualification leads"),
            ("Donnees metier", "Users, secteurs geo, leads, commissions, QR codes"),
        ],
        [200, c.content_w - 232],
    )

    # Stack
    c.section("3. Stack technique (couts maitrises)")
    c.text_block(
        "Architecture open source auto-hebergee pour eviter les abonnements BaaS couteux (Supabase, etc.). "
        "Frontend deploye sur Vercel, backend Rails sur Render, domaine .fr chez IONOS."
    )
    c.table(
        ["Composant", "Technologie"],
        [
            ("Frontend", "React 18 + Vite + Tailwind CSS"),
            ("Backend", "Ruby on Rails 7+ (mode API)"),
            ("Base de donnees", "PostgreSQL"),
            ("Auth", "Devise + JWT (roles admin / commercant)"),
            ("Paiements", "Stripe + Stripe Connect"),
            ("Fichiers", "Active Storage + Cloudflare R2"),
            ("QR codes", "Gem rqrcode"),
            ("Domaine", "IONOS (.fr) - Vercel ne vend pas les .fr"),
            ("Hebergement", "Vercel (front) + Render ou Fly.io (API)"),
        ],
        [170, c.content_w - 202],
    )

    # Marche
    c.section("4. Reference tarifaire du marche (France 2025)")
    c.text_block(
        "Fourchettes observees pour une application web sur mesure (freelance confirme, TJM 450-600 EUR/j). "
        "Application complete comparable : 12 000 - 18 000 EUR."
    )
    c.table(
        ["Prestation", "Fourchette marche"],
        [
            ("Landing + annuaire geolocalise", "3 500 - 5 000 EUR"),
            ("Fiches commercants + QR", "1 500 - 2 500 EUR"),
            ("CMS / gazette locale", "2 000 - 3 500 EUR"),
            ("Espace commercant + leads", "2 500 - 4 000 EUR"),
            ("Back-office + suivi", "2 500 - 4 000 EUR"),
            ("Stripe Connect (commissions)", "1 500 - 2 500 EUR"),
            ("MVP fonctionnel (Ph. 1-4)", "8 000 - 12 000 EUR"),
        ],
        [320, c.content_w - 352],
    )

    # Offre
    c.section("5. Mon offre - 3 000 EUR TTC")
    box_top = c.y
    friend_text = (
        "Tarif accordé en raison du lien personnel (ami de mon pere). Ne reflete pas la valeur "
        "marche et ne saurait servir de reference pour d'autres clients. Correspond a environ "
        "45-55% du tarif freelance habituel (~273 EUR/j vs ~500 EUR/j marche)."
    )
    friend_lines = c.wrap(friend_text, 11, c.content_w - 40)
    box_h = 24 + len(friend_lines) * 16 + 16
    rounded_rect(d, (PAD, box_top, W - PAD, box_top + box_h), 14, GREEN_SOFT, GREEN_SOFT)
    d.text((PAD + 20, box_top + 12), "Prix d'ami", font=c.fnt(13, True), fill=GREEN)
    ty = box_top + 34
    for line in friend_lines:
        d.text((PAD + 20, ty), line, font=c.fnt(11), fill=INK)
        ty += 16
    c.y = box_top + box_h + 12

    price_top = c.y
    rounded_rect(d, (PAD, price_top, W - PAD, price_top + 78), 14, ACCENT_SOFT)
    d.text((PAD + 20, price_top + 12), "Prix propose", font=c.fnt(11), fill=MUTED)
    d.text((PAD + 20, price_top + 30), "3 000 EUR TTC", font=c.fnt(26, True), fill=ACCENT)
    d.text((PAD + 300, price_top + 14), "Valeur marche estimee", font=c.fnt(10), fill=MUTED)
    d.text((PAD + 300, price_top + 32), "5 900 EUR", font=c.fnt(18, True), fill=INK)
    d.text((PAD + 520, price_top + 14), "Economie client", font=c.fnt(10), fill=MUTED)
    d.text((PAD + 520, price_top + 32), "~2 900 EUR", font=c.fnt(18, True), fill=GREEN)
    c.y = price_top + 92

    c.text_block("5.1 Prestations incluses dans le forfait", size=12, color=INK, bold=True)
    c.table(
        ["#", "Lot", "Detail", "Valeur marche"],
        [
            ("1", "Setup", "Rails API, PostgreSQL, structure projet", "400 EUR"),
            ("2", "Front office", "Accueil, annuaire, filtres secteur, fiches", "1 200 EUR"),
            ("3", "QR codes", "Generation auto + pages dediees par commercant", "300 EUR"),
            ("4", "Gazette / CMS", "Articles, categories, gestion contenus", "800 EUR"),
            ("5", "Espace commercant", "Auth, profil, formulaire lead, suivi", "1 000 EUR"),
            ("6", "Back-office", "Gestion commercants, CMS, qualification leads", "1 200 EUR"),
            ("7", "Stripe", "Setup compte, webhooks, modele commissions", "400 EUR"),
            ("8", "Production", "Deploy Vercel + Render, config domaine IONOS", "300 EUR"),
            ("9", "Support", "1 mois corrections & ajustements mineurs", "300 EUR"),
            ("", "TOTAL", "Valeur marche / Prix ami", "5 900 / 3 000 EUR"),
        ],
        [28, 90, 420, 100],
    )

    c.text_block("5.2 Hors perimetre (options)", size=12, color=INK, bold=True)
    c.table(
        ["Option", "Tarif indicatif"],
        [
            ("Stripe Connect - virements actifs aux apporteurs", "800 - 1 200 EUR"),
            ("Carte interactive Mapbox", "400 - 600 EUR"),
            ("Notifications email automatiques", "300 - 500 EUR"),
            ("Design graphique sur mesure (Figma)", "800 - 1 500 EUR"),
            ("Maintenance (2h/mois)", "80 - 120 EUR/mois"),
            ("Evolutions fonctionnelles", "35 - 45 EUR/h"),
        ],
        [420, c.content_w - 452],
    )

    # Frais recurrents
    c.section("6. Frais recurrents a la charge du client")
    c.text_block("Non inclus dans le devis. Factures directement par les prestataires.", size=10)

    c.text_block("6.1 Domaine - IONOS", size=12, color=INK, bold=True)
    c.table(
        ["Poste", "An 1", "An suiv.", "Notes"],
        [
            ("Domaine .fr", "1 EUR HT", "10 EUR HT/an", "Promo an 1, ~12 EUR TTC/an ensuite"),
        ],
        [120, 80, 90, c.content_w - 322],
    )

    c.text_block("6.2 Frontend - Vercel", size=12, color=INK, bold=True)
    c.table(
        ["Plan", "Cout", "Usage"],
        [
            ("Hobby", "0 EUR/mois", "Suffisant MVP local"),
            ("Pro", "~18 EUR/mois", "Trafic eleve ou equipe"),
        ],
        [100, 100, c.content_w - 232],
    )

    c.text_block("6.3 Backend - Render / Fly.io", size=12, color=INK, bold=True)
    c.table(
        ["Option", "Cout", "Notes"],
        [
            ("Render Free", "0 EUR/mois", "Sleep apres inactivite"),
            ("Render Starter", "~7 EUR/mois", "Recommande production"),
            ("PostgreSQL", "0-7 EUR/mois", "Free tier ou payant"),
        ],
        [130, 100, c.content_w - 262],
    )

    c.text_block("6.4 Stripe", size=12, color=INK, bold=True)
    c.table(
        ["Element", "Cout"],
        [
            ("Compte Stripe", "Gratuit"),
            ("Carte EU", "1,5% + 0,25 EUR / transaction"),
            ("Stripe Connect", "0,25% + 0,10 EUR / virement"),
        ],
        [280, c.content_w - 312],
    )

    rounded_rect(d, (PAD, c.y, W - PAD, c.y + 52), 12, AMBER_SOFT)
    d.text((PAD + 16, c.y + 10), "Budget mensuel estime au lancement : 0 - 25 EUR/mois (+ domaine ~12 EUR/an)", font=c.fnt(11, True), fill=INK)
    d.text((PAD + 16, c.y + 28), "Hors commissions Stripe (variables selon volume de transactions)", font=c.fnt(10), fill=MUTED)
    c.y += 68

    # Planning
    c.section("7. Planning indicatif")
    c.table(
        ["Phase", "Duree", "Livrable"],
        [
            ("Ph. 1 - Setup + annuaire", "Sem. 1-3", "Site public avec annuaire"),
            ("Ph. 2 - Fiches + QR", "Sem. 3-4", "Fiches commercants operationnelles"),
            ("Ph. 3 - Gazette", "Sem. 5-6", "CMS et premiers articles"),
            ("Ph. 4 - Espace commercant", "Sem. 7-9", "Portail partenaire + leads"),
            ("Ph. 5 - Back-office + Stripe", "Sem. 10-12", "Dashboard admin + commissions"),
            ("Recette", "Sem. 12", "Mise en production"),
        ],
        [200, 90, c.content_w - 322],
    )

    # Conditions
    c.section("8. Conditions financieres")
    c.table(
        ["Echeance", "Montant", "Condition"],
        [
            ("Acompte 40%", "1 200 EUR", "A la signature"),
            ("Milieu 30%", "900 EUR", "Validation Phase 3 (gazette)"),
            ("Solde 30%", "900 EUR", "Mise en production + recette"),
            ("TOTAL", "3 000 EUR TTC", ""),
        ],
        [130, 110, c.content_w - 272],
    )
    c.bullet_list([
        "Paiement par virement sous 15 jours.",
        "TVA : [a preciser selon statut prestataire].",
        "Hors perimetre : facturation 35-45 EUR/h apres accord ecrit.",
    ])

    c.section("9. Conditions generales")
    c.bullet_list([
        "Propriete du code transferée au client apres paiement integral.",
        "Contenus (textes, logos, photos) fournis par le client.",
        "Recette : 15 jours pour bugs bloquants inclus dans le forfait.",
        "Support : 1 mois post-lancement pour corrections mineures.",
        "Confidentialite des echanges garantie.",
    ])

    c.section("10. Sources marche (verifiables)")
    c.text_block("References utilisees pour les estimations - consultables en ligne :", size=10)
    c.bullet_list([
        "Silkhom Barometre TJM 2025, Indy, Freelance Solution, Meaflow (TJM dev 450-650 EUR/j)",
        "Aquilapp, EID Lab, Agence Scroll (MVP 5 000 - 18 000 EUR)",
        "vercel.com/pricing, ionos.fr, render.com/pricing, stripe.com/fr/pricing",
    ], size=10)

    # Signatures
    c.y += 12
    d.text((PAD, c.y), "Bon pour accord", font=c.fnt(14, True), fill=INK)
    c.y += 36
    sw = (c.content_w - 16) // 2
    for i, label in enumerate(["Le prestataire", "Le client"]):
        x = PAD + i * (sw + 16)
        rounded_rect(d, (x, c.y, x + sw, c.y + 100), 12, WHITE, LINE)
        d.text((x + 16, c.y + 12), label, font=c.fnt(11, True), fill=INK)
        d.text((x + 16, c.y + 40), "Nom : _________________________", font=c.fnt(10), fill=MUTED)
        d.text((x + 16, c.y + 58), "Date : _________________________", font=c.fnt(10), fill=MUTED)
        d.text((x + 16, c.y + 76), "Signature :", font=c.fnt(10), fill=MUTED)
    c.y += 116

    c.save()


if __name__ == "__main__":
    generate()
