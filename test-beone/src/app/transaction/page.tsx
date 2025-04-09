"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Transaction() {
  const [trx, setTrx] = useState({ customerId: "", total: 0 });

  const handleSubmit = async () => {
    await fetch("/api/bridge/transaction", {
      method: "POST",
      body: JSON.stringify(trx),
    });
    alert("Transaksi berhasil");
  };

  return (
    <div className="max-w-md mx-auto mt-10 space-y-4">
      <h1 className="text-2xl font-bold">Input Transaksi POS</h1>
      <Input
        placeholder="ID Member"
        value={trx.customerId}
        onChange={(e) => setTrx({ ...trx, customerId: e.target.value })}
      />
      <Input
        placeholder="Total Transaksi"
        type="number"
        onChange={(e) => setTrx({ ...trx, total: parseInt(e.target.value) })}
      />
      <Button onClick={handleSubmit}>Simpan</Button>
    </div>
  );
}
