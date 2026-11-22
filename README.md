# KUMST – 30 let / 30 Jahre

Website zur Jubiläumsbroschüre des **Slovensko prosvetno društvo Trta / Slowenischer
Kulturverein Trta** – die Broschüre ist das Hauptmedium, die Website ist ihre
erweiterte Bildergalerie.

Die Seite ist ein **One-Pager** mit drei Teilen: Hero → Galerie → Kolofon/Impressum.
Die Galerie liegt direkt auf der Startseite (kein Navigationsmenü), die Broschüre
lässt sich an mehreren Stellen als PDF herunterladen. Dazu ein kleiner
Redaktionsbereich für Fotos.

Gebaut mit **Astro** (Node-SSR), **HTMX** (Lightbox, Upload, Galerie-Verwaltung) und
**Tailwind CSS 4**. Gestaltung, Farben, Schriften und Grafiken stammen aus dem
Druck-PDF der Broschüre.

- Ziel-URL (QR-Code in der Broschüre): `https://www.trta.at/30-let-kumst`
- Inhaltssprache: zweisprachig slowenisch → deutsch, ohne Sprachumschalter

---

## Schnellstart

```bash
npm install
cp .env.example .env      # Passwort, Adresse, Basis-Pfad eintragen
npm run seed              # 15 Archivfotos aus der PDF als WebP in data/ anlegen
npm run dev               # http://localhost:4321/30-let-kumst
```

Produktion:

```bash
npm run build
npm start                 # node ./dist/server/entry.mjs
```

`astro check` (Typen/Template-Prüfung) läuft über `npm run check`.

## Konfiguration (`.env`)

| Variable         | Bedeutung                                                              |
| ---------------- | ---------------------------------------------------------------------- |
| `ADMIN_PASSWORD` | Passwort für `/admin`. **Vor dem Livegang ändern.**                     |
| `ADMIN_SECRET`   | Optional: festes Secret für das Session-Cookie (sonst `data/.session-secret`, wird automatisch erzeugt) |
| `DATA_DIR`       | Ablage für Galerie + Uploads (Standard `./data`)                       |
| `SITE_URL`       | Vollständige Adresse inkl. Unterverzeichnis (canonical, OG-Tags)        |
| `BASE_PATH`      | Unterverzeichnis, unter dem die Seite läuft (`/30-let-kumst` oder `/`)  |
| `PORT`           | Port des Node-Servers (Standard 4321)                                   |

`BASE_PATH` und `SITE_URL` werden beim **Build** eingebacken – nach einer Änderung
neu bauen. Für lokale Entwicklung ohne Unterverzeichnis:

```bash
BASE_PATH=/ SITE_URL=http://localhost:4321 npm run dev
```

Ohne gesetztes `ADMIN_PASSWORD` gilt das Notfall-Passwort `kumst30`; die
Admin-Seite weist darauf hin.

## Aufbau

```
src/
  pages/
    index.astro                One-Pager: Hero, Galerie (Masonry, alle Fotos), Broschüren-Download
    galerija/foto/[id].astro   Lightbox-Fragment (HTMX) bzw. eigene Seite ohne JS
    galerija/index.astro       301 → /#galerija
    kolofon.astro              301 → /#kolofon
    impressum.astro            301 → /#kolofon
    admin/index.astro          Redaktion: Upload, Bildtexte, Reihenfolge, Sichtbarkeit
    admin/prijava.astro        Anmeldung
    admin/mreza.astro          HTMX-Partial: Foto-Grid neu rendern
    media/[file].ts            liefert WebP (Seite) und JPEG (neuer Tab) aus data/uploads
    api/admin/…                Login/Logout, Upload, Aktionen pro Foto
  components/                  Footer (= Kolofon + Fußzeile), PhotoGrid, Lightbox, Admin-Karten
  layouts/Base.astro           Head/OG, HTMX-Init, Lightbox-Tastatursteuerung
  lib/
    site.ts                    Adressen, BASE_PATH-Helfer u(), mediaUrl(), photoFileUrl()
    content.ts                 alle zweisprachigen Texte (SL zuerst, dann DE)
    gallery.ts                 JSON-Store data/gallery.json + Bildverarbeitung (sharp)
    auth.ts                    HMAC-Cookie, Rate-Limit
  styles/global.css            Design-Tokens (@theme), Papierkorn, Ziegelmuster, Komponenten
public/
  brand/                       Titelbild (kumst-hero.svg = Cover-Illustration der
                               Broschüre: Ziegeltitel, Haus, KUMST, Claim – beige auf
                               transparent), OG-Bild, Fördergeber-Logos
  download/                    die Broschüre als PDF
  favicon.svg                  Ziegel-Kürzel K in Rot/Beige
design/                        Originalgrafiken, die nicht ausgeliefert werden
                               (kumst-illustration.svg: ältere Illustration ohne Titel)
data/                          Laufzeitdaten (nicht im Git): gallery.json, uploads/, .session-secret
seed/photos/                   Archivfotos aus der PDF (Quelle für npm run seed)
scripts/seed.mjs               befüllt data/ mit den Seed-Fotos
```

