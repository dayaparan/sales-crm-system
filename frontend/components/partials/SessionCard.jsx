// components/UserSessionCard.tsx
"use client";

import { useState } from "react";
import { useSession, signIn } from "next-auth/react";

export default function UserSessionCard() {
  const { data: session, status } = useSession();
  const [showDebug, setShowDebug] = useState(false);

  if (status === "loading") {
    return (
      <div className="rounded-2xl border p-4 shadow-sm bg-[#0B1530]">
        <p className="text-sm text-gray-500">Loading session...</p>
      </div>
    );
  }

  if (status === "unauthenticated" || !session?.user) {
    return (
      <div className="rounded-2xl border p-4 shadow-sm bg-[#0B1530]">
        <p className="text-sm text-gray-500">Not signed in</p>
        <button
          className="mt-3 px-3 py-1.5 rounded-lg border text-sm hover:bg-gray-50"
          onClick={() => signIn("google")}
        >
          Sign in
        </button>
      </div>
    );
  }

  const u = session.user;
  const role = u?.role ?? "—";
  const branchLabel = role === "ADMIN" ? "All Branches" : (u.branchId || "—");

  const missingBranch = role !== "ADMIN" && !u.branchId;
  const invalidRole = u?.role && !["ADMIN", "MANAGER", "AGENT"].includes(u.role);

  return (
    <div className="rounded-2xl border p-4 md:p-6 shadow-sm bg-[#0B1530] text-white">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Signed-in User</h3>
        <span
          className={`px-2.5 py-1 rounded-full text-xs font-medium
          ${role==="ADMIN" ? "bg-blue-100 text-blue-700" :
            role==="MANAGER" ? "bg-emerald-100 text-emerald-700" :
            role==="AGENT" ? "bg-amber-100 text-amber-700" :
            "bg-gray-100 text-gray-600"}`}
        >
          {role}
        </span>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <div className="space-y-1">
          <p className="text-xs text-gray-400">Email</p>
          <p className="font-medium">{u.email || "—"}</p>
        </div>
        <div className="space-y-1 flex items-center gap-2">
          <div>
            <p className="text-xs text-gray-400">Branch</p>
            <p className="font-medium">{branchLabel}</p>
          </div>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-medium
            ${branchLabel==="All Branches" ? "bg-indigo-100 text-indigo-700" :
              branchLabel==="—" ? "bg-red-100 text-red-700" :
              "bg-green-100 text-green-700"}`}
          >
            {branchLabel==="All Branches"
              ? "Global"
              : branchLabel==="—"
                ? "Missing"
                : "Scoped"}
          </span>
        </div>
      </div>

      {(missingBranch || invalidRole) && (
        <div className="mt-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {missingBranch && <>Expected <b>branch</b> for MANAGER/AGENT but got empty.</>}
          {invalidRole && <> Role must be one of ADMIN | MANAGER | AGENT.</>}
        </div>
      )}

      {/* 🔍 Debug Toggle */}
      <div className="mt-4">
        <button
          className="text-xs underline text-gray-400 hover:text-gray-200"
          onClick={() => setShowDebug((prev) => !prev)}
        >
          {showDebug ? "Hide Debug JSON" : "Show Debug JSON"}
        </button>

        {showDebug && (
          <pre className="mt-2 text-xs bg-black/30 rounded-lg p-3 overflow-x-auto">
            {JSON.stringify(session, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
