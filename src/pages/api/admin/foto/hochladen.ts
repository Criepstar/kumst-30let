import type { APIRoute } from 'astro';
import { addPhoto } from '../../../../lib/gallery';
import { escapeHtml, htmlMessage, sameOrigin } from '../../../../lib/http';

const MAX_BYTES = 30 * 1024 * 1024;
const MAX_FILES = 20;

export const POST: APIRoute = async ({ request }) => {
  if (!sameOrigin(request)) {
    return htmlMessage('Napačen izvor zahtevka. / Ungültige Herkunft.', 'error', 403);
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return htmlMessage('Prenos ni uspel. / Upload fehlgeschlagen.', 'error', 400);
  }

  const uploaded = form
    .getAll('fotos')
    .filter((entry): entry is File => typeof entry === 'object' && entry !== null && 'arrayBuffer' in entry);

  if (uploaded.length === 0) {
    return htmlMessage('Ni izbrane datoteke. / Keine Datei ausgewählt.', 'error', 400);
  }
  if (uploaded.length > MAX_FILES) {
    return htmlMessage(`Največ ${MAX_FILES} datotek naenkrat. / Maximal ${MAX_FILES} Dateien.`, 'error', 400);
  }

  const problems: string[] = [];
  let added = 0;

  for (const file of uploaded) {
    if (file.size === 0) {
      problems.push(`${escapeHtml(file.name)}: prazna datoteka / leere Datei`);
      continue;
    }
    if (file.size > MAX_BYTES) {
      problems.push(`${escapeHtml(file.name)}: prevelika (max. 30 MB) / zu groß`);
      continue;
    }
    const buffer = new Uint8Array(await file.arrayBuffer());
    const result = await addPhoto({ buffer, type: file.type || undefined, name: file.name });
    if ('error' in result) {
      problems.push(`${escapeHtml(file.name)}: ${escapeHtml(result.error)}`);
    } else {
      added += 1;
    }
  }

  const trigger = added > 0 ? 'galerie-geaendert' : undefined;

  if (added === 0) {
    const detail = problems.length ? ` (${problems.join('; ')})` : '';
    return htmlMessage(`Nobenega fotografija ni bila dodana.${detail}`, 'error', 400);
  }

  const summary =
    `${added} ${added === 1 ? 'fotografija dodana' : added === 2 ? 'fotografiji dodani' : 'fotografije dodane'}` +
    ` / ${added} ${added === 1 ? 'Foto hinzugefügt' : 'Fotos hinzugefügt'}` +
    (problems.length ? `<br><span class="text-[0.75rem]">${problems.join('<br>')}</span>` : '');

  const response = htmlMessage(summary, problems.length ? 'error' : 'ok');
  if (trigger) response.headers.set('HX-Trigger', trigger);
  return response;
};
