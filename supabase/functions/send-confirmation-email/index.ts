import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

interface EmailRequest {
  to: string;
  nome: string;
  protocolo: string;
  tipo: string;
  categoria: string;
  assunto: string;
  impacto: string;
  descricao: string;
  secretaria: string;
  setor: string;
  prioridade: string;
  slaLimite: string;
  data: string;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function buildEmailHtml(req: EmailRequest): string {
  const slaFormatted = formatDate(req.slaLimite);
  const dataFormatted = formatDate(req.data);

  return `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin:0;padding:0;background-color:#f0f4f8;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f0f4f8;padding:40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,75,141,0.12);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #004B8D 0%, #003366 100%);padding:32px 40px;text-align:center;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <div style="width:56px;height:56px;background-color:rgba(255,255,255,0.15);border-radius:12px;display:inline-block;line-height:56px;font-size:28px;">
                      🏛️
                    </div>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top:16px;">
                    <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;letter-spacing:-0.3px;">
                      Central de Atendimento
                    </h1>
                    <p style="margin:4px 0 0;color:rgba(255,255,255,0.8);font-size:13px;font-weight:400;">
                      SEPLAG – Mato Grosso
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Success Badge -->
          <tr>
            <td style="padding:32px 40px 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <div style="display:inline-block;background-color:#e8f5e9;border:1px solid #a5d6a7;border-radius:50px;padding:10px 28px;">
                      <span style="color:#2e7d32;font-size:14px;font-weight:600;">
                        ✅ Solicitação Registrada com Sucesso
                      </span>
                    </div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Protocol Number -->
          <tr>
            <td style="padding:24px 40px 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;border:2px solid #004B8D;border-radius:10px;overflow:hidden;">
                <tr>
                  <td style="background-color:#004B8D;padding:8px 20px;">
                    <p style="margin:0;color:#ffffff;font-size:11px;font-weight:600;text-transform:uppercase;letter-spacing:1px;">
                      Número do Protocolo
                    </p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:16px 20px;text-align:center;">
                    <p style="margin:0;color:#004B8D;font-size:24px;font-weight:800;font-family:'Courier New',monospace;letter-spacing:2px;">
                      ${req.protocolo}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding:24px 40px 0;">
              <p style="margin:0;color:#1a1a2e;font-size:15px;line-height:1.6;">
                Olá, <strong>${req.nome}</strong>!
              </p>
              <p style="margin:8px 0 0;color:#4a5568;font-size:14px;line-height:1.6;">
                Sua solicitação foi registrada em nosso sistema. Abaixo estão os detalhes do seu chamado:
              </p>
            </td>
          </tr>

          <!-- Details Table -->
          <tr>
            <td style="padding:24px 40px 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;">
                <tr style="background-color:#f7fafc;">
                  <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;width:40%;">
                    <p style="margin:0;color:#718096;font-size:12px;font-weight:600;text-transform:uppercase;">Data do Registro</p>
                  </td>
                  <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;">
                    <p style="margin:0;color:#1a1a2e;font-size:14px;font-weight:500;">${dataFormatted}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;">
                    <p style="margin:0;color:#718096;font-size:12px;font-weight:600;text-transform:uppercase;">Tipo</p>
                  </td>
                  <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;">
                    <p style="margin:0;color:#1a1a2e;font-size:14px;font-weight:500;">${req.tipo}</p>
                  </td>
                </tr>
                <tr style="background-color:#f7fafc;">
                  <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;">
                    <p style="margin:0;color:#718096;font-size:12px;font-weight:600;text-transform:uppercase;">Categoria</p>
                  </td>
                  <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;">
                    <p style="margin:0;color:#1a1a2e;font-size:14px;font-weight:500;">${req.categoria}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;">
                    <p style="margin:0;color:#718096;font-size:12px;font-weight:600;text-transform:uppercase;">Assunto</p>
                  </td>
                  <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;">
                    <p style="margin:0;color:#1a1a2e;font-size:14px;font-weight:500;">${req.assunto}</p>
                  </td>
                </tr>
                <tr style="background-color:#f7fafc;">
                  <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;">
                    <p style="margin:0;color:#718096;font-size:12px;font-weight:600;text-transform:uppercase;">Impacto</p>
                  </td>
                  <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;">
                    <p style="margin:0;color:#1a1a2e;font-size:14px;font-weight:500;">${req.impacto}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;">
                    <p style="margin:0;color:#718096;font-size:12px;font-weight:600;text-transform:uppercase;">Secretaria</p>
                  </td>
                  <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;">
                    <p style="margin:0;color:#1a1a2e;font-size:14px;font-weight:500;">${req.secretaria}</p>
                  </td>
                </tr>
                <tr style="background-color:#f7fafc;">
                  <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;">
                    <p style="margin:0;color:#718096;font-size:12px;font-weight:600;text-transform:uppercase;">Setor</p>
                  </td>
                  <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;">
                    <p style="margin:0;color:#1a1a2e;font-size:14px;font-weight:500;">${req.setor}</p>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;">
                    <p style="margin:0;color:#718096;font-size:12px;font-weight:600;text-transform:uppercase;">Prioridade</p>
                  </td>
                  <td style="padding:12px 16px;border-bottom:1px solid #e2e8f0;">
                    <p style="margin:0;color:#1a1a2e;font-size:14px;font-weight:600;${req.prioridade === 'Urgente' ? 'color:#c62828;' : ''}">${req.prioridade}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Description -->
          <tr>
            <td style="padding:24px 40px 0;">
              <p style="margin:0 0 8px;color:#718096;font-size:12px;font-weight:600;text-transform:uppercase;">Descrição</p>
              <div style="background-color:#f7fafc;border-left:4px solid #004B8D;border-radius:0 8px 8px 0;padding:16px;">
                <p style="margin:0;color:#4a5568;font-size:14px;line-height:1.6;white-space:pre-wrap;">${req.descricao}</p>
              </div>
            </td>
          </tr>

          <!-- SLA -->
          <tr>
            <td style="padding:24px 40px 0;">
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#fff8e1;border:1px solid #ffcc02;border-radius:8px;">
                <tr>
                  <td style="padding:14px 20px;">
                    <p style="margin:0;color:#f57f17;font-size:13px;">
                      ⏱️ <strong>Prazo estimado de resposta:</strong> ${slaFormatted}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:32px 40px;">
              <hr style="border:none;border-top:1px solid #e2e8f0;margin:0 0 24px;">
              <p style="margin:0;color:#a0aec0;font-size:12px;text-align:center;line-height:1.6;">
                Este é um e-mail automático gerado pelo sistema <strong>SEPLAG Atende</strong>.<br>
                Secretaria de Estado de Planejamento e Gestão – Mato Grosso<br>
                Em caso de dúvidas, entre em contato pelo WhatsApp: (65) 98432-0031
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      console.error("RESEND_API_KEY not configured");
      return new Response(
        JSON.stringify({ error: "Email service not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const body: EmailRequest = await req.json();

    const html = buildEmailHtml(body);

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "SEPLAG Atende <onboarding@resend.dev>",
        to: [body.to],
        subject: `Confirmação de Solicitação – Protocolo ${body.protocolo}`,
        html,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      console.error("Resend API error:", data);
      return new Response(
        JSON.stringify({ error: "Failed to send email", details: data }),
        { status: res.status, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Email sent successfully:", data);
    return new Response(
      JSON.stringify({ success: true, id: data.id }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
