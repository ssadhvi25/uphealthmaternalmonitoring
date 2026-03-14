import React from "react";
import { Article } from "@/types";
import {
  classificationBadgeClass,
  classificationLabel,
  formatDate,
  formatRelative,
  severityBadgeClass,
  severityLabel,
  truncate,
} from "@/lib/formatters";
import { Ambulance, AlertTriangle, ArrowRightLeft, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

interface ArticleDetailPanelProps {
  article: Article;
  onClose: () => void;
}

const ArticleDetailPanel: React.FC<ArticleDetailPanelProps> = ({ article, onClose }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: 16 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 16 }}
      transition={{ type: "spring", duration: 0.3, bounce: 0 }}
      className="fixed inset-y-0 right-0 w-full sm:w-[480px] bg-card border-l border-border shadow-xl z-50 flex flex-col overflow-y-auto"
    >
      <div className="flex items-start justify-between p-6 border-b border-border">
        <div className="flex-1 pr-4">
          <div className="flex items-center gap-2 mb-2">
            <span className={classificationBadgeClass(article.classification)}>
              {classificationLabel(article.classification)}
            </span>
            <span className={severityBadgeClass(article.severity)}>
              {severityLabel(article.severity)} Severity
            </span>
          </div>
          <h2 className="font-bold text-base leading-tight text-foreground">
            {article.title}
          </h2>
        </div>
        <button
          onClick={onClose}
          className="text-muted-foreground hover:text-foreground transition-colors text-lg font-semibold h-8 w-8 flex items-center justify-center shrink-0"
        >
          ×
        </button>
      </div>

      <div className="flex-1 p-6 space-y-6">
        {/* Meta */}
        <div className="grid grid-cols-2 gap-4">
          <InfoRow label="Source" value={article.source} />
          <InfoRow label="Language" value={article.language === "hi" ? "Hindi" : "English"} />
          <InfoRow label="Published" value={formatDate(article.publishedAt, "dd MMM yyyy, HH:mm")} />
          <InfoRow label="Fetched" value={formatRelative(article.fetchedAt)} />
          {article.district && <InfoRow label="District" value={article.district} />}
          {article.hospitalName && <InfoRow label="Hospital" value={article.hospitalName} />}
          <InfoRow label="Relevance Score" value={`${article.relevanceScore}/100`} />
          <InfoRow label="Category" value={article.category.replace(/_/g, " ")} />
        </div>

        {/* Flags */}
        {(article.negligenceFlag || article.referralDelayFlag || article.ambulanceIssueFlag) && (
          <div>
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Alert Flags
            </div>
            <div className="flex flex-wrap gap-2">
              {article.negligenceFlag && (
                <span className="badge badge-destructive flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" /> Negligence
                </span>
              )}
              {article.referralDelayFlag && (
                <span className="badge badge-warning flex items-center gap-1">
                  <ArrowRightLeft className="h-3 w-3" /> Referral Delay
                </span>
              )}
              {article.ambulanceIssueFlag && (
                <span className="badge badge-warning flex items-center gap-1">
                  <Ambulance className="h-3 w-3" /> Ambulance Issue
                </span>
              )}
            </div>
          </div>
        )}

        {/* Summary */}
        <div>
          <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Summary
          </div>
          <p className="text-sm text-foreground leading-relaxed">{article.summary}</p>
        </div>

        {/* Traceability notice */}
        <div className="rounded-lg bg-primary/5 border border-primary/15 px-3 py-2.5 text-xs text-muted-foreground space-y-1">
          <div className="font-semibold text-primary text-[11px] uppercase tracking-wider mb-1">🔎 Source Traceability</div>
          <div>This article is tracked and archived by <strong>UPSTC</strong> from the publication below. Click to verify on the original source.</div>
          <div className="font-mono text-[10px] text-primary/70 break-all">{article.sourceUrl}</div>
        </div>
        <a
          href={article.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm text-primary font-semibold hover:underline"
        >
          <ExternalLink className="h-4 w-4" />
          Open source publication ↗
        </a>
      </div>
    </motion.div>
  );
};

const InfoRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">{label}</div>
    <div className="text-sm text-foreground font-medium">{value}</div>
  </div>
);

export default ArticleDetailPanel;
