/** Resolve checkout returns before considering active invoices or browser caches. */
export function getPaymentReturnOrderId(search: string): number | null {
  const parameters = new URLSearchParams(search);
  const ids = parameters.getAll("order_id");
  if (ids.length === 0) {
    if (parameters.has("gateway") || parameters.has("checkout")) {
      throw new Error("Tautan pembayaran lama tidak memuat nomor tagihan. Buka Riwayat Transaksi untuk memeriksa pembayaran yang sesuai.");
    }
    return null;
  }
  const id = Number(ids[0]);
  if (ids.length !== 1 || !/^[1-9]\d*$/.test(ids[0]) || !Number.isSafeInteger(id)) {
    throw new Error("Nomor tagihan pada tautan pembayaran tidak valid. Buka Riwayat Transaksi untuk memilih tagihan yang benar.");
  }
  return id;
}
