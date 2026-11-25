import {
  getCategoryLabel,
  getEducationLevelLabel,
  type ClassicalFragment,
  type EducationLevel,
  type FocusCategory,
} from "@/types/lumen";

export function formatFragmentForClipboard(params: {
  fragment: ClassicalFragment;
  query: string;
  category: FocusCategory;
  educationLevel: EducationLevel;
}): string {
  const { fragment, query, category, educationLevel } = params;
  const paraphraseNote = fragment.es_parafrasis
    ? "\n[Nota de transparencia: traducción fiel / paráfrasis rigurosa del pasaje original]"
    : "";

  const guideLines = fragment.guia_didactica
    .map((item, idx) => `${idx + 1}. ${item}`)
    .join("\n");

  return [
    `LUMEN CLÁSICO — Ficha pedagógica`,
    `Tema: ${query} | Enfoque: ${getCategoryLabel(category)} | Nivel: ${getEducationLevelLabel(educationLevel)}`,
    ``,
    `«${fragment.fragmento.replace(/^«|»$/g, "").trim()}»`,
    `— ${fragment.autor}, ${fragment.obra} (${fragment.epoca}, ${fragment.referencia})${paraphraseNote}`,
    ``,
    `POR QUÉ ESTE TEXTO:`,
    fragment.justificacion_seleccion,
    ``,
    `CÓMO SE RELACIONA CON «${query.toUpperCase()}»:`,
    fragment.explicacion_relacion,
    ``,
    `EXPLICACIÓN ADAPTADA AL NIVEL:`,
    fragment.explicacion_nivel,
    ``,
    `GUÍA DIDÁCTICA PARA EL AULA:`,
    guideLines,
  ].join("\n");
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function printPedagogicalSheet(params: {
  fragment: ClassicalFragment;
  query: string;
  category: FocusCategory;
  educationLevel: EducationLevel;
}): void {
  const { fragment, query, category, educationLevel } = params;
  const printWindow = window.open("", "_blank", "width=900,height=760");
  if (!printWindow) {
    window.print();
    return;
  }

  const cleanQuote = fragment.fragmento.replace(/^«|»$/g, "").trim();
  const guideHtml = fragment.guia_didactica
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("");

  const paraphraseBadge = fragment.es_parafrasis
    ? `<p class="note">Nota filológica: traducción fiel adaptada del pasaje clásico original.</p>`
    : "";

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <title>Ficha pedagógica — ${escapeHtml(fragment.autor)} | Lumen Clásico</title>
  <style>
    @page { margin: 18mm; }
    body {
      font-family: Georgia, "Times New Roman", serif;
      color: #17191C;
      background: #FFFFFF;
      line-height: 1.6;
      max-width: 740px;
      margin: 0 auto;
      padding: 24px;
    }
    .header {
      border-bottom: 2px solid #253F73;
      padding-bottom: 12px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      gap: 16px;
    }
    .brand {
      font-size: 20px;
      font-weight: 700;
      color: #253F73;
      letter-spacing: 0.02em;
    }
    .subtitle {
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #947132;
      font-weight: 600;
    }
    .meta-bar {
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 12px;
      color: #373B42;
      background: #FAF7F0;
      border: 1px solid #E8E0D0;
      border-radius: 8px;
      padding: 10px 14px;
      margin-bottom: 20px;
    }
    blockquote {
      margin: 0 0 12px 0;
      padding: 18px 22px;
      background: #FAF7F0;
      border-left: 4px solid #253F73;
      font-size: 18px;
      font-style: italic;
    }
    .citation {
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 13px;
      color: #373B42;
      margin-bottom: 6px;
    }
    .note {
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 11px;
      color: #5E626A;
      font-style: italic;
      margin: 0 0 18px 0;
    }
    .section {
      margin-top: 18px;
    }
    .section h2 {
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 11.5px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #253F73;
      margin: 0 0 6px 0;
    }
    .section p, .section li {
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 13.5px;
      margin: 0 0 8px 0;
      color: #17191C;
    }
    .bridge {
      background: #FBF7EC;
      border: 1px solid #F7EEDB;
      border-left: 4px solid #947132;
      border-radius: 8px;
      padding: 14px 16px;
    }
    .bridge h2 { color: #7F5F26; }
    ol { padding-left: 20px; margin: 6px 0 0 0; }
    .footer {
      margin-top: 28px;
      padding-top: 10px;
      border-top: 1px solid #E8E0D0;
      font-family: system-ui, -apple-system, sans-serif;
      font-size: 11px;
      color: #858077;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">Lumen Clásico</div>
      <div class="subtitle">Ficha pedagógica de lectura clásica</div>
    </div>
    <div class="subtitle">${escapeHtml(getEducationLevelLabel(educationLevel))}</div>
  </div>

  <div class="meta-bar">
    <strong>Tema consultado:</strong> ${escapeHtml(query)} &nbsp;·&nbsp;
    <strong>Enfoque:</strong> ${escapeHtml(getCategoryLabel(category))}
  </div>

  <blockquote>«${escapeHtml(cleanQuote)}»</blockquote>
  <div class="citation">
    <strong>${escapeHtml(fragment.autor)}</strong>, <em>${escapeHtml(fragment.obra)}</em> — ${escapeHtml(fragment.epoca)} (${escapeHtml(fragment.referencia)})
  </div>
  ${paraphraseBadge}

  <div class="section">
    <h2>Por qué este texto</h2>
    <p>${escapeHtml(fragment.justificacion_seleccion)}</p>
  </div>

  <div class="section bridge">
    <h2>Cómo se relaciona con «${escapeHtml(query)}»</h2>
    <p>${escapeHtml(fragment.explicacion_relacion)}</p>
  </div>

  <div class="section">
    <h2>Explicación adaptada al nivel</h2>
    <p>${escapeHtml(fragment.explicacion_nivel)}</p>
  </div>

  <div class="section">
    <h2>Guía didáctica para el aula</h2>
    <ol>${guideHtml}</ol>
  </div>

  <div class="footer">
    Generado con Lumen Clásico · Humanidades con rigor pedagógico
  </div>
  <script>
    window.onload = function () {
      window.focus();
      window.print();
    };
  </script>
</body>
</html>`;

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}
