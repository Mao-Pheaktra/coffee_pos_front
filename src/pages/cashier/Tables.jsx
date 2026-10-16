import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Loader2,
  Users,
  Eye,
  Plus,
  LogIn,
  Ban,
  RefreshCw,
  LayoutGrid,
  Sparkles,
  Clock,
  DollarSign,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import {
  getCashierTables,
  getTableSessions,
  createTableSession,
} from "../../services/cashierService";

// ============================================
// HELPERS
// ============================================

const normalizeStatus = (value) => {
  return String(value || "")
    .trim()
    .toUpperCase();
};

// ============================================
// TABLE STATUS
// ============================================

const getTableStatus = (table, allSessions = []) => {
  const rawStatus = normalizeStatus(
    table?.status ||
      table?.table_status ||
      table?.availability_status
  );

  /*
   * First check whether this table has an ACTIVE session.
   *
   * ACTIVE session always means UNAVAILABLE.
   */
  const activeSession = getActiveSession(
    table,
    allSessions
  );

  if (activeSession) {
    return "UNAVAILABLE";
  }

  /*
   * Normal table status.
   */

  if (rawStatus === "OCCUPIED") {
    return "OCCUPIED";
  }

  if (
    rawStatus === "UNAVAILABLE" ||
    rawStatus === "BUSY"
  ) {
    return "UNAVAILABLE";
  }

  if (rawStatus === "RESERVED") {
    return "RESERVED";
  }

  if (
    rawStatus === "INACTIVE" ||
    rawStatus === "DISABLED"
  ) {
    return "INACTIVE";
  }

  return "AVAILABLE";
};
// ============================================
// TABLE NAME
// ============================================

const getTableName = (table) => {
  return (
    table?.name ||
    table?.table_number ||
    table?.tableNumber ||
    table?.code ||
    `Table ${table?.id}`
  );
};

// ============================================
// SEATS
// ============================================

const getSeatCount = (table) => {
  return (
    table?.seats ??
    table?.capacity ??
    table?.number_of_seats ??
    table?.max_guests ??
    0
  );
};

// ============================================
// AMOUNT
// ============================================

const getAmount = (table) => {
  const amount =
    table?.amount ??
    table?.total_amount ??
    table?.current_amount ??
    table?.order_total;

  if (
    amount === null ||
    amount === undefined ||
    amount === ""
  ) {
    return null;
  }

  const number = Number(amount);

  if (Number.isNaN(number)) {
    return amount;
  }

  return `$${number.toFixed(2)}`;
};

// ============================================
// GET TABLE ID FROM SESSION
// ============================================

const getSessionTableId = (session) => {
  return (
    session?.table_id ??
    session?.cafe_table_id ??
    session?.table?.id ??
    session?.cafe_table?.id ??
    session?.cafeTable?.id ??
    null
  );
};

// ============================================
// CHECK SESSION ACTIVE
// ============================================

const isSessionActive = (session) => {
  if (!session) {
    return false;
  }

  const status = normalizeStatus(
    session?.status
  );

  /*
   * Your backend should normally return ACTIVE.
   *
   * If status is missing, we treat it as active
   * because some Laravel responses may not expose it.
   */

  if (!status) {
    return true;
  }

  return (
    status === "ACTIVE" ||
    status === "OPEN"
  );
};

// ============================================
// FIND ACTIVE SESSION INSIDE TABLE
// ============================================

const getEmbeddedActiveSession = (table) => {
  if (
    table?.active_session &&
    isSessionActive(table.active_session)
  ) {
    return table.active_session;
  }

  if (
    table?.activeSession &&
    isSessionActive(table.activeSession)
  ) {
    return table.activeSession;
  }

  if (
    table?.table_session &&
    isSessionActive(table.table_session)
  ) {
    return table.table_session;
  }

  if (
    table?.tableSession &&
    isSessionActive(table.tableSession)
  ) {
    return table.tableSession;
  }

  const sessions =
    table?.table_sessions ||
    table?.tableSessions ||
    table?.sessions ||
    [];

  if (Array.isArray(sessions)) {
    return (
      sessions.find(
        (session) =>
          isSessionActive(session)
      ) || null
    );
  }

  return null;
};

