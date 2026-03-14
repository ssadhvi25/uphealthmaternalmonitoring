import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Newspaper,
  Calendar,
  BarChart2,
  AlertTriangle,
  ArrowRight,
  Ambulance,
  ArrowRightLeft,
  Building2,
  MapPin,
} from "lucide-react";
import {
  SAMPLE_ARTICLES,
  SAMPLE_RUNS,
  computeDistrictCounts,
  computeMetrics,
  computeSourceCounts,
  computeHospitalCounts,
} from "@/data/mockData";
import {
  formatRelative,
  formatDate,
  classificationBadgeClass,
  classificationLabel,
  truncate,
} from "@/lib/formatters";
import {
  DistrictBarChart,
  SourceBarChart,
  SeverityDonut,
  HospitalRankingTable,
} from "@/components/Charts";
import { UPDistrictMap } from "@/components/UPDistrictMap";
import { getLastRun } from "@/lib/formatters";

const cardVariant = {
  hidden: { opacity: 0, y: 8 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, duration: 0.4, bounce: 0, delay: i * 0.05 },
  }),
};

const MetricCard: React.FC<{
  label: string;
  value: number | string;
  sub?: string;
  icon: React.ReactNode;
  accent?: string;
  index: number;
}> = ({ label, value, sub, icon, accent = "text-foreground", index }) => (
  <motion.div
    className="app-card"
    custom={index}
    initial="hidden"
    animate="visible"
    variants={cardVariant}
  >
    <div className="flex items-start justify-between">
      <div>
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          {label}
        </div>
        <div className={`metric-value ${accent}`}>{value}</div>
        {sub && <div className="text-xs text-muted-foreground mt-1">{sub}</div>}
      </div>
      <div className="text-muted-foreground opacity-40">{icon}</div>
    </div>
  </motion.div>
);

