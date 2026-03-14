import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DistrictCount } from "@/types";
import { AlertTriangle, MapPin } from "lucide-react";

// Simplified SVG path data for UP districts (schematic positions, not exact geography)
// Each district has an approximate bounding box in a 800x600 grid
const DISTRICT_SHAPES: Record<string, { path: string; labelX: number; labelY: number }> = {
  "Saharanpur":    { path: "M 95 30 L 135 30 L 140 60 L 100 65 Z", labelX: 115, labelY: 48 },
  "Muzaffarnagar": { path: "M 100 65 L 140 60 L 145 95 L 105 100 Z", labelX: 122, labelY: 80 },
  "Meerut":        { path: "M 105 100 L 145 95 L 150 130 L 110 135 Z", labelX: 128, labelY: 115 },
  "Ghaziabad":     { path: "M 110 135 L 150 130 L 152 155 L 112 158 Z", labelX: 131, labelY: 145 },
  "Noida":         { path: "M 112 158 L 152 155 L 153 175 L 113 177 Z", labelX: 132, labelY: 166 },
  "Hapur":         { path: "M 150 130 L 190 128 L 192 160 L 152 162 Z", labelX: 171, labelY: 145 },
  "Bulandshahr":   { path: "M 152 155 L 192 152 L 194 185 L 154 188 Z", labelX: 173, labelY: 170 },
  "Aligarh":       { path: "M 154 188 L 194 185 L 196 218 L 156 221 Z", labelX: 175, labelY: 203 },
  "Moradabad":     { path: "M 190 95 L 235 90 L 238 130 L 193 133 Z", labelX: 214, labelY: 112 },
  "Rampur":        { path: "M 235 90 L 278 88 L 280 125 L 238 128 Z", labelX: 258, labelY: 107 },
  "Bareilly":      { path: "M 238 128 L 285 125 L 287 165 L 240 168 Z", labelX: 263, labelY: 146 },
  "Pilibhit":      { path: "M 285 88 L 328 85 L 330 122 L 288 125 Z", labelX: 308, labelY: 103 },
  "Shahjahanpur":  { path: "M 287 165 L 332 162 L 334 200 L 289 203 Z", labelX: 311, labelY: 182 },
  "Mathura":       { path: "M 156 221 L 196 218 L 198 255 L 158 258 Z", labelX: 177, labelY: 237 },
  "Agra":          { path: "M 158 258 L 200 255 L 202 292 L 160 295 Z", labelX: 180, labelY: 274 },
  "Firozabad":     { path: "M 196 218 L 238 215 L 240 250 L 198 253 Z", labelX: 218, labelY: 233 },
  "Etah":          { path: "M 198 253 L 240 250 L 242 285 L 200 288 Z", labelX: 220, labelY: 269 },
  "Mainpuri":      { path: "M 240 250 L 282 248 L 284 283 L 242 285 Z", labelX: 262, labelY: 266 },
  "Farrukhabad":   { path: "M 289 203 L 334 200 L 336 238 L 291 241 Z", labelX: 313, labelY: 220 },
  "Kannauj":       { path: "M 291 241 L 336 238 L 338 272 L 293 275 Z", labelX: 315, labelY: 256 },
  "Kanpur Dehat":  { path: "M 293 275 L 338 272 L 340 308 L 295 311 Z", labelX: 317, labelY: 292 },
  "Kanpur Nagar":  { path: "M 338 272 L 383 270 L 385 306 L 340 308 Z", labelX: 362, labelY: 288 },
  "Auraiya":       { path: "M 282 283 L 324 280 L 326 315 L 284 318 Z", labelX: 304, labelY: 298 },
  "Etawah":        { path: "M 242 285 L 284 283 L 286 318 L 244 320 Z", labelX: 264, labelY: 302 },
  "Jalaun":        { path: "M 244 320 L 286 318 L 288 353 L 246 355 Z", labelX: 266, labelY: 336 },
  "Jhansi":        { path: "M 200 355 L 246 353 L 248 395 L 202 398 Z", labelX: 224, labelY: 374 },
  "Lalitpur":      { path: "M 202 398 L 248 395 L 250 430 L 204 432 Z", labelX: 226, labelY: 414 },
  "Hamirpur":      { path: "M 286 318 L 330 315 L 332 353 L 288 355 Z", labelX: 309, labelY: 334 },
  "Mahoba":        { path: "M 246 355 L 288 353 L 290 393 L 248 395 Z", labelX: 268, labelY: 373 },
  "Banda":         { path: "M 288 353 L 332 350 L 334 388 L 290 390 Z", labelX: 311, labelY: 369 },
  "Chitrakoot":    { path: "M 290 390 L 334 388 L 336 422 L 292 424 Z", labelX: 313, labelY: 406 },
  "Fatehpur":      { path: "M 340 308 L 383 306 L 385 342 L 342 344 Z", labelX: 363, labelY: 325 },
  "Allahabad":     { path: "M 383 306 L 432 303 L 434 345 L 385 347 Z", labelX: 408, labelY: 324 },
  "Prayagraj":     { path: "M 383 306 L 432 303 L 434 345 L 385 347 Z", labelX: 408, labelY: 324 },
  "Kaushambi":     { path: "M 385 347 L 430 344 L 432 378 L 387 380 Z", labelX: 409, labelY: 362 },
  "Pratapgarh":    { path: "M 432 300 L 476 297 L 478 336 L 434 339 Z", labelX: 455, labelY: 317 },
  "Lucknow":       { path: "M 383 238 L 428 235 L 430 272 L 385 275 Z", labelX: 406, labelY: 254 },
  "Unnao":         { path: "M 385 275 L 430 272 L 432 308 L 387 311 Z", labelX: 408, labelY: 291 },
  "Rae Bareli":    { path: "M 430 272 L 476 269 L 478 308 L 432 311 Z", labelX: 454, labelY: 288 },
  "Sitapur":       { path: "M 338 200 L 383 197 L 385 235 L 340 238 Z", labelX: 362, labelY: 217 },
  "Hardoi":        { path: "M 340 238 L 385 235 L 387 273 L 342 276 Z", labelX: 363, labelY: 255 },
  "Lakhimpur":     { path: "M 383 160 L 430 157 L 432 197 L 385 200 Z", labelX: 407, labelY: 178 },
  "Kheri":         { path: "M 383 160 L 430 157 L 432 197 L 385 200 Z", labelX: 407, labelY: 178 },
  "Bahraich":      { path: "M 430 125 L 478 122 L 480 162 L 432 165 Z", labelX: 455, labelY: 143 },
  "Shravasti":     { path: "M 478 122 L 520 120 L 522 155 L 480 157 Z", labelX: 500, labelY: 138 },
  "Balrampur":     { path: "M 480 157 L 522 155 L 524 192 L 482 194 Z", labelX: 502, labelY: 174 },
  "Gonda":         { path: "M 432 165 L 478 162 L 480 200 L 434 202 Z", labelX: 456, labelY: 181 },
  "Faizabad":      { path: "M 478 200 L 522 197 L 524 235 L 480 237 Z", labelX: 501, labelY: 217 },
  "Ayodhya":       { path: "M 478 200 L 522 197 L 524 235 L 480 237 Z", labelX: 501, labelY: 217 },
  "Ambedkar Nagar":{ path: "M 522 235 L 566 232 L 568 268 L 524 270 Z", labelX: 545, labelY: 251 },
  "Sultanpur":     { path: "M 476 235 L 522 232 L 524 270 L 478 272 Z", labelX: 500, labelY: 251 },
  "Amethi":        { path: "M 476 269 L 522 266 L 524 302 L 478 304 Z", labelX: 500, labelY: 285 },
  "Barabanki":     { path: "M 430 197 L 476 194 L 478 232 L 432 235 Z", labelX: 454, labelY: 214 },
  "Gorakhpur":     { path: "M 568 165 L 615 162 L 617 202 L 570 205 Z", labelX: 592, labelY: 183 },
  "Maharajganj":   { path: "M 570 128 L 615 125 L 617 162 L 572 165 Z", labelX: 593, labelY: 144 },
  "Kushinagar":    { path: "M 615 162 L 660 159 L 662 200 L 617 202 Z", labelX: 638, labelY: 180 },
  "Deoria":        { path: "M 617 202 L 660 199 L 662 238 L 619 240 Z", labelX: 640, labelY: 219 },
  "Mau":           { path: "M 619 240 L 662 237 L 664 275 L 621 277 Z", labelX: 642, labelY: 257 },
  "Azamgarh":      { path: "M 566 268 L 611 265 L 613 303 L 568 305 Z", labelX: 589, labelY: 284 },
  "Ballia":        { path: "M 621 277 L 664 274 L 666 311 L 623 313 Z", labelX: 644, labelY: 294 },
  "Jaunpur":       { path: "M 524 302 L 568 299 L 570 337 L 526 339 Z", labelX: 547, labelY: 318 },
  "Varanasi":      { path: "M 568 337 L 613 334 L 615 371 L 570 373 Z", labelX: 591, labelY: 353 },
  "Chandauli":     { path: "M 613 334 L 655 331 L 657 368 L 617 370 Z", labelX: 635, labelY: 350 },
  "Ghazipur":      { path: "M 568 299 L 613 297 L 615 334 L 570 336 Z", labelX: 591, labelY: 316 },
  "Mirzapur":      { path: "M 478 340 L 523 337 L 525 376 L 480 378 Z", labelX: 501, labelY: 357 },
  "Sant Ravidas Nagar":{ path: "M 523 337 L 565 334 L 567 370 L 525 372 Z", labelX: 545, labelY: 353 },
  "Sonbhadra":     { path: "M 525 376 L 567 373 L 569 410 L 527 412 Z", labelX: 547, labelY: 393 },
};