// ============================================
// FIND ACTIVE SESSION
// ============================================

const getActiveSession = (
  table,
  allSessions = []
) => {
  /*
   * FIRST:
   * Try session embedded inside table response.
   */

  const embeddedSession =
    getEmbeddedActiveSession(table);

  if (embeddedSession) {
    return embeddedSession;
  }

  /*
   * SECOND:
   * Search the separate /table-sessions API.
   */

  if (Array.isArray(allSessions)) {
    const tableId = Number(table?.id);

    const matchedSession =
      allSessions.find((session) => {
        const sessionTableId =
          getSessionTableId(session);

        return (
          Number(sessionTableId) ===
            tableId &&
          isSessionActive(session)
        );
      });

    if (matchedSession) {
      return matchedSession;
    }
  }

  return null;
};

// ============================================
// SESSION ID
// ============================================

const getActiveSessionId = (
  table,
  allSessions = []
) => {
  const session = getActiveSession(
    table,
    allSessions
  );

  if (!session) {
    return null;
  }

  return (
    session?.id ||
    session?.session_id ||
    session?.table_session_id ||
    null
  );
};

// ============================================
// STATUS CONFIG
// ============================================

const STATUS_CONFIG = {
  AVAILABLE: {
    label: "Available",
    badge:
      "bg-emerald-50 text-emerald-700 border-emerald-200/80",
    dot: "bg-emerald-500",
    cardBorder:
      "hover:border-emerald-300",
    btnClass:
      "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/10",
  },

  UNAVAILABLE: {
    label: "Unavailable",
    badge:
      "bg-stone-900 text-white border-transparent",
    dot: "bg-amber-400 animate-pulse",
    cardBorder:
      "hover:border-stone-400",
    btnClass:
      "bg-stone-900 hover:bg-stone-800 text-white shadow-stone-900/10",
  },

  OCCUPIED: {
    label: "Occupied",
    badge:
      "bg-stone-900 text-white border-transparent",
    dot: "bg-amber-400 animate-pulse",
    cardBorder:
      "hover:border-stone-400",
    btnClass:
      "bg-stone-900 hover:bg-stone-800 text-white shadow-stone-900/10",
  },

  RESERVED: {
    label: "Reserved",
    badge:
      "bg-amber-50 text-amber-800 border-amber-200/80",
    dot: "bg-amber-500",
    cardBorder:
      "hover:border-amber-300",
    btnClass:
      "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/10",
  },

  INACTIVE: {
    label: "Inactive",
    badge:
      "bg-stone-100 text-stone-500 border-stone-200",
    dot: "bg-stone-400",
    cardBorder: "",
    btnClass: "",
  },
};

// ============================================
// EXTRACT TABLE LIST
// ============================================

const extractTables = (response) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.data?.data)) {
    return response.data.data;
  }

  if (Array.isArray(response?.tables)) {
    return response.tables;
  }

  if (Array.isArray(response?.data?.tables)) {
    return response.data.tables;
  }

  return [];
};

// ============================================
// EXTRACT SESSION LIST
// ============================================

const extractSessions = (response) => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response?.data)) {
    return response.data;
  }

  if (Array.isArray(response?.data?.data)) {
    return response.data.data;
  }

  if (Array.isArray(response?.sessions)) {
    return response.sessions;
  }

  if (Array.isArray(response?.data?.sessions)) {
    return response.data.sessions;
  }

  return [];
};

// ============================================
// MAIN
// ============================================