const Overview: React.FC = () => {
  const metrics = computeMetrics(SAMPLE_ARTICLES);
  const districtCounts = computeDistrictCounts(SAMPLE_ARTICLES);
  const sourceCounts = computeSourceCounts(SAMPLE_ARTICLES);
  const hospitalCounts = computeHospitalCounts(SAMPLE_ARTICLES);
  const lastRun = getLastRun(SAMPLE_RUNS);
  const recentArticles = [...SAMPLE_ARTICLES]
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 5);

  const worstDistrict = districtCounts[0];
  const worstHospital = hospitalCounts[0];

  return (
    <div className="space-y-6 max-w-screen-xl">
      {/* Last run banner */}
      {lastRun && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center justify-between px-4 py-2.5 rounded-lg bg-success/10 border border-success/20"
        >
          <div className="flex items-center gap-2 text-sm">
            <div className="h-2 w-2 rounded-full bg-success" />
            <span className="font-semibold text-foreground">Last run succeeded</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">{formatRelative(lastRun.createdAt)}</span>
            <span className="text-muted-foreground">·</span>
            <span className="text-muted-foreground">
              {lastRun.totalFetched} fetched, {lastRun.totalRelevant} relevant
            </span>
          </div>
          <Link
            to="/runs"
            className="text-xs font-medium text-primary hover:underline flex items-center gap-1"
          >
            View logs <ArrowRight className="h-3 w-3" />
          </Link>
        </motion.div>
      )}

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Relevant"
          value={metrics.totalArticles}
          sub="Archive: Mar 2026 onwards"
          icon={<Newspaper className="h-6 w-6" />}
          index={0}
        />
        <MetricCard
          label="Today"
          value={metrics.todayCount}
          sub={new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
          icon={<Calendar className="h-6 w-6" />}
          index={1}
        />
        <MetricCard
          label="This Week"
          value={metrics.weekCount}
          sub={`Last 7 days`}
          icon={<BarChart2 className="h-6 w-6" />}
          index={2}
        />
        <MetricCard
          label="Confirmed Deaths"
          value={metrics.confirmedCount}
          sub={`${metrics.probableCount} probable`}
          icon={<AlertTriangle className="h-6 w-6" />}
          accent="text-destructive"
          index={3}
        />
      </div>

      {/* Alert strip: worst district + worst hospital */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {worstDistrict && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0, delay: 0.18 }}
        className="flex items-start gap-3 px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20"
        >
          <MapPin className="h-4 w-4 text-destructive mt-0.5 shrink-0" />
          <div>
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
              Worst Performing District
            </div>
            <div className="text-base font-bold text-destructive">{worstDistrict.district}</div>
            <div className="text-xs text-muted-foreground">
              {worstDistrict.count} incident{worstDistrict.count !== 1 ? "s" : ""} — most in UP
            </div>
          </div>
        </motion.div>
        )}
        {worstHospital && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", duration: 0.4, bounce: 0, delay: 0.22 }}
            className="flex items-start gap-3 px-4 py-3 rounded-lg bg-warning/10 border border-warning/25"
          >
            <Building2 className="h-4 w-4 text-warning mt-0.5 shrink-0" />
            <div>
              <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-0.5">
                Worst Performing Hospital
              </div>
              <div className="text-base font-bold text-warning">{worstHospital.hospital}</div>
              <div className="text-xs text-muted-foreground">
                {worstHospital.count} incident{worstHospital.count !== 1 ? "s" : ""} ·{" "}
                {worstHospital.district}
                {worstHospital.negligenceCount > 0 &&
                  ` · ${worstHospital.negligenceCount} negligence flag${worstHospital.negligenceCount !== 1 ? "s" : ""}`}
              </div>
            </div>
          </motion.div>
        )}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* District breakdown */}
        <motion.div
          className="app-card lg:col-span-1"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", duration: 0.4, bounce: 0, delay: 0.2 }}
        >
          <div className="text-sm font-semibold text-foreground mb-4">District Breakdown</div>
        <DistrictBarChart data={districtCounts} />
        </motion.div>

        {/* Source breakdown */}
        <motion.div
          className="app-card lg:col-span-1"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", duration: 0.4, bounce: 0, delay: 0.25 }}
        >
          <div className="text-sm font-semibold text-foreground mb-4">Source Breakdown</div>
          <SourceBarChart data={sourceCounts} />
        </motion.div>

        {/* Severity split */}
        <motion.div
          className="app-card"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", duration: 0.4, bounce: 0, delay: 0.3 }}
        >
          <div className="text-sm font-semibold text-foreground mb-4">Classification Split</div>
          <SeverityDonut confirmed={metrics.confirmedCount} probable={metrics.probableCount} />

          <div className="mt-6 pt-4 border-t border-border space-y-2">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
              Issue Flags
            </div>
            <FlagRow
              icon={<AlertTriangle className="h-3.5 w-3.5" />}
              label="Negligence"
              count={SAMPLE_ARTICLES.filter((a) => a.negligenceFlag).length}
              colorClass="text-destructive"
            />
            <FlagRow
              icon={<ArrowRightLeft className="h-3.5 w-3.5" />}
              label="Referral Delay"
              count={SAMPLE_ARTICLES.filter((a) => a.referralDelayFlag).length}
              colorClass="text-warning"
            />
            <FlagRow
              icon={<Ambulance className="h-3.5 w-3.5" />}
              label="Ambulance Issue"
              count={SAMPLE_ARTICLES.filter((a) => a.ambulanceIssueFlag).length}
              colorClass="text-warning"
            />
          </div>
        </motion.div>
      </div>

      {/* District Map */}
      <motion.div
        className="app-card"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", duration: 0.4, bounce: 0, delay: 0.32 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-semibold text-foreground">
            District Incident Map — UP
          </div>
          <span className="text-xs text-muted-foreground">All districts · Mar 2026 · Hover to explore</span>
        </div>
        <UPDistrictMap data={districtCounts} />
      </motion.div>

      {/* Worst hospitals */}
      <motion.div
        className="app-card"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", duration: 0.4, bounce: 0, delay: 0.35 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-semibold text-foreground">
            Worst Performing Hospitals
          </div>
          <span className="text-xs text-muted-foreground">Ranked by incident count</span>
        </div>
        <HospitalRankingTable data={hospitalCounts} />
      </motion.div>

      {/* Recent articles */}
      <motion.div
        className="app-card"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: "spring", duration: 0.4, bounce: 0, delay: 0.38 }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="text-sm font-semibold text-foreground">Recent Incidents</div>
          <Link
            to="/articles"
            className="text-xs text-primary font-medium hover:underline flex items-center gap-1"
          >
            View all <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full data-table">
            <thead>
              <tr className="border-b border-border">
                <th>Title</th>
                <th className="hidden sm:table-cell">Source</th>
                <th className="hidden md:table-cell">District</th>
                <th>Classification</th>
                <th className="hidden lg:table-cell">Date of Occurrence</th>
              </tr>
            </thead>
            <tbody>
              {recentArticles.map((a) => (
                <tr
                  key={a.id}
                  className="hover:bg-accent/40 transition-colors cursor-pointer"
                  onClick={() => window.open(a.sourceUrl, "_blank", "noopener,noreferrer")}
                >
                  <td>
                    <div className="flex items-start gap-2">
                      <div>
                        <div className="font-medium text-foreground text-sm leading-tight">
                          {truncate(a.title, 70)}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1">
                          {a.negligenceFlag && (
                            <span className="badge badge-destructive text-[10px] py-0">
                              <AlertTriangle className="h-2.5 w-2.5 mr-0.5" /> Negligence
                            </span>
                          )}
                          {a.referralDelayFlag && (
                            <span className="badge badge-warning text-[10px] py-0">Referral</span>
                          )}
                          {a.ambulanceIssueFlag && (
                            <span className="badge badge-warning text-[10px] py-0">Ambulance</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="hidden sm:table-cell text-muted-foreground">{a.source}</td>
                  <td className="hidden md:table-cell text-muted-foreground">
                    {a.district || "—"}
                  </td>
                  <td>
                    <span className={classificationBadgeClass(a.classification)}>
                      {classificationLabel(a.classification)}
                    </span>
                  </td>
                  <td className="hidden lg:table-cell text-muted-foreground text-xs tabular">
                    <div className="font-semibold text-foreground">{formatDate(a.publishedAt, "dd MMM yyyy")}</div>
                    <div className="text-[10px] text-muted-foreground">{formatRelative(a.publishedAt)}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

const FlagRow: React.FC<{
  icon: React.ReactNode;
  label: string;
  count: number;
  colorClass: string;
}> = ({ icon, label, count, colorClass }) => (
  <div className="flex items-center justify-between">
    <div className={`flex items-center gap-1.5 text-xs ${colorClass}`}>
      {icon}
      <span>{label}</span>
    </div>
    <span className="text-sm font-semibold tabular text-foreground">{count}</span>
  </div>
);

export default Overview;
