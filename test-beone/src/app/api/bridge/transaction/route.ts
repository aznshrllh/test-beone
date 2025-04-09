export async function POST(req: Request) {
  const body = await req.json();

  // Simulasi pengiriman transaksi
  console.log("Simpan Invoice ke ERP:", body);
  console.log("Update point ke CRM:", body);

  return Response.json({ message: "Transaction synced to ERP and CRM" });
}
