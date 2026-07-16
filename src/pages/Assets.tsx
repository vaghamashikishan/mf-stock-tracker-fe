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
  BadgeType,
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
} from "./Assets.styled";
import { api } from "../utils/api";
import { apiPath } from "../utils/api-path";
import { showToast } from "../utils/toast";
import type { Asset, CreateAssetRequest } from "../types";

const INSTRUMENT_TYPES = ["stock", "mutual_fund"];

const PAGE_SIZE = 20;

const emptyForm: CreateAssetRequest = {
  symbol: "",
  name: "",
  instrument_type: "",
  isin: "",
  exchange: "",
  currency: "",
  external_platform_id: "",
};

const Assets = () => {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // Create / Edit dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);
  const [formData, setFormData] = useState<CreateAssetRequest>(emptyForm);
  const [formLoading, setFormLoading] = useState(false);

  // Delete confirmation dialog
  const [deleteTarget, setDeleteTarget] = useState<Asset | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Focus management refs
  const triggerRef = useRef<HTMLElement | null>(null);
  const deleteTriggerRef = useRef<HTMLElement | null>(null);
  const dialogPanelRef = useRef<HTMLDivElement>(null);
  const deletePanelRef = useRef<HTMLDivElement>(null);

  const fetchAssets = useCallback(async (currentOffset: number) => {
    setIsLoading(true);
    try {
      const res = await api.get<Asset[]>(
        `${apiPath.GET_ALL_ASSETS}?limit=${PAGE_SIZE}&offset=${currentOffset}`,
      );
      setAssets(res ?? []);
      setTotal(1000);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to load assets";
      showToast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssets(offset);
  }, [fetchAssets, offset]);

  // Close dialogs on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (dialogOpen) {
        setDialogOpen(false);
        setEditingAsset(null);
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
    setEditingAsset(null);
    setFormData(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (asset: Asset) => {
    triggerRef.current = document.activeElement as HTMLElement;
    setEditingAsset(asset);
    setFormData({
      symbol: asset.symbol,
      name: asset.name,
      instrument_type: asset.instrument_type,
      isin: asset.isin,
      exchange: asset.exchange,
      currency: asset.currency,
      external_platform_id: asset.external_platform_id,
    });
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingAsset(null);
    setFormData(emptyForm);
    triggerRef.current?.focus();
    triggerRef.current = null;
  };

  const openDelete = (asset: Asset) => {
    deleteTriggerRef.current = document.activeElement as HTMLElement;
    setDeleteTarget(asset);
  };

  const closeDeleteDialog = () => {
    setDeleteTarget(null);
    deleteTriggerRef.current?.focus();
    deleteTriggerRef.current = null;
  };

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (editingAsset) {
        const updatePayload = Object.fromEntries(
          Object.entries(formData).filter(([, v]) => v !== ""),
        );
        await api.put(apiPath.UPDATE_ASSET(editingAsset.id), updatePayload);
        showToast.success("Asset updated successfully");
      } else {
        await api.post(apiPath.CREATE_ASSET, formData);
        showToast.success("Asset created successfully");
      }
      closeDialog();
      fetchAssets(offset);
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
      await api.delete(apiPath.DELETE_ASSET(deleteTarget.id));
      showToast.success("Asset deleted");
      closeDeleteDialog();
      const newOffset =
        assets.length === 1 && offset > 0 ? offset - PAGE_SIZE : offset;
      if (newOffset !== offset) {
        setOffset(newOffset);
      } else {
        fetchAssets(offset);
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to delete asset";
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
          <PageTitle>Assets</PageTitle>
          <p
            style={{
              color: "var(--text-muted)",
              marginTop: "0.25rem",
              fontSize: "0.875rem",
            }}
          >
            Manage your stocks, mutual funds, and other instruments
          </p>
        </div>
        <AddButton onClick={openCreate}>
          <Plus size={16} />
          Add Asset
        </AddButton>
      </PageHeader>

      <TableContainer>
        <Table>
          <Thead>
            <Tr>
              <Th>Symbol</Th>
              <Th>Name</Th>
              <Th>Type</Th>
              <Th>ISIN</Th>
              <Th>Exchange</Th>
              <Th>Currency</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {isLoading ? (
              <Tr>
                <Td colSpan={7}>
                  <EmptyState>Loading assets…</EmptyState>
                </Td>
              </Tr>
            ) : assets.length === 0 ? (
              <Tr>
                <Td colSpan={7}>
                  <EmptyState>
                    No assets found. Add your first asset to get started.
                  </EmptyState>
                </Td>
              </Tr>
            ) : (
              assets.map((asset) => (
                <Tr key={asset.id}>
                  <Td>
                    <strong>{asset.symbol}</strong>
                  </Td>
                  <Td>{asset.name}</Td>
                  <Td>
                    <BadgeType $type={asset.instrument_type}>
                      {asset.instrument_type.replace(/_/g, " ")}
                    </BadgeType>
                  </Td>
                  <Td>{asset.isin}</Td>
                  <Td>{asset.exchange}</Td>
                  <Td>{asset.currency || "—"}</Td>
                  <Td>
                    <div style={{ display: "flex", gap: "0.375rem" }}>
                      <ActionButton
                        $variant="edit"
                        onClick={() => openEdit(asset)}
                        title="Edit asset"
                      >
                        <Pencil size={15} />
                      </ActionButton>
                      <ActionButton
                        $variant="delete"
                        onClick={() => openDelete(asset)}
                        title="Delete asset"
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
            aria-labelledby="asset-dialog-title"
            onClick={(e) => e.stopPropagation()}
          >
            <DialogHeader>
              <DialogTitle id="asset-dialog-title">
                {editingAsset ? "Edit Asset" : "Add Asset"}
              </DialogTitle>
              <DialogClose onClick={closeDialog} aria-label="Close dialog">
                <X size={20} />
              </DialogClose>
            </DialogHeader>

            <form onSubmit={handleSubmit}>
              <FormGrid>
                <FormGroup>
                  <FormLabel htmlFor="symbol">
                    Symbol <span style={{ color: "#ef4444" }}>*</span>
                  </FormLabel>
                  <FormInput
                    id="symbol"
                    name="symbol"
                    required
                    placeholder="e.g. RELIANCE"
                    value={formData.symbol}
                    onChange={handleFormChange}
                  />
                </FormGroup>

                <FormGroup>
                  <FormLabel htmlFor="instrument_type">
                    Type <span style={{ color: "#ef4444" }}>*</span>
                  </FormLabel>
                  <FormSelect
                    id="instrument_type"
                    name="instrument_type"
                    required
                    value={formData.instrument_type}
                    onChange={handleFormChange}
                  >
                    <option value="">Select type…</option>
                    {INSTRUMENT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t.replace(/_/g, " ")}
                      </option>
                    ))}
                  </FormSelect>
                </FormGroup>

                <FormGroupFull>
                  <FormLabel htmlFor="name">
                    Name <span style={{ color: "#ef4444" }}>*</span>
                  </FormLabel>
                  <FormInput
                    id="name"
                    name="name"
                    required
                    placeholder="e.g. Reliance Industries Ltd"
                    value={formData.name}
                    onChange={handleFormChange}
                  />
                </FormGroupFull>

                <FormGroup>
                  <FormLabel htmlFor="isin">
                    ISIN <span style={{ color: "#ef4444" }}>*</span>
                  </FormLabel>
                  <FormInput
                    id="isin"
                    name="isin"
                    required
                    placeholder="e.g. INE002A01018"
                    value={formData.isin}
                    onChange={handleFormChange}
                  />
                </FormGroup>

                <FormGroup>
                  <FormLabel htmlFor="exchange">
                    Exchange <span style={{ color: "#ef4444" }}>*</span>
                  </FormLabel>
                  <FormInput
                    id="exchange"
                    name="exchange"
                    required
                    placeholder="e.g. NSE"
                    value={formData.exchange}
                    onChange={handleFormChange}
                  />
                </FormGroup>

                <FormGroup>
                  <FormLabel htmlFor="currency">Currency</FormLabel>
                  <FormInput
                    id="currency"
                    name="currency"
                    placeholder="e.g. INR"
                    value={formData.currency}
                    onChange={handleFormChange}
                  />
                </FormGroup>

                <FormGroup>
                  <FormLabel htmlFor="external_platform_id">
                    External Platform ID
                  </FormLabel>
                  <FormInput
                    id="external_platform_id"
                    name="external_platform_id"
                    placeholder="e.g. platform-123"
                    value={formData.external_platform_id}
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
                    ? editingAsset
                      ? "Updating…"
                      : "Creating…"
                    : editingAsset
                      ? "Update Asset"
                      : "Create Asset"}
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
            aria-labelledby="delete-dialog-title"
            onClick={(e) => e.stopPropagation()}
          >
            <DialogHeader>
              <DialogTitle id="delete-dialog-title">Delete Asset</DialogTitle>
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
              Are you sure you want to delete{" "}
              <strong style={{ color: "var(--text-default)" }}>
                {deleteTarget.name} ({deleteTarget.symbol})
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

export default Assets;