## Redaktionsbereich

`/admin` (Anmeldung über `/admin/prijava`):

- **Hochladen**: mehrere Dateien gleichzeitig oder per Drag & Drop (max. 20 Dateien,
  30 MB pro Bild). JPG, PNG, WebP, HEIC, TIFF werden automatisch gedreht, auf 1800 px
  verkleinert und als WebP gespeichert (Thumbnail 700 px).
- **Bildtexte**: slowenisch und deutsch, erscheinen in der Lightbox und als Hover-Text.
- **Reihenfolge**: ↑ / ↓ verschiebt ein Foto; die Reihenfolge im Grid ist die
  Reihenfolge in der Galerie. Neue Uploads hängen hinten an.
- **Sichtbarkeit**: „Skrij / Ausblenden“ nimmt ein Foto aus der öffentlichen Galerie,
  ohne es zu löschen.
- **Löschen**: entfernt Eintrag, beide WebP-Dateien und das erzeugte JPEG.
- Alle Aktionen laufen über HTMX; die Kopfzeile zeigt live die Anzahl
  veröffentlichter Fotos.

Sicherheit: signiertes HttpOnly-Cookie (12 h), Same-Origin-Prüfung auf allen
schreibenden Endpunkten, Rate-Limit von 6 Login-Versuchen pro 15 Minuten,
`/admin/*` und `/api/admin/*` sind per Middleware geschützt und werden nicht indexiert.

## Daten & Backup

Alles Inhaltliche liegt in `data/`:

- `data/gallery.json` – Reihenfolge, Bildtexte, Sichtbarkeit
- `data/uploads/*.webp` – die Bilder (`<id>.webp` und `<id>-t.webp`)
- `data/uploads/*.jpg` – JPEG-Fassung für „in neuem Tab öffnen“, entsteht bei Bedarf
  aus dem WebP und darf jederzeit gelöscht werden (wird neu erzeugt)
- `data/.session-secret` – Signatur-Schlüssel der Anmeldung

Für ein Backup genügt es, dieses Verzeichnis zu kopieren (`DATA_DIR` zeigt in
Produktion z. B. auf `/var/lib/kumst/data`).

## Deployment (Node-SSR)

Die App ist ein normaler Node-Server (Astro-Adapter `@astrojs/node`, `standalone`).
Alles außerhalb von `/30-let-kumst` muss der vorgelagerte Webserver übernehmen
(oder die App auf einer eigenen Domain laufen – dann `BASE_PATH=/`).

### Variante 1: systemd + Reverse Proxy

```bash
# auf dem Server
git clone … /srv/kumst && cd /srv/kumst
npm ci
cp .env.example .env      # Passwort + Adressen setzen
npm run build
```

`/etc/systemd/system/kumst.service`:

```ini
[Unit]
Description=KUMST 30 let – Website
After=network.target

[Service]
Type=simple
WorkingDirectory=/srv/kumst
Environment=NODE_ENV=production
Environment=PORT=4321
Environment=HOST=127.0.0.1
Environment=DATA_DIR=/var/lib/kumst/data
ExecStart=/usr/bin/node ./dist/server/entry.mjs
Restart=always
RestartSec=3
User=www-data
# Uploads brauchen Schreibrechte auf DATA_DIR
ReadWritePaths=/var/lib/kumst

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable --now kumst
```

Caddy-Beispiel (`/etc/caddy/Caddyfile`):

```
www.trta.at {
    handle /30-let-kumst/* {
        reverse_proxy 127.0.0.1:4321
    }
    # bestehende Seite von www.trta.at
    root * /var/www/trta
    file_server
}
```

nginx-Beispiel:

