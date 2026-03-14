import React, { useEffect, useState, useMemo } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search,
  X,
  ExternalLink,
  AlertTriangle,
  Ambulance,
  ArrowRightLeft,
  CalendarRange,
  CheckCircle2,
} from "lucide-react";

import type { Article } from "@/types";
import { UP_DISTRICTS } from "@/lib/upDistricts";
import {
  classificationBadgeClass,
  classificationLabel,
  formatRelative,
  severityBadgeClass,
  severityLabel,
  truncate,
} from "@/lib/formatters";
import ArticleDetailPanel from "@/components/ArticleDetailPanel";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DISTRICT_OPTIONS = ["All Districts", ...UP_DISTRICTS];
const CLASS_OPTIONS = [
  { value: "all", label: "All Types" },
  { value: "confirmed_maternal_mortality", label: "Confirmed" },
  { value: "probable_maternal_mortality", label: "Probable" },
];
const LANG_OPTIONS = [
  { value: "all", label: "All Languages" },
  { value: "en", label: "English" },
  { value: "hi", label: "Hindi" },
];
const SEVERITY_OPTIONS = [
  { value: "all", label: "All Severities" },
  { value: "high", label: "High" },
  { value: "medium", label: "Medium" },
  { value: "low", label: "Low" },
];

// Archive start: March 1, 2026
const ARCHIVE_FROM = "2026-03-01";
const TODAY = new Date().toISOString().slice(0, 10);