export default function Tables() {
  const navigate = useNavigate();

  const [filter, setFilter] =
    useState("All");

  const [tables, setTables] =
    useState([]);

  const [tableSessions, setTableSessions] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // ============================================
  // FETCH TABLES + SESSIONS
  // ============================================

  const fetchTables = async () => {
    try {
      setLoading(true);
      setError("");

      console.log(
        "========== CASHIER FLOOR PLAN =========="
      );

      /*
       * Load both APIs.
       */

      const [
        tablesResponse,
        sessionsResponse,
      ] = await Promise.all([
        getCashierTables(),
        getTableSessions(),
      ]);

      console.log(
        "TABLE RESPONSE:",
        tablesResponse
      );

      console.log(
        "SESSION RESPONSE:",
        sessionsResponse
      );

      const tableList =
        extractTables(
          tablesResponse
        );

      const sessionList =
        extractSessions(
          sessionsResponse
        );

      console.log(
        "TABLE LIST:",
        tableList
      );

      console.log(
        "SESSION LIST:",
        sessionList
      );

      /*
       * Debug every table.
       */

      tableList.forEach((table) => {
        const activeSession =
          getActiveSession(
            table,
            sessionList
          );

        console.log(
          `TABLE ${table.id}`,
          {
            tableName:
              getTableName(table),

            rawStatus:
              table?.status,

            normalizedStatus:
              getTableStatus(table),

            activeSession,

            activeSessionId:
              activeSession?.id ||
              activeSession?.session_id ||
              activeSession?.table_session_id ||
              null,

            table,
          }
        );
      });

      console.log(
        "========================================"
      );

      setTables(tableList);
      setTableSessions(sessionList);
    } catch (err) {
      console.error(
        "FAILED TO LOAD FLOOR PLAN:",
        err
      );

      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to load tables"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  // ============================================
  // FILTER
  // ============================================

  const filteredTables = useMemo(() => {
    return tables.filter((table) => {
      const status =
        getTableStatus(table);

      if (filter === "All") {
        return true;
      }

      if (filter === "Available") {
        return status === "AVAILABLE";
      }

      if (filter === "Unavailable") {
        return (
          status === "UNAVAILABLE" ||
          status === "OCCUPIED"
        );
      }

      if (filter === "Reserved") {
        return status === "RESERVED";
      }

      return true;
    });
  }, [tables, filter]);

  // ============================================
  // COUNTS
  // ============================================

  const tableCounts = useMemo(() => {
    return {
      all: tables.length,

      available: tables.filter(
        (table) =>
          getTableStatus(table) ===
          "AVAILABLE"
      ).length,

      unavailable: tables.filter(
        (table) => {
          const status =
            getTableStatus(table);

          return (
            status === "UNAVAILABLE" ||
            status === "OCCUPIED"
          );
        }
      ).length,

      reserved: tables.filter(
        (table) =>
          getTableStatus(table) ===
          "RESERVED"
      ).length,

      inactive: tables.filter(
        (table) =>
          getTableStatus(table) ===
          "INACTIVE"
      ).length,
    };
  }, [tables]);

  // ============================================
  // TABLE ACTION
  // ============================================

  const handleTableAction = async (
    table
  ) => {
    const status =
      getTableStatus(table);

    const tableId = table?.id;

    const tableNumber =
      table?.table_number ||
      table?.tableNumber ||
      table?.name ||
      table?.code ||
      tableId;

    console.log(
      "========== TABLE ACTION =========="
    );

    console.log(
      "TABLE:",
      table
    );

    console.log(
      "TABLE ID:",
      tableId
    );

    console.log(
      "TABLE NUMBER:",
      tableNumber
    );

    console.log(
      "STATUS:",
      status
    );

    // ========================================
    // OCCUPIED / UNAVAILABLE
    // ========================================

    if (
      status === "OCCUPIED" ||
      status === "UNAVAILABLE"
    ) {
      /*
       * IMPORTANT:
       *
       * Search the table itself AND the
       * separate table-sessions API.
       */

      const activeSession =
        getActiveSession(
          table,
          tableSessions
        );

      const activeSessionId =
        getActiveSessionId(
          table,
          tableSessions
        );

      console.log(
        "FOUND ACTIVE SESSION:",
        activeSession
      );

      console.log(
        "FOUND ACTIVE SESSION ID:",
        activeSessionId
      );

      if (!activeSessionId) {
        /*
         * This means backend says the table is
         * unavailable but there is no ACTIVE
         * table session associated with it.
         */

        setError(
          `No active session found for ${tableNumber}. Please refresh the floor plan.`
        );

        console.error(
          "NO ACTIVE SESSION FOUND",
          {
            table,
            tableId,
            status,
            tableSessions,
          }
        );

        return;
      }

      /*
       * /view/:id MUST receive SESSION ID.
       */

      navigate(
        `/view/${activeSessionId}`,
        {
          state: {
            tableId,
            tableNumber,
            table,

            sessionId:
              activeSessionId,

            tableSessionId:
              activeSessionId,

            activeSession,
          },
        }
      );

      return;
    }

    // ========================================
    // AVAILABLE → CREATE SESSION
    // ========================================

    if (status === "AVAILABLE") {
      try {
        setError("");

        console.log(
          "========== START NEW SESSION =========="
        );

        console.log(
          "TABLE ID:",
          tableId
        );

        const response =
          await createTableSession(
            tableId
          );

        console.log(
          "CREATE SESSION RESPONSE:",
          response
        );

        /*
         * Support different Laravel response
         * formats.
         */

        const session =
          response?.data?.data ||
          response?.data ||
          response?.session ||
          response;

        console.log(
          "CREATED SESSION:",
          session
        );

        const sessionId =
          session?.id ||
          session?.session_id ||
          session?.table_session_id;

        if (!sessionId) {
          throw new Error(
            "Table session was created, but the session ID was not returned."
          );
        }

        console.log(
          "NEW SESSION ID:",
          sessionId
        );

        /*
         * Navigate immediately.
         *
         * No need to wait for fetchTables()
         * because the session has already been
         * created by the backend.
         */

        navigate(
          `/new/${tableId}`,
          {
            state: {
              tableId,
              tableNumber,
              table,

              sessionId,

              tableSessionId:
                sessionId,

              isNewSession: true,
            },
          }
        );

        /*
         * Refresh in background.
         */

        fetchTables();

        return;
      } catch (err) {
        console.error(
          "FAILED TO CREATE TABLE SESSION:",
          err
        );

        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Failed to start table session."
        );

        return;
      }
    }

    // ========================================
    // RESERVED
    // ========================================

    if (status === "RESERVED") {
      navigate(
        `/checkin/${tableId}`,
        {
          state: {
            tableId,
            tableNumber,
            table,
          },
        }
      );

      return;
    }
  };

  // ============================================
  // LOADING
  // ============================================

  if (loading) {
    return (
      <main className="flex flex-1 items-center justify-center bg-[#faf8f5] p-8">
        <div className="flex flex-col items-center">
          <Loader2
            size={32}
            className="mb-3 animate-spin text-stone-700"
          />

          <p className="text-xs font-semibold text-stone-500">
            Loading floor layout...
          </p>
        </div>
      </main>
    );
  }

  // ============================================
  // ERROR
  // ============================================

  if (error) {
    return (
      <main className="flex flex-1 items-center justify-center bg-[#faf8f5] p-8">
        <div className="w-full max-w-md rounded-3xl border border-rose-200/80 bg-white p-8 text-center shadow-sm">

          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
            <Ban size={26} />
          </div>

          <h3 className="text-base font-extrabold text-stone-900">
            Unable to load tables
          </h3>

          <p className="mt-2 text-xs font-medium text-rose-600">
            {error}
          </p>

          <button
            type="button"
            onClick={fetchTables}
            className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-xl bg-stone-900 px-5 py-2.5 text-xs font-semibold text-white shadow-sm transition-all hover:bg-stone-800 active:scale-95"
          >
            <RefreshCw size={14} />
            Try Again
          </button>
        </div>
      </main>
    );
  }

  // ============================================
  // MAIN UI
  // ============================================

  return (
    <main className="flex min-w-0 flex-1 flex-col space-y-6 overflow-y-auto bg-[#faf8f5] p-6 md:p-8">

      {/* HEADER */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-stone-900">
            Floor Plan
          </h2>

          <p className="mt-0.5 text-xs font-medium text-stone-500">
            Manage main dining area seating and live table statuses
          </p>
        </div>

        <button
          type="button"
          onClick={fetchTables}
          className="inline-flex cursor-pointer items-center gap-2 self-start rounded-xl border border-stone-200 bg-white px-4 py-2 text-xs font-semibold text-stone-700 shadow-sm transition-all hover:border-stone-300 hover:bg-stone-50 active:scale-95 sm:self-auto"
        >
          <RefreshCw
            size={14}
            className="text-stone-500"
          />

          <span>
            Refresh Floor
          </span>
        </button>
      </div>

      {/* KPI */}

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">

        <div className="rounded-2xl border border-stone-200/80 bg-white p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
            Total Tables
          </p>

          <div className="mt-1 flex items-baseline justify-between">
            <p className="text-2xl font-extrabold text-stone-900">
              {tableCounts.all}
            </p>

            <LayoutGrid
              size={18}
              className="text-stone-300"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
            Available
          </p>

          <div className="mt-1 flex items-baseline justify-between">
            <p className="text-2xl font-extrabold text-emerald-800">
              {tableCounts.available}
            </p>

            <Sparkles
              size={18}
              className="text-emerald-400"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-stone-500">
            Unavailable
          </p>

          <div className="mt-1 flex items-baseline justify-between">
            <p className="text-2xl font-extrabold text-stone-900">
              {tableCounts.unavailable}
            </p>

            <Users
              size={18}
              className="text-stone-400"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-amber-100 bg-amber-50/40 p-4 shadow-sm">
          <p className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
            Reserved
          </p>

          <div className="mt-1 flex items-baseline justify-between">
            <p className="text-2xl font-extrabold text-amber-900">
              {tableCounts.reserved}
            </p>

            <Clock
              size={18}
              className="text-amber-400"
            />
          </div>
        </div>

      </div>

      {/* FILTER */}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

        <div className="flex w-fit items-center gap-1.5 rounded-2xl border border-stone-200/80 bg-white p-1.5 shadow-sm">

          {[
            "All",
            "Available",
            "Unavailable",
            "Reserved",
          ].map((tab) => {
            const count =
              tab === "All"
                ? tableCounts.all
                : tab === "Available"
                ? tableCounts.available
                : tab === "Unavailable"
                ? tableCounts.unavailable
                : tableCounts.reserved;

            const isActive =
              filter === tab;

            return (
              <button
                key={tab}
                type="button"
                onClick={() =>
                  setFilter(tab)
                }
                className={`flex cursor-pointer items-center gap-1.5 rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-stone-900 text-white shadow-sm"
                    : "text-stone-500 hover:bg-stone-100/60 hover:text-stone-900"
                }`}
              >
                <span>
                  {tab}
                </span>

                <span
                  className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                    isActive
                      ? "bg-white/20 text-white"
                      : "bg-stone-100 text-stone-500"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <p className="text-xs font-medium text-stone-400">
          Showing{" "}
          <span className="font-bold text-stone-700">
            {filteredTables.length}
          </span>{" "}
          of {tables.length} tables
        </p>
      </div>

      {/* TABLE GRID */}

      {filteredTables.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-stone-200/80 bg-white py-20 text-center shadow-sm">

          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-stone-100 text-stone-400">
            <Users size={26} />
          </div>

          <h3 className="text-sm font-bold text-stone-800">
            No tables matching criteria
          </h3>

          <p className="mt-1 text-xs text-stone-400">
            Try selecting a different filter option above.
          </p>

        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">

          {filteredTables.map(
            (table) => {
              const status =
                getTableStatus(table);

              const tableName =
                getTableName(table);

              const seats =
                getSeatCount(table);

              const amount =
                getAmount(table);

              const config =
                STATUS_CONFIG[status] ||
                STATUS_CONFIG.AVAILABLE;

              const activeSession =
                getActiveSession(
                  table,
                  tableSessions
                );

              const activeSessionId =
                getActiveSessionId(
                  table,
                  tableSessions
                );

              const isUnavailable =
                status ===
                "UNAVAILABLE";

              const isOccupied =
                status === "OCCUPIED";

              const isReserved =
                status === "RESERVED";

              const isInactive =
                status === "INACTIVE";

              return (
                <div
                  key={table.id}
                  className={`group flex min-h-[190px] flex-col justify-between rounded-2xl border bg-white p-4 shadow-sm transition-all duration-200 ${
                    isInactive
                      ? "border-dashed border-stone-200 opacity-60"
                      : `border-stone-200/90 hover:-translate-y-1 hover:shadow-md ${config.cardBorder}`
                  }`}
                >

                  <div>

                    <div className="flex items-center justify-between gap-2">

                      <span className="text-base font-extrabold text-stone-900">
                        {tableName}
                      </span>

                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide ${config.badge}`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${config.dot}`}
                        />

                        {config.label}
                      </span>

                    </div>

                    <div className="mt-2.5 flex items-center gap-1.5 text-xs font-semibold text-stone-500">

                      <Users
                        size={14}
                        className="text-stone-400"
                      />

                      <span>
                        {seats} Seats
                      </span>

                    </div>

                    {/* UNAVAILABLE */}

                    {isUnavailable && (
                      <div className="mt-3.5 rounded-xl border border-stone-200 bg-stone-50 p-2.5">

                        <div className="flex items-center gap-2">

                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-stone-900 text-white">
                            <Clock size={13} />
                          </div>

                          <div className="min-w-0">

                            <p className="text-[11px] font-bold text-stone-800">
                              Table in use
                            </p>

                            <p className="truncate text-[10px] font-medium text-stone-400">
                              {activeSessionId
                                ? `Session #${activeSessionId}`
                                : "Finding active session..."}
                            </p>

                          </div>

                        </div>

                      </div>
                    )}

                    {/* OCCUPIED */}

                    {isOccupied &&
                      amount && (
                        <div className="mt-3.5 rounded-xl border border-stone-100 bg-stone-50 p-2.5">

                          <div className="flex items-center justify-between text-[11px] font-medium text-stone-400">

                            <span>
                              Current Bill
                            </span>

                            <DollarSign size={12} />

                          </div>

                          <p className="mt-0.5 text-base font-black text-stone-900">
                            {amount}
                          </p>

                        </div>
                      )}

                    {/* RESERVED */}

                    {isReserved && (
                      <div className="mt-3.5 flex items-center gap-1.5 rounded-xl border border-amber-200/60 bg-amber-50/50 p-2 text-[11px] font-semibold text-amber-800">

                        <LogIn
                          size={13}
                          className="shrink-0 text-amber-600"
                        />

                        <span className="truncate">
                          Upcoming reservation
                        </span>

                      </div>
                    )}

                  </div>

                  {/* ACTION */}

                  <div className="mt-5 border-t border-stone-100 pt-3">

                    {isInactive ? (
                      <div className="flex items-center justify-center gap-1.5 py-1.5 text-xs font-semibold text-stone-400">

                        <Ban size={14} />

                        <span>
                          Table Disabled
                        </span>

                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() =>
                          handleTableAction(
                            table
                          )
                        }
                        className={`inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-bold shadow-sm transition-all active:scale-[0.98] ${config.btnClass}`}
                      >

                        {status ===
                          "AVAILABLE" && (
                          <>
                            <Plus
                              size={14}
                            />

                            <span>
                              New Order
                            </span>
                          </>
                        )}

                        {(status ===
                          "UNAVAILABLE" ||
                          status ===
                            "OCCUPIED") && (
                          <>
                            <Eye
                              size={14}
                            />

                            <span>
                              View Session
                            </span>
                          </>
                        )}

                        {status ===
                          "RESERVED" && (
                          <>
                            <LogIn
                              size={14}
                            />

                            <span>
                              Check In
                            </span>
                          </>
                        )}

                      </button>
                    )}

                  </div>

                </div>
              );
            }
          )}

        </div>
      )}

    </main>
  );
}