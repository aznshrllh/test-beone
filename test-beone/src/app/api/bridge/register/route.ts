export async function POST(req: Request) {
  const body = await req.json();

  // Simulasi POST ke CRM, ERP, POS (mock endpoint)
  console.log("Mendaftarkan ke CRM:", body);
  console.log("Mendaftarkan ke ERP:", body);
  console.log("Mendaftarkan ke POS:", body);

  return Response.json({ message: "Customer registered to all systems" });
}
