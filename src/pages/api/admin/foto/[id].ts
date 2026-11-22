import type { APIRoute } from 'astro';
import { deletePhoto, getPhoto, movePhoto, updatePhoto } from '../../../../lib/gallery';
import { htmlMessage, noContent, sameOrigin } from '../../../../lib/http';

const OK = {
  speichern: 'Shranjeno / Gespeichert',
  veroeffentlichen: 'Spremenjeno / Sichtbarkeit geändert',
  'nach-oben': 'Premaknjeno / Verschoben',
  'nach-unten': 'Premaknjeno / Verschoben',
  loeschen: 'Izbrisano / Gelöscht',
} as const;

export const POST: APIRoute = async ({ request, params }) => {
  if (!sameOrigin(request)) {
    return htmlMessage('Napačen izvor zahtevka. / Ungültige Herkunft.', 'error', 403);
  }

  const id = params.id ?? '';
  const photo = await getPhoto(id);
  if (!photo) {
    return htmlMessage('Fotografija ne obstaja. / Foto nicht gefunden.', 'error', 404);
  }

  const form = await request.formData();
  const aktion = String(form.get('aktion') ?? '');

  switch (aktion) {
    case 'speichern': {
      await updatePhoto(id, {
        captionSl: String(form.get('captionSl') ?? ''),
        captionDe: String(form.get('captionDe') ?? ''),
      });
      return htmlMessage(OK.speichern, 'ok');
    }
    case 'veroeffentlichen': {
      await updatePhoto(id, { published: !photo.published });
      return noContent('galerie-geaendert');
    }
    case 'nach-oben': {
      await movePhoto(id, -1);
      return noContent('galerie-geaendert');
    }
    case 'nach-unten': {
      await movePhoto(id, 1);
      return noContent('galerie-geaendert');
    }
    case 'loeschen': {
      await deletePhoto(id);
      return noContent('galerie-geaendert');
    }
    default:
      return htmlMessage('Neznano dejanje. / Unbekannte Aktion.', 'error', 400);
  }
};
