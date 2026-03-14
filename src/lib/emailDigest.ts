// Email digest template generator (plain HTML for Resend/SMTP)
import { Article, DailyRun } from "@/types";
import { formatDate, categoryLabel } from "@/lib/formatters";
import { computeDistrictCounts } from "@/data/mockData";

export function generateEmailDigest(articles: Article[], run: DailyRun): string {
  const date = formatDate(run.runDate, "dd MMMM yyyy");
  const confirmed = articles.filter((a) => a.classification === "confirmed_maternal_mortality");
  const probable = articles.filter((a) => a.classification === "probable_maternal_mortality");
  const districtCounts = computeDistrictCounts(articles).slice(0, 8);

  const articleRows = confirmed.slice(0, 10).map((a) => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #e5e7eb;font-size:13px;">
        <a href="${a.sourceUrl}" style="color:#2563eb;text-decoration:none;font-weight:600;">${a.title}</a><br/>
        <span style="color:#6b7280;font-size:11px;">${a.source} · ${formatDate(a.publishedAt, "dd MMM, HH:mm")} · ${a.district || "UP"}</span><br/>
        <span style="color:#374151;font-size:12px;margin-top:4px;display:block;">${a.summary.slice(0, 160)}…</span>
      </td>
    </tr>
  `).join("");

  const districtRows = districtCounts.map((d) => `
    <tr>
      <td style="padding:6px 12px;font-size:13px;border-bottom:1px solid #f3f4f6;">${d.district}</td>
      <td style="padding:6px 12px;font-size:13px;border-bottom:1px solid #f3f4f6;text-align:right;font-weight:600;">${d.count}</td>
    </tr>
  `).join("");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>UP Maternal Mortality Daily Digest — ${date}</title>
</head>
<body style="margin:0;padding:0;background:#f9fafb;font-family:'Public Sans',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f9fafb;padding:24px 0;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;box-shadow:0 1px 3px rgba(0,0,0,.1);">

      <!-- Header -->
      <tr>
        <td style="background:#1d4ed8;padding:24px 32px;border-radius:8px 8px 0 0;">
          <div style="color:#fff;font-size:11px;font-weight:600;letter-spacing:.1em;text-transform:uppercase;margin-bottom:4px;">
            Government of Uttar Pradesh · Health Department
          </div>
          <div style="color:#fff;font-size:20px;font-weight:700;">
            Maternal Mortality Monitoring
          </div>
          <div style="color:#bfdbfe;font-size:13px;margin-top:4px;">Daily Digest — ${date}</div>
        </td>
      </tr>

      <!-- Metrics -->
      <tr>
        <td style="padding:24px 32px;border-bottom:1px solid #e5e7eb;">
          <table width="100%">
            <tr>
              <td style="text-align:center;padding:12px;">
                <div style="font-size:32px;font-weight:800;color:#dc2626;font-variant-numeric:tabular-nums;">${confirmed.length}</div>
                <div style="font-size:11px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:.05em;">Confirmed</div>
              </td>
              <td style="text-align:center;padding:12px;">
                <div style="font-size:32px;font-weight:800;color:#d97706;font-variant-numeric:tabular-nums;">${probable.length}</div>
                <div style="font-size:11px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:.05em;">Probable</div>
              </td>
              <td style="text-align:center;padding:12px;">
                <div style="font-size:32px;font-weight:800;color:#374151;font-variant-numeric:tabular-nums;">${articles.length}</div>
                <div style="font-size:11px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:.05em;">Total Incidents</div>
              </td>
              <td style="text-align:center;padding:12px;">
                <div style="font-size:32px;font-weight:800;color:#374151;font-variant-numeric:tabular-nums;">${run.totalFetched}</div>
                <div style="font-size:11px;color:#6b7280;font-weight:600;text-transform:uppercase;letter-spacing:.05em;">Articles Scanned</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>

      <!-- District Breakdown -->
      <tr>
        <td style="padding:24px 32px;border-bottom:1px solid #e5e7eb;">
          <div style="font-size:13px;font-weight:700;color:#111827;margin-bottom:12px;text-transform:uppercase;letter-spacing:.05em;">District Breakdown</div>
          <table width="100%">
            <tr>
              <th style="text-align:left;font-size:11px;color:#6b7280;font-weight:600;padding:6px 12px;background:#f9fafb;">District</th>
              <th style="text-align:right;font-size:11px;color:#6b7280;font-weight:600;padding:6px 12px;background:#f9fafb;">Incidents</th>
            </tr>
            ${districtRows}
          </table>
        </td>
      </tr>

      <!-- Top Incidents -->
      <tr>
        <td style="padding:24px 32px;">
          <div style="font-size:13px;font-weight:700;color:#111827;margin-bottom:12px;text-transform:uppercase;letter-spacing:.05em;">Top Incidents</div>
          <table width="100%">
            ${articleRows}
          </table>
        </td>
      </tr>

      <!-- Footer -->
      <tr>
        <td style="padding:16px 32px;border-top:1px solid #e5e7eb;border-radius:0 0 8px 8px;background:#f9fafb;">
          <div style="font-size:11px;color:#6b7280;text-align:center;">
            This digest is automatically generated by the UP Maternal Mortality News Agent.<br/>
            For queries, contact your designated health department coordinator.
          </div>
        </td>
      </tr>

    </table>
  </td></tr>
</table>
</body>
</html>`;
}