const Articles: React.FC = () => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [district, setDistrict] = useState("All Districts");
  const [classification, setClassification] = useState("all");
  const [language, setLanguage] = useState("all");
  const [severity, setSeverity] = useState("all");
  const [dateFrom, setDateFrom] = useState(ARCHIVE_FROM);
  const [dateTo, setDateTo] = useState(TODAY);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

  useEffect(() => {
    async function loadArticles() {
      try {
        const res = await fetch("/api/news/list");
        const data = await res.json();
        setArticles(data.articles ?? []);
      } catch (error) {
        console.error("Failed to load articles", error);
        setArticles([]);
      } finally {
        setLoading(false);
      }
    }

    loadArticles();
  }, []);

  const filtered = useMemo(() => {
    const fromTs = new Date(dateFrom + "T00:00:00.000Z").getTime();
    const toTs = new Date(dateTo + "T23:59:59.999Z").getTime();

    return articles
      .filter((a) => {
        const pubTs = new Date(a.publishedAt).getTime();
        if (pubTs < fromTs || pubTs > toTs) return false;

        if (search) {
          const q = search.toLowerCase();
          if (
            !a.title.toLowerCase().includes(q) &&
            !a.summary.toLowerCase().includes(q) &&
            !a.source.toLowerCase().includes(q) &&
            !(a.district?.toLowerCase().includes(q)) &&
            !(a.hospitalName?.toLowerCase().includes(q))
          ) {
            return false;
          }
        }

        if (district !== "All Districts" && a.district !== district) return false;
        if (classification !== "all" && a.classification !== classification) return false;
        if (language !== "all" && a.language !== language) return false;
        if (severity !== "all" && a.severity !== severity) return false;

        return true;
      })
      .sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
      );
  }, [articles, search, district, classification, language, severity, dateFrom, dateTo]);

  const hasFilters =
    search ||
    district !== "All Districts" ||
    classification !== "all" ||
    language !== "all" ||
    severity !== "all" ||
    dateFrom !== ARCHIVE_FROM ||
    dateTo !== TODAY;

  const clearFilters = () => {
    setSearch("");
    setDistrict("All Districts");
    setClassification("all");
    setLanguage("all");
    setSeverity("all");
    setDateFrom(ARCHIVE_FROM);
    setDateTo(TODAY);
  };

  if (loading) {
    return (
      <div className="space-y-4 max-w-screen-xl">
        <div className="app-card p-6 text-sm text-muted-foreground">
          Loading articles...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-screen-xl">
      {/* Archive note */}
      <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary/5 border border-primary/15 text-xs text-primary">
        <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
        <span>
          <strong>UPSTC Archive</strong> — Tracking authentic news sources from{" "}
          <strong>1 March 2026</strong>. Logs preserved daily, never deleted.
        </span>
      </div>

      {/* Filter bar */}
      <div className="app-card p-4 space-y-3">
        {/* Row 1: Search + dropdowns */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search title, source, hospital, district…"
              className="pl-9 h-9 text-sm"
            />
          </div>

          <Select value={district} onValueChange={setDistrict}>
            <SelectTrigger className="h-9 w-44 text-sm">
              <SelectValue placeholder="District" />
            </SelectTrigger>
            <SelectContent>
              {DISTRICT_OPTIONS.map((d) => (
                <SelectItem key={d} value={d}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={classification} onValueChange={setClassification}>
            <SelectTrigger className="h-9 w-40 text-sm">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              {CLASS_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={severity} onValueChange={setSeverity}>
            <SelectTrigger className="h-9 w-36 text-sm">
              <SelectValue placeholder="Severity" />
            </SelectTrigger>
            <SelectContent>
              {SEVERITY_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={language} onValueChange={setLanguage}>
            <SelectTrigger className="h-9 w-36 text-sm">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              {LANG_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {hasFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-9 gap-1 text-muted-foreground"
            >
              <X className="h-3.5 w-3.5" /> Clear
            </Button>
          )}
        </div>

        {/* Row 2: Date range */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
            <CalendarRange className="h-3.5 w-3.5" />
            Date Range
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground">From</label>
            <Input
              type="date"
              value={dateFrom}
              min={ARCHIVE_FROM}
              max={dateTo}
              onChange={(e) => setDateFrom(e.target.value)}
              className="h-9 w-40 text-sm"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-muted-foreground">To</label>
            <Input
              type="date"
              value={dateTo}
              min={dateFrom}
              max={TODAY}
              onChange={(e) => setDateTo(e.target.value)}
              className="h-9 w-40 text-sm"
            />
          </div>
          <span className="text-xs text-muted-foreground">
            Archive starts <strong>1 Mar 2026</strong>
          </span>
        </div>
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground tabular">{filtered.length}</span>{" "}
          articles{hasFilters && " (filtered)"}
        </div>
      </div>

      {/* Table */}
      <div className="app-card p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="w-8" />
                <th>Title</th>
                <th className="hidden md:table-cell">Source</th>
                <th className="hidden sm:table-cell">District / Hospital</th>
                <th>Classification</th>
                <th className="hidden lg:table-cell">Severity</th>
                <th className="hidden xl:table-cell">Published</th>
                <th className="w-8" />
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-sm text-muted-foreground">
                    No articles match the current filters.
                  </td>
                </tr>
              ) : (
                filtered.map((a) => (
                  <motion.tr
                    key={a.id}
                    layout
                    onClick={() => setSelectedArticle(a)}
                    className="cursor-pointer hover:bg-accent/40 transition-colors"
                  >
                    <td>
                      <div className="flex flex-col gap-1 items-center">
                        {a.negligenceFlag && (
                          <span title="Negligence">
                            <AlertTriangle className="h-3 w-3 text-destructive" />
                          </span>
                        )}
                        {a.referralDelayFlag && (
                          <span title="Referral Delay">
                            <ArrowRightLeft className="h-3 w-3 text-warning" />
                          </span>
                        )}
                        {a.ambulanceIssueFlag && (
                          <span title="Ambulance Issue">
                            <Ambulance className="h-3 w-3 text-warning" />
                          </span>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="font-medium text-foreground text-sm leading-tight max-w-xs">
                        {truncate(a.title, 72)}
                      </div>
                      <div className="text-[10px] text-muted-foreground mt-0.5">
                        {a.language === "hi" ? "हिंदी" : "English"} · Score {a.relevanceScore}
                      </div>
                    </td>
                    <td className="hidden md:table-cell text-sm text-muted-foreground">
                      {a.source}
                    </td>
                    <td className="hidden sm:table-cell">
                      <div className="text-sm text-muted-foreground">{a.district || "—"}</div>
                      {a.hospitalName && (
                        <div className="text-[10px] text-muted-foreground/70 mt-0.5">
                          {truncate(a.hospitalName, 32)}
                        </div>
                      )}
                    </td>
                    <td>
                      <span className={classificationBadgeClass(a.classification)}>
                        {classificationLabel(a.classification)}
                      </span>
                    </td>
                    <td className="hidden lg:table-cell">
                      <span className={severityBadgeClass(a.severity)}>
                        {severityLabel(a.severity)}
                      </span>
                    </td>
                    <td className="hidden xl:table-cell text-xs text-muted-foreground tabular">
                      {formatRelative(a.publishedAt)}
                    </td>
                    <td>
                      {a.sourceUrl ? (
                        <a
                          href={a.sourceUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center justify-center hover:text-primary transition-colors"
                          title="Open original article"
                        >
                          <ExternalLink className="h-3.5 w-3.5 text-muted-foreground hover:text-primary" />
                        </a>
                      ) : (
                        <span
                          className="inline-flex items-center justify-center text-muted-foreground/40"
                          title="Source unavailable"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </span>
                      )}
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Article detail panel */}
      <AnimatePresence>
        {selectedArticle && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/20 z-40"
              onClick={() => setSelectedArticle(null)}
            />
            <ArticleDetailPanel
              article={selectedArticle}
              onClose={() => setSelectedArticle(null)}
            />
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Articles;
