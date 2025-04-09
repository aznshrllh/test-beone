"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function Register() {
  const [form, setForm] = useState({ name: "", email: "" });

  const handleSubmit = async () => {
    await fetch("/api/bridge/register", {
      method: "POST",
      body: JSON.stringify(form),
    });
    alert("Customer berhasil terdaftar");
  };

  return (
    <div className="max-w-md mx-auto mt-10 space-y-4">
      <h1 className="text-2xl font-bold">Registrasi Member</h1>
      <Input
        placeholder="Nama"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
      />
      <Input
        placeholder="Email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
      />
      <Button onClick={handleSubmit}>Daftar</Button>
    </div>
  );
}
