import { useState, useEffect, useCallback, useRef } from "react";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import {
  PageWrapper,
  PageHeader,
  PageTitle,
  AddButton,
  TableContainer,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  ActionButton,
  EmptyState,
  PaginationWrapper,
  PaginationButton,
  PageInfo,
  DialogOverlay,
  DialogPanel,
  DialogHeader,
  DialogTitle,
  DialogClose,
  FormGrid,
  FormGroup,
  FormGroupFull,
  FormLabel,
  FormInput,
  FormSelect,
  ButtonRow,
  SubmitButton,
  CancelButton,
  DeleteConfirmButton,
  BadgeTxnType,
  BadgeType,
} from "./Transactions.styled";
import { api } from "../utils/api";
import { apiPath } from "../utils/api-path";
import { showToast } from "../utils/toast";
import type { Asset, Transaction, CreateTransactionRequest } from "../types";

const TXN_TYPES = ["BUY", "SELL"];

const PAGE_SIZE = 20;

const emptyForm: CreateTransactionRequest = {
  asset_id: 0,
  txn_type: "",
  quantity: 0,
  price: 0,
  txn_date: "",
};

/** Convert "YYYY-MM-DD" to "YYYY-MM-DDT00:00:00Z" for the backend */
const toISODate = (dateStr: string): string => `${dateStr}T00:00:00Z`;

/** Extract "YYYY-MM-DD" from an ISO datetime string for the date input */
const toDateInputValue = (isoStr: string): string => isoStr.slice(0, 10);

const Transactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Assets for the dropdown
  const [assets, setAssets] = useState<Asset[]>([]);

  // Create / Edit dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTxn, setEditingTxn] = useState<Transaction | null>(null);
  const [formData, setFormData] = useState<CreateTransactionRequest>(emptyForm);
  const [formLoading, setFormLoading] = useState(false);

  // Delete confirmation dialog
  const [deleteTarget, setDeleteTarget] = useState<Transaction | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Focus management refs
  const triggerRef = useRef<HTMLElement | null>(null);
  const deleteTriggerRef = useRef<HTMLElement | null>(null);
  const dialogPanelRef = useRef<HTMLDivElement>(null);
  const deletePanelRef = useRef<HTMLDivElement>(null);

  const fetchTransactions = useCallback(async (currentOffset: number) => {
    setIsLoading(true);
    try {
      const res = await api.get<Transaction[]>(
        `${apiPath.GET_ALL_TRANSACTIONS}?limit=${PAGE_SIZE}&offset=${currentOffset}`,
      );
      setTransactions(res ?? []);
      setTotal(1000);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load transactions";
      showToast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchAssets = useCallback(async () => {
    try {
      const res = await api.get<Asset[]>(
        `${apiPath.GET_ALL_ASSETS}?limit=200&offset=0`,
      );
      setAssets(res ?? []);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load assets";
      showToast.error(message);
    }
  }, []);

  useEffect(() => {
    fetchTransactions(offset);
  }, [fetchTransactions, offset]);

  useEffect(() => {
    fetchAssets();
  }, [fetchAssets]);

  // Close dialogs on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (dialogOpen) {
        setDialogOpen(false);
        setEditingTxn(null);
        setFormData(emptyForm);
        triggerRef.current?.focus();
        triggerRef.current = null;
      } else if (deleteTarget) {
        setDeleteTarget(null);
        deleteTriggerRef.current?.focus();
        deleteTriggerRef.current = null;
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [dialogOpen, deleteTarget]);

  // Focus first element + trap Tab inside create/edit dialog
  useEffect(() => {
    if (!dialogOpen || !dialogPanelRef.current) return;
    const panel = dialogPanelRef.current;
    const getFocusable = () =>
      Array.from(
        panel.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
        ),
      );
    getFocusable()[0]?.focus();
    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const focusable = getFocusable();
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    panel.addEventListener("keydown", handleTab);
    return () => panel.removeEventListener("keydown", handleTab);
  }, [dialogOpen]);

  // Focus first element + trap Tab inside delete dialog
  useEffect(() => {
    if (!deleteTarget || !deletePanelRef.current) return;
    const panel = deletePanelRef.current;
    const getFocusable = () =>
      Array.from(
        panel.querySelectorAll<HTMLElement>(
          'button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
        ),
      );
    getFocusable()[0]?.focus();
    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const focusable = getFocusable();
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    panel.addEventListener("keydown", handleTab);
    return () => panel.removeEventListener("keydown", handleTab);
  }, [deleteTarget]);

  const openCreate = () => {
    triggerRef.current = document.activeElement as HTMLElement;
    setEditingTxn(null);
    setFormData(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (txn: Transaction) => {
    triggerRef.current = document.activeElement as HTMLElement;
    setEditingTxn(txn);
    setFormData({
      asset_id: txn.user_asset_id,
      txn_type: txn.txn_type,
      quantity: txn.quantity,
      price: txn.price,
      txn_date: toDateInputValue(txn.txn_date),
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingTxn(null);
    setFormData(emptyForm);
    triggerRef.current?.focus();
    triggerRef.current = null;
  };

  const openDelete = (txn: Transaction) => {
    deleteTriggerRef.current = document.activeElement as HTMLElement;
    setDeleteTarget(txn);
  };

  const closeDeleteDialog = () => {
    setDeleteTarget(null);
    deleteTriggerRef.current?.focus();
    deleteTriggerRef.current = null;
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "asset_id"
          ? Number(value)
          : name === "quantity" || name === "price"
            ? value === ""
              ? 0
              : Number(value)
            : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (editingTxn) {
        const updatePayload: Record<string, unknown> = { id: editingTxn.id };
        if (formData.txn_type) updatePayload.txn_type = formData.txn_type;
        if (formData.quantity > 0) updatePayload.quantity = formData.quantity;
        if (formData.price > 0) updatePayload.price = formData.price;
        if (formData.txn_date)
          updatePayload.txn_date = toISODate(formData.txn_date);
        await api.put(apiPath.UPDATE_TRANSACTION(editingTxn.id), updatePayload);
        showToast.success("Transaction updated successfully");
      } else {
        await api.post(apiPath.CREATE_TRANSACTION, {
          ...formData,
          txn_date: toISODate(formData.txn_date),
        });
        showToast.success("Transaction created successfully");
      }
      closeDialog();
      fetchTransactions(offset);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Operation failed";
      showToast.error(message);
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await api.delete(apiPath.DELETE_TRANSACTION(deleteTarget.id));
      showToast.success("Transaction deleted");
      closeDeleteDialog();
      const newOffset =
        transactions.length === 1 && offset > 0 ? offset - PAGE_SIZE : offset;
      if (newOffset !== offset) {
        setOffset(newOffset);
      } else {
        fetchTransactions(offset);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete transaction";
      showToast.error(message);
    } finally {
      setDeleteLoading(false);
    }
  };

  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const startItem = total === 0 ? 0 : offset + 1;
  const endItem = Math.min(offset + PAGE_SIZE, total);

  return (
    <PageWrapper>
      <PageHeader>
        <div>
          <PageTitle>Transactions</PageTitle>
          <p
            style={{
              color: "var(--text-muted)",
              marginTop: "0.25rem",
              fontSize: "0.875rem",
            }}
          >
            Track your buy and sell activity across all assets
          </p>
        </div>
        <AddButton onClick={openCreate}>
          <Plus size={16} />
          Add Transaction
        </AddButton>
      </PageHeader>

      <TableContainer>
        <Table>
          <Thead>
            <Tr>
              <Th>#</Th>
              <Th>Asset</Th>
              <Th>Type</Th>
              <Th>Quantity</Th>
              <Th>Price</Th>
              <Th>Date</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {isLoading ? (
              <Tr>
                <Td colSpan={7}>
                  <EmptyState>Loading transactions…</EmptyState>
                </Td>
              </Tr>
            ) : transactions.length === 0 ? (
              <Tr>
                <Td colSpan={7}>
                  <EmptyState>
                    No transactions found. Add your first transaction to get
                    started.
                  </EmptyState>
                </Td>
              </Tr>
            ) : (
              transactions.map((txn, idx) => (
                <Tr key={txn.id}>
                  <Td style={{ color: "var(--text-muted)" }}>
                    {offset + idx + 1}
                  </Td>
                  <Td>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        gap: "0.25rem",
                      }}
                    >
                      <strong>{txn.asset_name}</strong>
                      <BadgeType $type={txn.asset_instrument_type}>
                        {txn.asset_instrument_type.replace(/_/g, " ")}
                      </BadgeType>
                    </div>
                  </Td>
                  <Td>
                    <BadgeTxnType $type={txn.txn_type}>
                      {txn.txn_type}
                    </BadgeTxnType>
                  </Td>
                  <Td>{txn.quantity}</Td>
                  <Td>{txn.price}</Td>
                  <Td>
                    {new Date(txn.txn_date).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </Td>
                  <Td>
                    <div style={{ display: "flex", gap: "0.375rem" }}>
                      <ActionButton
                        $variant="edit"
                        onClick={() => openEdit(txn)}
                        title="Edit transaction"
                        aria-label="Edit transaction"
                      >
                        <Pencil size={15} />
                      </ActionButton>
                      <ActionButton
                        $variant="delete"
                        onClick={() => openDelete(txn)}
                        title="Delete transaction"
                        aria-label="Delete transaction"
                      >
                        <Trash2 size={15} />
                      </ActionButton>
                    </div>
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </TableContainer>

      {total > 0 && (
        <PaginationWrapper>
          <PageInfo>
            {startItem}–{endItem} of {total}
          </PageInfo>
          <div
            style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}
          >
            <PaginationButton
              disabled={offset === 0}
              onClick={() => setOffset(Math.max(0, offset - PAGE_SIZE))}
            >
              Previous
            </PaginationButton>
            <span
              style={{
                fontSize: "0.875rem",
                color: "var(--text-muted)",
                whiteSpace: "nowrap",
              }}
            >
              Page {currentPage} of {totalPages}
            </span>
            <PaginationButton
              disabled={offset + PAGE_SIZE >= total}
              onClick={() => setOffset(offset + PAGE_SIZE)}
            >
              Next
            </PaginationButton>
          </div>
        </PaginationWrapper>
      )}

      {/* ── Create / Edit Dialog ─────────────────────── */}
      {dialogOpen && (
        <DialogOverlay onClick={closeDialog}>
          <DialogPanel
            ref={dialogPanelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="txn-dialog-title"
            onClick={(e) => e.stopPropagation()}
          >
            <DialogHeader>
              <DialogTitle id="txn-dialog-title">
                {editingTxn ? "Edit Transaction" : "Add Transaction"}
              </DialogTitle>
              <DialogClose onClick={closeDialog} aria-label="Close dialog">
                <X size={20} />
              </DialogClose>
            </DialogHeader>

            <form onSubmit={handleSubmit}>
              <FormGrid>
                {!editingTxn && (
                  <FormGroupFull>
                    <FormLabel htmlFor="asset_id">
                      Asset{" "}
                      <span style={{ color: "var(--color-danger)" }}>*</span>
                    </FormLabel>
                    <FormSelect
                      id="asset_id"
                      name="asset_id"
                      required
                      value={formData.asset_id === 0 ? "" : formData.asset_id}
                      onChange={handleFormChange}
                    >
                      <option value="">Select asset…</option>
                      {assets.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.symbol} – {a.name}
                        </option>
                      ))}
                    </FormSelect>
                  </FormGroupFull>
                )}

                <FormGroup>
                  <FormLabel htmlFor="txn_type">
                    Type <span style={{ color: "#ef4444" }}>*</span>
                  </FormLabel>
                  <FormSelect
                    id="txn_type"
                    name="txn_type"
                    required
                    value={formData.txn_type}
                    onChange={handleFormChange}
                  >
                    <option value="">Select type…</option>
                    {TXN_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </FormSelect>
                </FormGroup>

                <FormGroup>
                  <FormLabel htmlFor="txn_date">
                    Date <span style={{ color: "#ef4444" }}>*</span>
                  </FormLabel>
                  <FormInput
                    id="txn_date"
                    name="txn_date"
                    type="date"
                    required
                    value={formData.txn_date}
                    onChange={handleFormChange}
                  />
                </FormGroup>

                <FormGroup>
                  <FormLabel htmlFor="quantity">
                    Quantity <span style={{ color: "#ef4444" }}>*</span>
                  </FormLabel>
                  <FormInput
                    id="quantity"
                    name="quantity"
                    type="number"
                    step="any"
                    min="0"
                    required
                    placeholder="e.g. 10"
                    value={formData.quantity === 0 ? "" : formData.quantity}
                    onChange={handleFormChange}
                  />
                </FormGroup>

                <FormGroup>
                  <FormLabel htmlFor="price">
                    Price <span style={{ color: "#ef4444" }}>*</span>
                  </FormLabel>
                  <FormInput
                    id="price"
                    name="price"
                    type="number"
                    step="any"
                    min="0"
                    required
                    placeholder="e.g. 2500.50"
                    value={formData.price === 0 ? "" : formData.price}
                    onChange={handleFormChange}
                  />
                </FormGroup>
              </FormGrid>

              <ButtonRow>
                <CancelButton type="button" onClick={closeDialog}>
                  Cancel
                </CancelButton>
                <SubmitButton type="submit" disabled={formLoading}>
                  {formLoading
                    ? editingTxn
                      ? "Updating…"
                      : "Creating…"
                    : editingTxn
                      ? "Update Transaction"
                      : "Create Transaction"}
                </SubmitButton>
              </ButtonRow>
            </form>
          </DialogPanel>
        </DialogOverlay>
      )}

      {/* ── Delete Confirmation Dialog ───────────────── */}
      {deleteTarget && (
        <DialogOverlay onClick={closeDeleteDialog}>
          <DialogPanel
            $compact
            ref={deletePanelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-txn-dialog-title"
            onClick={(e) => e.stopPropagation()}
          >
            <DialogHeader>
              <DialogTitle id="delete-txn-dialog-title">
                Delete Transaction
              </DialogTitle>
              <DialogClose
                onClick={closeDeleteDialog}
                aria-label="Close dialog"
              >
                <X size={20} />
              </DialogClose>
            </DialogHeader>

            <p
              style={{
                color: "var(--text-subtle)",
                fontSize: "0.9rem",
                lineHeight: "1.6",
                marginBottom: "1.5rem",
              }}
            >
              Are you sure you want to delete this{" "}
              <strong style={{ color: "var(--text-default)" }}>
                {deleteTarget.txn_type}
              </strong>{" "}
              transaction for{" "}
              <strong style={{ color: "var(--text-default)" }}>
                {deleteTarget.asset_name}
              </strong>
              ? This action cannot be undone.
            </p>

            <ButtonRow>
              <CancelButton type="button" onClick={closeDeleteDialog}>
                Cancel
              </CancelButton>
              <DeleteConfirmButton
                onClick={handleDelete}
                disabled={deleteLoading}
              >
                {deleteLoading ? "Deleting…" : "Delete"}
              </DeleteConfirmButton>
            </ButtonRow>
          </DialogPanel>
        </DialogOverlay>
      )}
    </PageWrapper>
  );
};

export default Transactions;