function heatColor(count: number, maxCount: number): string {
  if (count === 0) return "hsl(240 10% 92%)";
  const ratio = count / maxCount;
  if (ratio >= 0.75) return "hsl(0 84% 60%)";
  if (ratio >= 0.5) return "hsl(25 95% 53%)";
  if (ratio >= 0.25) return "hsl(38 92% 50%)";
  return "hsl(221 83% 72%)";
}

function heatLabel(count: number, maxCount: number): string {
  if (count === 0) return "None";
  const ratio = count / maxCount;
  if (ratio >= 0.75) return "Critical";
  if (ratio >= 0.5) return "High";
  if (ratio >= 0.25) return "Medium";
  return "Low";
}

interface UPDistrictMapProps {
  data: DistrictCount[];
}

export const UPDistrictMap: React.FC<UPDistrictMapProps> = ({ data }) => {
  const [hoveredDistrict, setHoveredDistrict] = useState<string | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  const countMap: Record<string, number> = {};
  data.forEach((d) => { countMap[d.district] = d.count; });
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  const hoveredData = hoveredDistrict
    ? { district: hoveredDistrict, count: countMap[hoveredDistrict] || 0 }
    : null;

  const worst = data[0];

  return (
    <div className="space-y-3">
      {/* Worst district callout */}
      {worst && (
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-destructive/8 border border-destructive/20">
          <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
          <div className="flex-1">
            <span className="text-sm font-bold text-destructive">{worst.district}</span>
            <span className="text-xs text-muted-foreground ml-2">
              {worst.count} incident{worst.count !== 1 ? "s" : ""} — highest in UP this month
            </span>
          </div>
          <span className="badge badge-destructive">Critical</span>
        </div>
      )}

      {/* Map container */}
      <div className="relative rounded-xl overflow-hidden border border-border bg-gradient-to-br from-blue-50/40 to-rose-50/30" style={{ height: 420 }}>
        <svg
          viewBox="60 20 640 430"
          className="w-full h-full"
          style={{ touchAction: "none" }}
        >
          {/* State background */}
          <rect x="60" y="20" width="640" height="430" fill="transparent" />

          {Object.entries(DISTRICT_SHAPES).map(([name, shape]) => {
            const count = countMap[name] || 0;
            const fill = heatColor(count, maxCount);
            const isHovered = hoveredDistrict === name;

            return (
              <g key={name}>
                <path
                  d={shape.path}
                  fill={fill}
                  stroke="white"
                  strokeWidth={isHovered ? 2 : 0.8}
                  opacity={isHovered ? 1 : 0.88}
                  style={{ cursor: "pointer", transition: "opacity 0.15s, stroke-width 0.15s" }}
                  onMouseEnter={(e) => {
                    setHoveredDistrict(name);
                    const rect = (e.target as SVGElement).closest("svg")!.getBoundingClientRect();
                    setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
                  }}
                  onMouseMove={(e) => {
                    const rect = (e.target as SVGElement).closest("svg")!.getBoundingClientRect();
                    setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
                  }}
                  onMouseLeave={() => setHoveredDistrict(null)}
                />
                {/* District label */}
                <text
                  x={shape.labelX}
                  y={shape.labelY - 4}
                  textAnchor="middle"
                  fontSize="6"
                  fontWeight="600"
                  fill="white"
                  style={{ pointerEvents: "none", textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}
                >
                  {name.length > 9 ? name.slice(0, 8) + "." : name}
                </text>
                {count > 0 && (
                  <text
                    x={shape.labelX}
                    y={shape.labelY + 5}
                    textAnchor="middle"
                    fontSize="7.5"
                    fontWeight="800"
                    fill="white"
                    style={{ pointerEvents: "none" }}
                  >
                    {count}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Tooltip */}
        <AnimatePresence>
          {hoveredData && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.1 }}
              className="absolute pointer-events-none z-10 bg-card border border-border rounded-lg shadow-lg px-3 py-2 text-sm"
              style={{
                left: Math.min(tooltipPos.x + 12, 320),
                top: Math.max(tooltipPos.y - 60, 4),
                minWidth: 160,
              }}
            >
              <div className="flex items-center gap-1.5 font-bold text-foreground">
                <MapPin className="h-3 w-3 text-primary" />
                {hoveredData.district}
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-muted-foreground">Cases this month</span>
                <span className="text-sm font-extrabold tabular text-foreground ml-2">
                  {hoveredData.count}
                </span>
              </div>
              <div className="mt-1">
                <span
                  className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
                  style={{
                    backgroundColor: heatColor(hoveredData.count, maxCount) + "33",
                    color: heatColor(hoveredData.count, maxCount),
                  }}
                >
                  {heatLabel(hoveredData.count, maxCount)}
                </span>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Map title overlay */}
        <div className="absolute top-2 left-3 text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">
          Uttar Pradesh — District Incident Map
        </div>
      </div>

      {/* Scrollable district list */}
      <div className="overflow-y-auto max-h-52 rounded-lg border border-border divide-y divide-border">
        {data.map((d, i) => {
          const ratio = d.count / maxCount;
          return (
            <div
              key={d.district}
              className="flex items-center gap-3 px-3 py-2 hover:bg-accent/50 transition-colors cursor-default"
            >
              <div
                className="w-2.5 h-2.5 rounded-sm shrink-0"
                style={{ backgroundColor: heatColor(d.count, maxCount) }}
              />
              <span className="text-xs font-semibold text-foreground flex-1">{d.district}</span>
              <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${(d.count / maxCount) * 100}%`,
                    backgroundColor: heatColor(d.count, maxCount),
                  }}
                />
              </div>
              <span className="text-xs font-bold tabular text-foreground w-4 text-right">
                {d.count}
              </span>
              <span className="text-[9px] uppercase tracking-wide text-muted-foreground w-12 text-right">
                {heatLabel(d.count, maxCount)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 justify-end flex-wrap">
        {[
          { label: "Low", color: "hsl(221 83% 72%)" },
          { label: "Medium", color: "hsl(38 92% 50%)" },
          { label: "High", color: "hsl(25 95% 53%)" },
          { label: "Critical", color: "hsl(0 84% 60%)" },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: l.color }} />
            <span className="text-[10px] text-muted-foreground">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UPDistrictMap;
