import { useState, useEffect, useMemo, useCallback } from "react";
import ThemeToggle from "../components/ThemeToggle";
import { api } from "../utils/api";
import { showToast } from "../utils/toast";
import type { Holding, Transaction } from "../types";
import {
  computeKPIs,
  groupByInstrumentType,
  buildTimeSeries,
  buildHeatmap,
  type Granularity,
} from "../utils/dashboard";
import {
  DashboardWrapper,
  DashboardHeader,
  DashboardTitle,
  SectionDivider,
  SectionHeading,
  Breadcrumb,
  BreadcrumbLink,
} from "./Dashboard.styled";
import KPICards from "../components/dashboard/KPICards";
import InstrumentCharts from "../components/dashboard/InstrumentCharts";
import AssetCharts from "../components/dashboard/AssetCharts";
import TransactionCharts from "../components/dashboard/TransactionCharts";
import DashboardFilters from "../components/dashboard/DashboardFilters";
import AssetTransactionPanel from "../components/dashboard/AssetTransactionPanel";
import { apiPath } from "../utils/api-path";

const Dashboard = () => {
  // ─── Data ─────────────────────────────────────────────────────────────────
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loadingHoldings, setLoadingHoldings] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      setLoadingHoldings(true);
      try {
        const h = await api.get<Holding[]>(apiPath.GET_HOLDINGS);
        setHoldings(Array.isArray(h) ? h : []);
      } catch (err) {
        showToast.error(
          err instanceof Error ? err.message : "Failed to load holdings",
        );
      } finally {
        setLoadingHoldings(false);
      }

      try {
        const t = await api.get<Transaction[]>(apiPath.GET_ALL_TRANSACTIONS);
        setTransactions(Array.isArray(t) ? t : []);
      } catch (err) {
        showToast.error(
          err instanceof Error ? err.message : "Failed to load transactions",
        );
      }
    };
    fetchAll();
  }, []);

  // ─── Derived instrument types list ───────────────────────────────────────
  const instrumentTypes = useMemo(
    () =>
      Array.from(new Set(holdings.map((h) => h.asset_instrument_type))).sort(),
    [holdings],
  );

  // ─── Filter state ─────────────────────────────────────────────────────────
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [assetSearch, setAssetSearch] = useState("");
  const [granularity, setGranularity] = useState<Granularity>("month");
  const [volumeMode, setVolumeMode] = useState<"count" | "value">("value");

  // ─── Drill-down state ────────────────────────────────────────────────────
  const [drillType, setDrillType] = useState<string | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null);

  const handleTypeToggle = useCallback((type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type],
    );
  }, []);

  const handleSliceClick = useCallback((type: string) => {
    setDrillType((prev) => (prev === type ? null : type));
  }, []);

  const handleAssetClick = useCallback((assetName: string) => {
    setSelectedAsset(assetName);
  }, []);

  // ─── Filtered holdings ───────────────────────────────────────────────────
  const holdingsFiltered = useMemo(() => {
    let h = holdings;
    if (selectedTypes.length > 0) {
      h = h.filter((x) => selectedTypes.includes(x.asset_instrument_type));
    }
    if (assetSearch.trim()) {
      const q = assetSearch.toLowerCase();
      h = h.filter((x) => x.asset_name.toLowerCase().includes(q));
    }
    return h;
  }, [holdings, selectedTypes, assetSearch]);

  const kpis = useMemo(() => computeKPIs(holdingsFiltered), [holdingsFiltered]);
  const instrumentGroups = useMemo(
    () => groupByInstrumentType(holdingsFiltered),
    [holdingsFiltered],
  );

  const dateRange = useMemo<[string, string] | null>(
    () => (dateFrom && dateTo ? [dateFrom, dateTo] : null),
    [dateFrom, dateTo],
  );

  const timeSeries = useMemo(
    () => buildTimeSeries(transactions, granularity, dateRange, selectedTypes),
    [transactions, granularity, dateRange, selectedTypes],
  );

  const heatmap = useMemo(() => buildHeatmap(transactions), [transactions]);

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <DashboardWrapper>
      {/* Header */}
      <DashboardHeader>
        <DashboardTitle>Portfolio Dashboard</DashboardTitle>
        <ThemeToggle />
      </DashboardHeader>

      {/* Section 6 — Global filters */}
      <DashboardFilters
        instrumentTypes={instrumentTypes}
        selectedTypes={selectedTypes}
        onTypeToggle={handleTypeToggle}
        dateFrom={dateFrom}
        dateTo={dateTo}
        onDateFromChange={setDateFrom}
        onDateToChange={setDateTo}
        assetSearch={assetSearch}
        onAssetSearchChange={setAssetSearch}
      />

      {/* Section 1 — KPI Cards */}
      <KPICards kpis={kpis} loading={loadingHoldings} />

      {/* Section 2 — Instrument Type Charts */}
      <SectionDivider>
        <SectionHeading>Instrument Type Analysis</SectionHeading>
      </SectionDivider>
      <InstrumentCharts
        groups={instrumentGroups}
        onSliceClick={handleSliceClick}
      />

      {/* Section 3 — Asset Charts */}
      <SectionDivider>
        <SectionHeading>
          Asset Performance
          {drillType && (
            <Breadcrumb
              as="span"
              style={{ display: "inline-flex", marginLeft: "1rem" }}
            >
              <BreadcrumbLink onClick={() => setDrillType(null)}>
                All
              </BreadcrumbLink>
              <span style={{ color: "var(--text-muted)" }}>›</span>
              <span style={{ color: "var(--text-default)" }}>{drillType}</span>
            </Breadcrumb>
          )}
        </SectionHeading>
      </SectionDivider>
      <AssetCharts
        holdings={holdingsFiltered}
        instrumentFilter={drillType}
        onAssetClick={handleAssetClick}
      />

      {/* Section 4 — Transaction Charts */}
      <SectionDivider>
        <SectionHeading>Transaction Activity</SectionHeading>
      </SectionDivider>
      <TransactionCharts
        timeSeries={timeSeries}
        heatmap={heatmap}
        granularity={granularity}
        onGranularityChange={setGranularity}
        volumeMode={volumeMode}
        onVolumeModeChange={setVolumeMode}
        instrumentTypes={instrumentTypes}
      />

      {/* Section 5 — Asset transaction side panel */}
      {selectedAsset && (
        <AssetTransactionPanel
          assetName={selectedAsset}
          transactions={transactions}
          onClose={() => setSelectedAsset(null)}
        />
      )}
    </DashboardWrapper>
  );
};

export default Dashboard;
