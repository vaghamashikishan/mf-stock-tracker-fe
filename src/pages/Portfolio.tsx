import { useState, useEffect } from "react";
import {
  PageWrapper,
  PageHeader,
  PageTitle,
  TableContainer,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  BadgeType,
  EmptyState,
} from "./Portfolio.styled";
import { api } from "../utils/api";
import { apiPath } from "../utils/api-path";
import { showToast } from "../utils/toast";
import type { Holding } from "../types";

const fmt = (n: number) =>
  n.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const Portfolio = () => {
  const [holdings, setHoldings] = useState<Holding[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchHoldings = async () => {
      setIsLoading(true);
      try {
        const data = await api.get<Holding[]>(apiPath.GET_HOLDINGS);
        setHoldings(Array.isArray(data) ? data : []);
      } catch (err: unknown) {
        showToast.error(
          err instanceof Error ? err.message : "Failed to load holdings",
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchHoldings();
  }, []);

  return (
    <PageWrapper>
      <PageHeader>
        <PageTitle>Portfolio</PageTitle>
      </PageHeader>

      <TableContainer>
        <Table>
          <Thead>
            <Tr>
              <Th>#</Th>
              <Th>Asset Name</Th>
              <Th>Type</Th>
              <Th>Quantity</Th>
              <Th>Avg. Price</Th>
              <Th>Current Price</Th>
              <Th>Invested Capital</Th>
              <Th>Current Value</Th>
              <Th>Return</Th>
            </Tr>
          </Thead>
          <Tbody>
            {isLoading ? (
              <Tr>
                <Td colSpan={9}>
                  <EmptyState>Loading…</EmptyState>
                </Td>
              </Tr>
            ) : holdings.length === 0 ? (
              <Tr>
                <Td colSpan={9}>
                  <EmptyState>
                    No holdings found. Start by adding transactions.
                  </EmptyState>
                </Td>
              </Tr>
            ) : (
              holdings.map((holding, idx) => (
                <Tr key={holding.id}>
                  <Td style={{ color: "var(--text-muted)" }}>{idx + 1}</Td>
                  <Td style={{ fontWeight: 600 }}>{holding.asset_name}</Td>
                  <Td>
                    <BadgeType
                      $type={holding.asset_instrument_type.toUpperCase()}
                    >
                      {holding.asset_instrument_type.replace(/_/g, " ")}
                    </BadgeType>
                  </Td>
                  <Td>{holding.quantity}</Td>
                  <Td>₹{fmt(holding.average_price)}</Td>
                  <Td>₹{fmt(holding.current_price)}</Td>
                  <Td>₹{fmt(holding.invested_capital)}</Td>
                  <Td>₹{fmt(holding.current_capital)}</Td>
                  <Td
                    style={{
                      color:
                        holding.return_percentage > 0
                          ? "#059669"
                          : holding.return_percentage < 0
                            ? "#dc2626"
                            : "var(--text-muted)",
                      fontWeight: 600,
                    }}
                  >
                    {holding.return_percentage > 0 ? "+" : ""}
                    {fmt(holding.return_percentage)}%
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </TableContainer>
    </PageWrapper>
  );
};

export default Portfolio;
