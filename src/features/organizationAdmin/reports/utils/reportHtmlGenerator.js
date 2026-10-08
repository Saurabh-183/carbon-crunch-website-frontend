import { getSiteUnitLabel } from "../../../../utils/uiTerminology";

/**
 * Generates a comprehensive HTML report for GHG emissions inventory
 * @param {Object} reportData - The report data containing facility summaries, detailed rows, etc.
 * @param {Object} options - Additional options for report generation
 * @param {Object} options.organizationInfo - Organization information
 * @param {Object} options.period - Reporting period with startDate and endDate
 * @param {string} options.reportName - Name of the report
 * @param {Array} options.facilities - Array of facility objects
 * @returns {string} - Complete HTML string for the report
 */
export const generateHtmlReport = ({ facilitySummaries, detailedRows, organizationEmissions, productAllocations }, { organizationInfo, period, reportName, facilities }) => {
  const orgName = organizationInfo?.name || "Organization";
  const legalName = organizationInfo?.legalName || orgName;
  const registeredOffice = organizationInfo?.address || organizationInfo?.registeredOffice || "-";
  const industry = organizationInfo?.industry || organizationInfo?.businessType || "-";
  const siteUnitLabel = getSiteUnitLabel(industry, "singular");
  const siteUnitPluralLabel = getSiteUnitLabel(industry, "plural");

  const periodStart = period?.startDate;
  const periodEnd = period?.endDate;
  const periodLabel = `${periodStart || "-"} to ${periodEnd || "-"}`;

  const generatedOn = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const startYear = periodStart ? new Date(periodStart).getFullYear() : "202x";
  const endYear = periodEnd ? new Date(periodEnd).getFullYear() : "2x";
  const fyLabel = `FY ${startYear}-${String(endYear).slice(-2)}`;

  const controlTypeTotals = facilitySummaries.reduce((acc, summary) => {
    const key = summary.boundaryApproach || "Operational Control";
    if (!acc[key]) {
      acc[key] = { count: 0, emissions: 0 };
    }
    acc[key].count += 1;
    acc[key].emissions += summary.organizationShare || 0;
    return acc;
  }, {});

  const controlTypeRowsHtml = [
    {
      label: "Operational Control",
      count: controlTypeTotals["Operational Control"]?.count || 0,
      consolidation: "100%",
    },
    {
      label: "Financial Control",
      count: controlTypeTotals["Financial Control"]?.count || 0,
      consolidation: "100%",
    },
    {
      label: "Equity Share",
      count: controlTypeTotals["Equity Share"]?.count || 0,
      consolidation: "Proportionate",
    },
  ]
    .map(
      (row) => `
          <tr>
            <td>${row.label}</td>
            <td>${row.count}</td>
            <td>${row.consolidation}</td>
          </tr>`,
    )
    .join("");

  const equityShareFacilities = facilitySummaries.filter((summary) => summary.boundaryApproach === "Equity Share");
  const equityShareRowsHtml = equityShareFacilities
    .map(
      (summary) => `
          <tr>
            <td>${summary.facility?.facilityName || summary.facility?.name || siteUnitLabel}</td>
            <td>${summary.equityShare || 0}%</td>
            <td>${summary.equityShare || 0}%</td>
          </tr>`,
    )
    .join("");

  const facilityListRowsHtml = facilities
    .map((facility) => {
      const boundarySettings = facility?.boundarySettings || {};
      const boundaryApproach = boundarySettings.operationalControl
        ? "Operational Control"
        : boundarySettings.financialControl
          ? "Financial Control"
          : boundarySettings.equityShare > 0
            ? "Equity Share"
            : "Operational Control";
      return `
          <tr>
            <td>${facility.facilityName || facility.name || siteUnitLabel}</td>
            <td>${facility.facilityType || "-"}</td>
            <td>${boundaryApproach}</td>
          </tr>`;
    })
    .join("");

  const emissionsByScope = detailedRows.reduce(
    (acc, row) => {
      const value = Number(row.adjustedEmissions);
      if (!Number.isFinite(value)) return acc;
      acc[row.scope] = (acc[row.scope] || 0) + value;
      return acc;
    },
    { "Scope 1": 0, "Scope 2": 0, "Scope 3": 0 },
  );

  const emissionsByFacility = facilitySummaries.map((summary) => ({
    facility: summary.facility?.facilityName || summary.facility?.name || siteUnitLabel,
    total: summary.organizationShare || 0,
  }));

  const scope1BySource = detailedRows
    .filter((row) => row.scope === "Scope 1")
    .reduce((acc, row) => {
      const value = Number(row.adjustedEmissions);
      if (!Number.isFinite(value)) return acc;
      const key = row.source || "Source";
      acc[key] = (acc[key] || 0) + value;
      return acc;
    }, {});

  const scope3ByCategory = detailedRows
    .filter((row) => row.scope === "Scope 3")
    .reduce((acc, row) => {
      const value = Number(row.adjustedEmissions);
      if (!Number.isFinite(value)) return acc;
      const key = row.activityCategory || row.source || "Category";
      acc[key] = (acc[key] || 0) + value;
      return acc;
    }, {});

  const facilityEmissionTableRows = facilitySummaries
    .map((summary) => {
      const facilityName = summary.facility?.facilityName || summary.facility?.name || siteUnitLabel;
      const scopeTotals = detailedRows
        .filter((row) => row.facilityName === facilityName)
        .reduce(
          (acc, row) => {
            const value = Number(row.adjustedEmissions);
            if (!Number.isFinite(value)) return acc;
            acc[row.scope] = (acc[row.scope] || 0) + value;
            return acc;
          },
          { "Scope 1": 0, "Scope 2": 0, "Scope 3": 0 },
        );
      const total = Object.values(scopeTotals).reduce((sum, val) => sum + val, 0);
      return `
          <tr>
            <td>${facilityName}</td>
            <td>${scopeTotals["Scope 1"].toFixed(2)}</td>
            <td>${scopeTotals["Scope 2"].toFixed(2)}</td>
            <td>${scopeTotals["Scope 3"].toFixed(2)}</td>
            <td>${total.toFixed(2)}</td>
          </tr>`;
    })
    .join("");

  const scope1TableRows = Object.entries(scope1BySource)
    .map(
      ([source, value]) => `
          <tr>
            <td>${source}</td>
            <td>${value.toFixed(2)}</td>
          </tr>`,
    )
    .join("");

  const scope3CategoryEntries = Object.entries(scope3ByCategory)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15);

  const scope3TableRows = scope3CategoryEntries
    .map(
      ([category, value]) => `
          <tr>
            <td>${category}</td>
            <td>${value.toFixed(2)}</td>
          </tr>`,
    )
    .join("");

  const breakdownRowsHtml = detailedRows
    .map(
      (row) => `
        <tr>
          <td>${row.facilityName}</td>
          <td>${row.scope}</td>
          <td>${row.source}</td>
          <td>${row.consumption}</td>
          <td>${row.emissionFactor}</td>
          <td>${Number.isFinite(Number(row.adjustedEmissions)) ? Number(row.adjustedEmissions).toFixed(2) : "-"}</td>
        </tr>`,
    )
    .join("");

  const productAllocationRows = (productAllocations || [])
    .flatMap((item) =>
      (item.allocations || []).map(
        (allocation) => `
            <tr>
              <td>${item.startDate?.split("T")[0] || "-"}</td>
              <td>${allocation.product || "-"}</td>
              <td>-</td>
              <td>-</td>
            </tr>`,
      ),
    )
    .join("");

  const seasonalByMonth = detailedRows.reduce((acc, row) => {
    if (!row.date) return acc;
    const dateValue = row.date instanceof Date ? row.date : new Date(row.date);
    if (Number.isNaN(dateValue.getTime())) return acc;
    const monthKey = dateValue.toISOString().slice(0, 7);
    const adjustedValue = Number(row.adjustedEmissions);
    const rawValue = Number(row.emissions);
    const value = Number.isFinite(adjustedValue) ? adjustedValue : Number.isFinite(rawValue) ? rawValue : null;
    if (!Number.isFinite(value)) return acc;
    if (!acc[monthKey]) {
      acc[monthKey] = { scope1: 0, scope2: 0 };
    }
    if (row.scope === "Scope 1") acc[monthKey].scope1 += value;
    if (row.scope === "Scope 2") acc[monthKey].scope2 += value;
    return acc;
  }, {});

  const seasonalRowsHtml = Object.entries(seasonalByMonth)
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(
      ([month, values]) => `
          <tr>
            <td>${month}</td>
            <td>Aggregate Emissions</td>
            <td>${values.scope1.toFixed(2)}</td>
            <td>${values.scope2.toFixed(2)}</td>
          </tr>`,
    )
    .join("");

  return `<!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>${reportName || "GHG Inventory Report"}</title>
          <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js"></script>
          <style>
            :root { --primary: #0f766e; --border: #cbd5f5; --muted: #6b7280; }
            body { font-family: Arial, sans-serif; color: #111827; margin: 28px; line-height: 1.5; }
            h1, h2, h3 { margin: 16px 0 8px; }
            h1 { font-size: 30px; text-align: center; }
            h2 { font-size: 22px; }
            h3 { font-size: 18px; }
            .muted { color: var(--muted); }
            .section { margin-bottom: 28px; }
            .toc a { color: #0f5fbf; text-decoration: none; }
            table { width: 100%; border-collapse: collapse; margin-top: 10px; }
            th, td { border: 1px solid #e5e7eb; padding: 8px; text-align: left; font-size: 13px; vertical-align: top; }
            th { background: #f8fafc; }
            .chart-box { border: 1px solid #e5e7eb; padding: 12px; border-radius: 8px; background: #f9fafb; margin-top: 12px; }
            .chart-box canvas { width: 100% !important; height: 220px !important; max-height: 220px; }
            .page-break { page-break-before: always; }
            ul { margin: 4px 0 4px 18px; }
          </style>
        </head>
        <body>
          <h1>GHG INVENTORY REPORT</h1>
          <h2 style="text-align:center;">${orgName}</h2>
          <p style="text-align:center;">${fyLabel}<br />Generated On: ${generatedOn}</p>

          <div class="section" id="report-overview">
            <h2>1. Report Overview</h2>
            <h3>1.1 Purpose of the Report</h3>
            <p>
              This report presents the Greenhouse Gas (GHG) emissions inventory of <strong>${orgName}</strong> for the reporting period
              <strong>${periodLabel}</strong>, prepared in accordance with the <em>GHG Protocol – Corporate Accounting and Reporting Standard</em>
              and aligned with <em>ISO 14064-1</em>.
            </p>
            <h3>1.2 Reporting Period</h3>
            <ul>
              <li><strong>Start Date:</strong> ${periodStart || "-"}</li>
              <li><strong>End Date:</strong> ${periodEnd || "-"}</li>
            </ul>
            <h3>1.3 Reporting Standards</h3>
            <ul>
              <li>GHG Protocol – Corporate Accounting and Reporting Standard</li>
              <li>ISO 14064-1 (reference aligned)</li>
            </ul>
          </div>

          <div class="section toc">
            <h2>TABLE OF CONTENTS</h2>
            <ul>
              <li><a href="#report-overview">Report Overview</a></li>
              <li><a href="#organizational-information">Organizational Information</a></li>
              <li><a href="#organizational-boundary">Organizational Boundary</a></li>
              <li><a href="#operational-boundary">Operational Boundary</a></li>
              <li><a href="#facility-activity">${siteUnitLabel} & Activity Description</a></li>
              <li><a href="#special-cases">Special Operational Cases</a></li>
              <li><a href="#methodology">Methodology</a></li>
              <li><a href="#inventory-results">GHG Emissions Inventory Results</a></li>
              <li><a href="#emissions-by-facility">Emissions by ${siteUnitLabel}</a></li>
              <li><a href="#data-quality">Data Quality, Assumptions & Limitations</a></li>
              <li><a href="#validation-review">Validation & Review</a></li>
              <li><a href="#declaration">Declaration</a></li>
              <li><a href="#management-approval">Management Approval</a></li>
              <li><a href="#annexures">Annexures</a></li>
            </ul>
          </div>

          <div class="section" id="organizational-information">
            <h2>2. Organizational Information</h2>
            <ul>
              <li><strong>Legal Name:</strong> ${legalName}</li>
              <li><strong>Registered Office:</strong> ${registeredOffice}</li>
              <li><strong>Nature of Business:</strong> ${industry}</li>
            </ul>
          </div>

          <div class="section" id="organizational-boundary">
            <h2>3. Organizational Boundary</h2>
            <h3>3.1 Consolidation Approach</h3>
            <p>The organizational boundary has been defined using a hybrid approach based on operational control, financial control, and equity share, in accordance with the GHG Protocol.</p>
            <h3>3.2 Boundary Summary</h3>
            <table>
              <thead>
                <tr><th>Control Type</th><th>Number of Units</th><th>Consolidation Applied</th></tr>
              </thead>
              <tbody>
                ${controlTypeRowsHtml}
              </tbody>
            </table>
            <h3>3.3 Equity Share Details</h3>
            <table>
              <thead>
                <tr><th>Unit</th><th>Equity Holding (%)</th><th>Emissions Included (%)</th></tr>
              </thead>
              <tbody>
                ${equityShareRowsHtml || `<tr><td colspan="3">No equity share units available</td></tr>`}
              </tbody>
            </table>
            <div class="chart-box">
              <h3>Chart 1: Emissions by Control Type</h3>
              <p class="muted"><strong>Type:</strong> Stacked Bar<br /><strong>Logic:</strong> Sum tCO2e grouped by control method<br /><strong>Display Rule:</strong> Mandatory</p>
              <canvas id="chartControlType" height="120"></canvas>
            </div>
          </div>

          <div class="section" id="operational-boundary">
            <h2>4. Operational Boundary</h2>
            <h3>4.1 Scope Coverage</h3>
            <ul>
              <li><strong>Scope 1:</strong> Direct emissions from owned or controlled sources.</li>
              <li><strong>Scope 2:</strong> Indirect emissions from purchased electricity (location-based).</li>
              <li><strong>Scope 3:</strong> Other indirect emissions across the value chain.</li>
            </ul>
            <div class="chart-box">
              <h3>Chart 2: Total Emissions by Scope</h3>
              <p class="muted"><strong>Type:</strong> Donut<br /><strong>Logic:</strong> Sum emissions grouped by Scope (1, 2, 3)<br /><strong>Display Rule:</strong> Mandatory</p>
              <canvas id="chartScopeTotals" height="140"></canvas>
            </div>
          </div>

          <div class="section" id="facility-activity">
            <h2>5. ${siteUnitLabel} & Activity Description</h2>
            <h3>5.1 List of Reporting Units</h3>
            <table>
              <thead>
                <tr><th>Unit Name</th><th>${siteUnitLabel} Type</th><th>Control Approach</th></tr>
              </thead>
              <tbody>
                ${facilityListRowsHtml || `<tr><td colspan="3">No ${siteUnitPluralLabel.toLowerCase()} available</td></tr>`}
              </tbody>
            </table>
            <div class="chart-box">
              <h3>Chart 3: Emissions by ${siteUnitLabel}</h3>
              <p class="muted"><strong>Type:</strong> Horizontal Bar (Descending)<br /><strong>Logic:</strong> Total emissions per ${siteUnitLabel.toLowerCase()}<br /><strong>Display Rule:</strong> Mandatory when ${siteUnitLabel.toLowerCase()} count &gt; 1</p>
              <canvas id="chartByFacility" height="160"></canvas>
            </div>
          </div>

          <div class="section" id="special-cases">
            <h2>6. Special Operational Cases (If Applicable)</h2>
            <h3>6.1 Seasonal Production</h3>
            <p>For ${siteUnitPluralLabel.toLowerCase()} operating under multiple production modes during the reporting year, emissions have been calculated separately for each phase and aggregated annually.</p>
            <table>
              <thead>
                <tr><th>Period</th><th>Activity</th><th>Scope 1 (tCO2e)</th><th>Scope 2 (tCO2e)</th></tr>
              </thead>
              <tbody>
                ${productAllocationRows || seasonalRowsHtml || `<tr><td colspan="4">No seasonal production data available</td></tr>`}
              </tbody>
            </table>
            <div class="chart-box">
              <h3>Chart 4: Seasonal Production Emissions</h3>
              <p class="muted"><strong>Type:</strong> Monthly Stacked Column<br /><strong>Logic:</strong> Emissions grouped by month and production type<br /><strong>Display Rule:</strong> Render only if seasonal flag = TRUE</p>
              <canvas id="chartSeasonal" height="160"></canvas>
            </div>
          </div>

          <div class="section" id="methodology">
            <h2>7. Methodology</h2>
            <h3>7.1 Data Collection</h3>
            <ul>
              <li>Fuel consumption records</li>
              <li>Electricity records</li>
              <li>Production and logistics logs</li>
            </ul>
            <h3>7.2 Calculation Method</h3>
            <p class="muted">Calculated using activity data and applicable emission factors with unit conversions to tCO2e.</p>
            <h3>7.3 Emission Factors Applied</h3>
            <ul>
              <li>IPCC Guidelines</li>
              <li>National Grid Factors</li>
              <li>DEFRA / EPA (where applicable)</li>
            </ul>
          </div>

          <div class="section" id="inventory-results">
            <h2>8. GHG Emissions Inventory Results</h2>
            <h3>8.1 Total Emissions Summary</h3>
            <table>
              <thead>
                <tr><th>Scope</th><th>Emissions (tCO2e)</th></tr>
              </thead>
              <tbody>
                <tr><td>Scope 1</td><td>${emissionsByScope["Scope 1"].toFixed(2)}</td></tr>
                <tr><td>Scope 2</td><td>${emissionsByScope["Scope 2"].toFixed(2)}</td></tr>
                <tr><td>Scope 3</td><td>${emissionsByScope["Scope 3"].toFixed(2)}</td></tr>
                <tr><td><strong>Total</strong></td><td><strong>${organizationEmissions.toFixed(2)}</strong></td></tr>
              </tbody>
            </table>
            <div class="chart-box">
              <h3>Chart 5: Scope-wise Contribution</h3>
              <p class="muted"><strong>Type:</strong> Donut<br /><strong>Logic:</strong> Scope contribution to total emissions<br /><strong>Display Rule:</strong> Mandatory</p>
              <canvas id="chartScopeContribution" height="140"></canvas>
            </div>
            <h3>8.2 Scope-wise Breakdown</h3>
            <h4>8.2.1 Scope 1 – Emissions by Source</h4>
            <table>
              <thead>
                <tr><th>Source</th><th>Emissions (tCO2e)</th></tr>
              </thead>
              <tbody>
                ${scope1TableRows || `<tr><td colspan="2">No Scope 1 data available</td></tr>`}
              </tbody>
            </table>
            <div class="chart-box">
              <h3>Chart 6: Scope 1 Emissions by Source</h3>
              <p class="muted"><strong>Type:</strong> Pie<br /><strong>Display Rule:</strong> Mandatory if Scope 1 exists</p>
              <canvas id="chartScope1Sources" height="140"></canvas>
            </div>
            <h4>8.2.2 Scope 2 – Electricity Emissions</h4>
            <table>
              <thead>
                <tr><th>Electricity Method</th><th>Emissions (tCO2e)</th></tr>
              </thead>
              <tbody>
                <tr><td>Location-based</td><td>${emissionsByScope["Scope 2"].toFixed(2)}</td></tr>
                <tr><td>Market-based (if applicable)</td><td>0.00</td></tr>
              </tbody>
            </table>
            <div class="chart-box">
              <h3>Chart 7: Scope 2 – Location vs Market Based</h3>
              <p class="muted"><strong>Type:</strong> Bar<br /><strong>Display Rule:</strong> Render if renewable instruments exist</p>
              <canvas id="chartScope2Method" height="140"></canvas>
            </div>
            <h4>8.2.3 Scope 3 – Emissions by Category</h4>
            <table>
              <thead>
                <tr><th>Category</th><th>Emissions (tCO2e)</th></tr>
              </thead>
              <tbody>
                ${scope3TableRows || `<tr><td colspan="2">No Scope 3 data available</td></tr>`}
              </tbody>
            </table>
            <div class="chart-box">
              <h3>Chart 8: Scope 3 Emissions by Category</h3>
              <p class="muted"><strong>Type:</strong> Horizontal Bar<br /><strong>Display Rule:</strong> Mandatory if Scope 3 included</p>
              <canvas id="chartScope3Categories" height="160"></canvas>
            </div>
          </div>

          <div class="section" id="emissions-by-facility">
            <h2>9. Emissions by ${siteUnitLabel}</h2>
            <table>
              <thead>
                <tr><th>${siteUnitLabel}</th><th>Scope 1</th><th>Scope 2</th><th>Scope 3</th><th>Total</th></tr>
              </thead>
              <tbody>
                ${facilityEmissionTableRows || `<tr><td colspan="5">No ${siteUnitLabel.toLowerCase()} emissions available</td></tr>`}
              </tbody>
            </table>
            <div class="chart-box">
              <h3>Chart 9: ${siteUnitLabel} Hotspot Analysis</h3>
              <p class="muted"><strong>Type:</strong> Pareto Chart<br /><strong>Logic:</strong> Identify top emission contributors<br /><strong>Display Rule:</strong> Optional (Recommended)</p>
              <canvas id="chartFacilityHotspot" height="160"></canvas>
            </div>
          </div>

          <div class="section" id="data-quality">
            <h2>10. Data Quality, Assumptions & Limitations</h2>
            <p class="muted">Data quality checks were applied to submitted activity data. Assumptions and limitations are documented where source data was incomplete or estimated.</p>
          </div>

          <div class="section" id="validation-review">
            <h2>11. Validation & Review</h2>
            <ul>
              <li>[x] Completeness checks</li>
              <li>[x] Consistency validation</li>
              <li>[x] Boundary verification</li>
            </ul>
          </div>

          <div class="section" id="declaration">
            <h2>12. Declaration</h2>
            <p>This GHG emissions inventory has been prepared using data provided by the organization and is accurate to the best of management's knowledge.</p>
          </div>

          <div class="section" id="management-approval">
            <h2>13. Management Approval</h2>
            <table>
              <thead>
                <tr><th>Name</th><th>Designation</th><th>Date</th></tr>
              </thead>
              <tbody>
                <tr><td>-</td><td>-</td><td>-</td></tr>
              </tbody>
            </table>
          </div>

          <div class="section" id="annexures">
            <h2>14. Annexures</h2>
            <ul>
              <li><strong>Annexure A:</strong> Emission Factors</li>
              <li><strong>Annexure B:</strong> Activity Data</li>
              <li><strong>Annexure C:</strong> Calculation Methodology</li>
              <li><strong>Annexure D:</strong> ${siteUnitLabel} Boundary Mapping</li>
            </ul>
          </div>

          <div class="section">
            <h2>Annexure A: Emission Factors</h2>
            <table>
              <thead>
                <tr><th>Scope</th><th>Source</th><th>Unit</th><th>Emission Factor</th></tr>
              </thead>
              <tbody>
                ${
                  detailedRows
                    .slice(0, 50)
                    .map(
                      (row) => `
                      <tr>
                        <td>${row.scope}</td>
                        <td>${row.source}</td>
                        <td>${row.unit}</td>
                        <td>${row.emissionFactor}</td>
                      </tr>`,
                    )
                    .join("") || `<tr><td colspan="4">No emission factor data available</td></tr>`
                }
              </tbody>
            </table>
            <h2>Annexure B: Activity Data</h2>
            <table>
              <thead>
                <tr><th>${siteUnitLabel}</th><th>Date</th><th>Scope</th><th>Source</th><th>Consumption</th><th>Emissions (tCO2e)</th></tr>
              </thead>
              <tbody>
                ${
                  detailedRows
                    .slice(0, 100)
                    .map(
                      (row) => `
                      <tr>
                        <td>${row.facilityName}</td>
                        <td>${row.date ? row.date.toISOString().split("T")[0] : "-"}</td>
                        <td>${row.scope}</td>
                        <td>${row.source}</td>
                        <td>${row.consumption}</td>
                        <td>${Number.isFinite(Number(row.adjustedEmissions)) ? Number(row.adjustedEmissions).toFixed(2) : "-"}</td>
                      </tr>`,
                    )
                    .join("") || `<tr><td colspan="6">No activity data available</td></tr>`
                }
              </tbody>
            </table>
            <h2>Annexure C: Calculation Methodology</h2>
            <p class="muted">Emissions are calculated as: Activity Data × Emission Factor ÷ 1000, converted to tCO2e. Adjustments are applied based on organizational boundary settings.</p>
            <h2>Annexure D: ${siteUnitLabel} Boundary Mapping</h2>
            <table>
              <thead>
                <tr><th>${siteUnitLabel}</th><th>Boundary Approach</th><th>Equity Share (%)</th></tr>
              </thead>
              <tbody>
                ${
                  facilitySummaries
                    .map(
                      (summary) => `
                      <tr>
                        <td>${summary.facility?.facilityName || summary.facility?.name || siteUnitLabel}</td>
                        <td>${summary.boundaryApproach}</td>
                        <td>${summary.equityShare || 0}</td>
                      </tr>`,
                    )
                    .join("") || `<tr><td colspan="3">No ${siteUnitLabel.toLowerCase()} boundary data available</td></tr>`
                }
              </tbody>
            </table>
          </div>

          <script>
            const controlTypeLabels = ${JSON.stringify(Object.keys(controlTypeTotals))};
            const controlTypeValues = ${JSON.stringify(Object.values(controlTypeTotals).map((item) => Number(item.emissions.toFixed(2))))};
            const scopeLabels = ["Scope 1", "Scope 2", "Scope 3"];
            const scopeValues = ${JSON.stringify([emissionsByScope["Scope 1"], emissionsByScope["Scope 2"], emissionsByScope["Scope 3"]].map((val) => Number(val.toFixed(2))))};
            const facilityLabels = ${JSON.stringify(emissionsByFacility.map((item) => item.facility))};
            const facilityValues = ${JSON.stringify(emissionsByFacility.map((item) => Number(item.total.toFixed(2))))};
            const scope1Labels = ${JSON.stringify(Object.keys(scope1BySource))};
            const scope1Values = ${JSON.stringify(Object.values(scope1BySource).map((val) => Number(val.toFixed(2))))};
            const scope3Labels = ${JSON.stringify(scope3CategoryEntries.map(([category]) => category))};
            const scope3Values = ${JSON.stringify(scope3CategoryEntries.map(([, value]) => Number(value.toFixed(2))))};
            const seasonalLabels = ${JSON.stringify(Object.keys(seasonalByMonth).sort())};
            const seasonalScope1 = ${JSON.stringify(
              Object.keys(seasonalByMonth)
                .sort()
                .map((key) => Number(seasonalByMonth[key].scope1.toFixed(2))),
            )};
            const seasonalScope2 = ${JSON.stringify(
              Object.keys(seasonalByMonth)
                .sort()
                .map((key) => Number(seasonalByMonth[key].scope2.toFixed(2))),
            )};

            const buildChart = (id, config) => {
              const ctx = document.getElementById(id);
              if (!ctx) return;
              // eslint-disable-next-line no-new
              new Chart(ctx, config);
            };

            const chartOptions = { responsive: true, maintainAspectRatio: false };

            buildChart("chartControlType", {
              type: "bar",
              data: { labels: controlTypeLabels, datasets: [{ label: "Emissions (tCO2e)", data: controlTypeValues, backgroundColor: "rgba(16, 185, 129, 0.7)" }] },
              options: { ...chartOptions, indexAxis: "x" }
            });

            buildChart("chartScopeTotals", {
              type: "doughnut",
              data: { labels: scopeLabels, datasets: [{ data: scopeValues, backgroundColor: ["#22c55e", "#0ea5e9", "#f97316"] }] },
              options: chartOptions
            });

            buildChart("chartByFacility", {
              type: "bar",
              data: { labels: facilityLabels, datasets: [{ label: "tCO2e", data: facilityValues, backgroundColor: "rgba(59, 130, 246, 0.7)" }] },
              options: { ...chartOptions, indexAxis: "y" }
            });

            buildChart("chartSeasonal", {
              type: "bar",
              data: {
                labels: seasonalLabels,
                datasets: [
                  { label: "Scope 1", data: seasonalScope1, backgroundColor: "rgba(34, 197, 94, 0.7)" },
                  { label: "Scope 2", data: seasonalScope2, backgroundColor: "rgba(14, 165, 233, 0.7)" }
                ]
              },
              options: { ...chartOptions, scales: { x: { stacked: true }, y: { stacked: true } } }
            });

            buildChart("chartScopeContribution", {
              type: "doughnut",
              data: { labels: scopeLabels, datasets: [{ data: scopeValues, backgroundColor: ["#22c55e", "#0ea5e9", "#f97316"] }] },
              options: chartOptions
            });

            buildChart("chartScope1Sources", {
              type: "pie",
              data: { labels: scope1Labels, datasets: [{ data: scope1Values, backgroundColor: ["#22c55e", "#86efac", "#4ade80", "#16a34a", "#15803d"] }] },
              options: chartOptions
            });

            buildChart("chartScope2Method", {
              type: "bar",
              data: { labels: ["Location-based", "Market-based"], datasets: [{ label: "tCO2e", data: [scopeValues[1] || 0, 0], backgroundColor: ["#0ea5e9", "#93c5fd"] }] },
              options: chartOptions
            });

            buildChart("chartScope3Categories", {
              type: "bar",
              data: { labels: scope3Labels, datasets: [{ label: "tCO2e", data: scope3Values, backgroundColor: "rgba(249, 115, 22, 0.7)" }] },
              options: { ...chartOptions, indexAxis: "y" }
            });

            buildChart("chartFacilityHotspot", {
              type: "bar",
              data: { labels: facilityLabels, datasets: [{ label: "tCO2e", data: facilityValues, backgroundColor: "rgba(147, 51, 234, 0.7)" }] },
              options: chartOptions
            });
          </script>
        </body>
      </html>`;
};