```nginx
location /30-let-kumst/ {
    proxy_pass http://127.0.0.1:4321;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    client_max_body_size 40m;   # Uploads (30 MB pro Datei)
}
```

### Variante 2: Docker

Das Image basiert auf `node:24-alpine` (astro@7 verlangt mindestens Node 22.23.4) und
bringt einen `HEALTHCHECK` auf `/<BASE_PATH>/robots.txt` mit. Build-Args sind
`BASE_PATH` und `SITE_URL`; beide werden eingebacken.

```bash
docker build -t kumst-30 .
docker run -d --name kumst-30 -p 127.0.0.1:4321:4321 \
  -e ADMIN_PASSWORD='…' \
  -e BASE_PATH=/30-let-kumst \
  -e SITE_URL=https://www.trta.at/30-let-kumst \
  -e DATA_DIR=/data \
  -v kumst-data:/data \
  kumst-30
```

Das Volume `/data` enthält Galerie, Uploads und das Session-Secret – ohne Volume
sind die Fotos beim nächsten Container-Start weg. Die Archivfotos aus der PDF
liegen im Image bereit und werden einmalig nachgeladen:

```bash
docker exec -it kumst-30 node scripts/seed.mjs
```

## Galerie & Bilder

- Die Startseite zeigt **alle veröffentlichten Fotos** in einem Masonry-Raster
  (CSS-Spalten, damit die Archivformate erhalten bleiben).
- Ein Klick öffnet die Lightbox (HTMX-Fragment, mit `←`/`→`/Esc und Deep-Link auf
  `/galerija/foto/<id>`); ohne JavaScript führt derselbe Link auf eine eigene Seite.
- Ein Foto ist intern als **WebP** gespeichert (1800 px, Thumbnail 700 px). Die
  Lightbox verlinkt es zusätzlich als `/media/<id>.jpg`: Wer das Bild in einem neuen
  Tab öffnet oder per Rechtsklick speichert, bekommt ein gewohntes JPEG. Die
  JPEG-Fassung wird beim ersten Aufruf serverseitig mit `sharp` erzeugt und in
  `data/uploads` zwischengespeichert.

## Design

Aus dem PDF extrahiert und als Tokens in `src/styles/global.css` hinterlegt:

| Rolle                        | Wert      |
| ---------------------------- | --------- |
| Beige (Papier)               | `#F5ECDA` |
| Rot (Flächen, Primäres)      | `#821E22` |
| Hellgrün (Deko, Marker)      | `#659A60` |
| Dunkelgrün (Text, Tiefe)     | `#30351C` |
| Violett (Links, Fokus)       | `#564F66` |

Das sind die **einzigen** fünf Farben; alle Zwischentöne in `global.css` sind
Mischungen daraus (`cream-deep`, `wine-deep`, `sage-deep`, `rose`):

| Abgeleitet  | Wert      | Verwendung                                   |
| ----------- | --------- | -------------------------------------------- |
| `cream-deep` | `#D9D2BF` | Beige + Dunkelgrün 14 % – Bänder, Kartenrahmen |
| `wine-deep`  | `#702321` | Rot + Dunkelgrün 22 % – Lightbox, Hover        |
| `sage-deep`  | `#4A683E` | Hellgrün + Dunkelgrün 50 % – Labels auf Beige  |
| `rose`       | `#D7B6AA` | Beige + Rot 26 % – deutsche Zeilen auf Rot     |

`sage-deep` und `rose` sind Kontrast-Ableitungen: Hellgrün allein erreicht auf
Beige nur 2,8 : 1, deshalb tragen Labels das dunklere Grün (5,4 : 1).

Schriften: im Druck **Circe** (kommerziell) und **Poppins Black**. Ersetzt durch
**Mulish Variable** (Lauftext) und **Poppins 900** (Auszeichnung), beide lokal über
`@fontsource` eingebunden – keine externen Requests, DSGVO-freundlich.

Weitere Zutaten: dezentes Papierkorn als Overlay, Ziegelmuster (`bricks`) als
Referenz auf den Schriftzug der Broschüre, Offset-Kontur für Überschriften.

## Nach dem Livegang

- [ ] `ADMIN_PASSWORD` in `.env` auf ein eigenes Passwort setzen
- [ ] `BASE_PATH`/`SITE_URL` prüfen, `npm run build` erneut laufen lassen
- [ ] `data/` in die Sicherung aufnehmen
- [ ] QR-Code der Broschüre testen: `https://www.trta.at/30-let-kumst`
