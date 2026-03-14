import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Play,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DailyRun } from "@/types";
import {
  formatDate,
  formatRelative,
  runStatusClass,
  runStatusLabel,
} from "@/lib/formatters";
import { cn } from "@/lib/utils";

type RunButtonState = "idle" | "running" | "success" | "error";

const RunLogs: React.FC = () => {
  const [runs, setRuns] = useState<DailyRun[]>([]);
  const [loading, setLoading] = useState(true);
  const [btnState, setBtnState] = useState<RunButtonState>("idle");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  async function loadRuns() {
    try {
      const res = await fetch("/api/news/runs");
      const data = await res.json();
      setRuns(data.runs ?? []);
    } catch (error) {
      console.error("Failed to load runs", error);
      setRuns([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadRuns();
  }, []);

  const handleRunNow = async () => {
    if (btnState !== "idle") return;
    setBtnState("running");

    try {
      const res = await fetch("/api/news/sync", {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error("Sync failed");
      }

      await loadRuns();
      setBtnState("success");
      setTimeout(() => setBtnState("idle"), 2500);
    } catch (e) {
      console.error(e);
      await loadRuns();
      setBtnState("error");
      setTimeout(() => setBtnState("idle"), 2500);
    }
  };

  const latestRun = runs[0];

  if (loading) {
    return (
      <div className="space-y-6 max-w-screen-lg">
        <div className="app-card p-6 text-sm text-muted-foreground">
          Loading run logs...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-screen-lg">
      {/* Header card */}
      <div className="app-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-foreground mb-1">
              Manual Trigger
            </div>
            <div className="text-xs text-muted-foreground">
              Runs the full ingestion pipeline immediately. Scheduled run: daily at 07:00 IST.
            </div>
          </div>
          <motion.div
            whileTap={{ scale: 0.97 }}
            transition={{ type: "spring", duration: 0.3, bounce: 0 }}
          >
            <Button
              onClick={handleRunNow}
              disabled={btnState === "running"}
              className={cn(
                "min-w-32 gap-2 font-semibold",
                btnState === "success" &&
                  "bg-success hover:bg-success text-success-foreground",
                btnState === "error" &&
                  "bg-destructive hover:bg-destructive text-destructive-foreground"
              )}
            >
              {btnState === "idle" && (
                <>
                  <Play className="h-4 w-4" /> Run Now
                </>
              )}
              {btnState === "running" && (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin-slow" /> Running…
                </>
              )}
              {btnState === "success" && (
                <>
                  <CheckCircle2 className="h-4 w-4" /> Success
                </>
              )}
              {btnState === "error" && (
                <>
                  <XCircle className="h-4 w-4" /> Failed
                </>
              )}
            </Button>
          </motion.div>
        </div>
      </div>

      {/* Latest run stats */}
      {latestRun && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Fetched", value: latestRun.totalFetched },
            { label: "Relevant", value: latestRun.totalRelevant },
            { label: "Duplicates Removed", value: latestRun.totalDuplicatesRemoved },
            { label: "Duration", value: `${latestRun.durationSeconds ?? 0}s` },
          ].map((m, i) => (
            <motion.div
              key={m.label}
              className="app-card"
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                type: "spring",
                duration: 0.3,
                bounce: 0,
                delay: i * 0.05,
              }}
            >
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {m.label}
              </div>
              <div className="text-3xl font-bold tabular text-foreground">
                {m.value}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Run history table */}
      <div className="app-card p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <div className="text-sm font-semibold text-foreground">Run History</div>
        </div>

        <div className="divide-y divide-border">
          {runs.length === 0 ? (
            <div className="px-6 py-10 text-sm text-muted-foreground text-center">
              No run logs available.
            </div>
          ) : (
            runs.map((run) => (
              <div key={run.id}>
                <div
                  className="flex items-center gap-4 px-6 py-3 hover:bg-accent transition-colors cursor-pointer"
                  onClick={() =>
                    setExpandedId(expandedId === run.id ? null : run.id)
                  }
                >
                  <div className="shrink-0">
                    {run.status === "success" ? (
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    ) : run.status === "failed" ? (
                      <XCircle className="h-4 w-4 text-destructive" />
                    ) : (
                      <Clock className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>

                  <div className="min-w-28">
                    <div className="text-sm font-semibold text-foreground tabular">
                      {run.runDate}
                    </div>
                    <div className="text-[10px] text-muted-foreground">
                      {formatRelative(run.createdAt)}
                    </div>
                  </div>

                  <span className={runStatusClass(run.status)}>
                    {runStatusLabel(run.status)}
                  </span>

                  <div className="flex-1 flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="hidden sm:block">
                      <span className="font-semibold text-foreground tabular">
                        {run.totalFetched}
                      </span>{" "}
                      fetched
                    </span>
                    <span className="hidden sm:block">
                      <span className="font-semibold text-foreground tabular">
                        {run.totalRelevant}
                      </span>{" "}
                      relevant
                    </span>
                    <span className="hidden md:block">
                      <span className="font-semibold text-foreground tabular">
                        {run.totalDuplicatesRemoved}
                      </span>{" "}
                      dupes removed
                    </span>
                    <span className="hidden md:block">
                      <span className="font-semibold text-foreground tabular">
                        {run.durationSeconds ?? 0}s
                      </span>
                    </span>
                  </div>

                  <div className="text-muted-foreground">
                    {expandedId === run.id ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </div>

                {expandedId === run.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ type: "spring", duration: 0.3, bounce: 0 }}
                    className="px-6 py-4 bg-muted/30 border-t border-border"
                  >
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs mb-4">
                      <div>
                        <div className="text-muted-foreground font-semibold uppercase tracking-wider mb-1">
                          Run ID
                        </div>
                        <div className="font-mono text-foreground">{run.id}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground font-semibold uppercase tracking-wider mb-1">
                          Started At
                        </div>
                        <div className="tabular text-foreground">
                          {formatDate(run.createdAt)}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground font-semibold uppercase tracking-wider mb-1">
                          Articles Fetched
                        </div>
                        <div className="tabular text-foreground">
                          {run.totalFetched}
                        </div>
                      </div>
                      <div>
                        <div className="text-muted-foreground font-semibold uppercase tracking-wider mb-1">
                          Relevant
                        </div>
                        <div className="tabular text-foreground">
                          {run.totalRelevant}
                        </div>
                      </div>
                    </div>

                    {run.errorLog ? (
                      <div>
                        <div className="text-xs font-semibold text-destructive uppercase tracking-wider mb-1">
                          Error Log
                        </div>
                        <pre className="text-xs text-destructive bg-destructive/5 rounded px-3 py-2 font-mono overflow-x-auto whitespace-pre-wrap">
                          {run.errorLog}
                        </pre>
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground">
                        No errors recorded.
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default RunLogs;
