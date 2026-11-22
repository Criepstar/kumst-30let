# KUMST – 30 let / 30 Jahre

Website zur Jubiläumsbroschüre des **Slovensko prosvetno društvo Trta / Slowenischer
Kulturverein Trta**: Bildergalerie mit Lightbox, Broschüren-Download und ein kleiner
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
    index.astro                Startseite: Hero, Geschichte, Zeitleiste, Galerie-Teaser, Broschüre
    galerija/index.astro       Bildergalerie (Masonry)
    galerija/foto/[id].astro   Lightbox-Fragment (HTMX) bzw. eigene Seite ohne JS
    kolofon.astro              Impressum / Kolofon
    admin/index.astro          Redaktion: Upload, Bildtexte, Reihenfolge, Sichtbarkeit
    admin/prijava.astro        Anmeldung
    admin/mreza.astro          HTMX-Partial: Foto-Grid neu rendern
    media/[file].ts            liefert die WebP-Dateien aus data/uploads
    api/admin/…                Login/Logout, Upload, Aktionen pro Foto
  components/                  Header, Footer, PhotoGrid, Lightbox, Timeline, Admin-Karten
  layouts/Base.astro           Head/OG, HTMX-Init, Lightbox-Tastatursteuerung
  lib/
    site.ts                    Adressen, BASE_PATH-Helfer u(), Kontaktdaten
    content.ts                 alle zweisprachigen Texte (SL zuerst, dann DE)
    gallery.ts                 JSON-Store data/gallery.json + Bildverarbeitung (sharp)
    auth.ts                    HMAC-Cookie, Rate-Limit
  styles/global.css            Design-Tokens (@theme), Papierkorn, Ziegelmuster, Komponenten
public/
  brand/                       Illustration, Cover, OG-Bild, Fördergeber-Logos
  download/                    die Broschüre als PDF
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
- **Löschen**: entfernt Eintrag und beide WebP-Dateien.
- Alle Aktionen laufen über HTMX; die Kopfzeile zeigt live die Anzahl
  veröffentlichter Fotos.

Sicherheit: signiertes HttpOnly-Cookie (12 h), Same-Origin-Prüfung auf allen
schreibenden Endpunkten, Rate-Limit von 6 Login-Versuchen pro 15 Minuten,
`/admin/*` und `/api/admin/*` sind per Middleware geschützt und werden nicht indexiert.

## Daten & Backup

Alles Inhaltliche liegt in `data/`:

- `data/gallery.json` – Reihenfolge, Bildtexte, Sichtbarkeit
- `data/uploads/*.webp` – die Bilder (`<id>.webp` und `<id>-t.webp`)
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

## Design

Aus dem PDF extrahiert und als Tokens in `src/styles/global.css` hinterlegt:

| Rolle              | Wert      |
| ------------------ | --------- |
| Papier / Creme     | `#F1E7D3` |
| Weinrot            | `#7D1C27` |
| Grün               | `#639C69` |
| Tintengrün (Text)  | `#27311A` |
| Magenta (Akzent)   | `#EC008C` |
| Altrosa            | `#CCA8A0` |
| Slate              | `#514F66` |

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
