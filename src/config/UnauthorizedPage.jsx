import React from "react";
import { Link } from "react-router-dom";

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#EFEEE3]">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-[#3E2723]">
          403
        </h1>

        <p className="mt-2 text-[#6F6864]">
          You don't have permission to access this page.
        </p>

        <Link
          to="/"
          className="inline-block mt-5 px-5 py-2.5 bg-[#3E2723] text-white rounded-full text-sm"
        >
          Back Home
        </Link>
      </div>
    </div>
  );
}