"use client";
import React, { useState, useMemo, useEffect, useCallback } from "react";
import Card from "@/components/ui/Card";
import { useTable, useSortBy, useGlobalFilter, usePagination } from "react-table";
import handleError from "@/lib/handleError";
import axiosInstance from "@/lib/axiosInstance";
import { toast } from "react-toastify";
import ConfirmationDialog from "@/components/shared/ConfirmationDialog";
import useConfirmationDialog from "@/hooks/useConfirmationDialog";
import GlobalFilter from "@/components/ui/GlobalFilter";
import Icon from "@/components/ui/Icon";
import { useSelector } from "react-redux";
import formatDate from "@/lib/formatDate";

const COMMAND_LABELS = {
  FORCE_LOGOUT: "Force Logout",
  LOCK_ACCOUNT: "Lock Account",
  UNLOCK_ACCOUNT: "Unlock Account",
  REQUEST_LOCATION: "Request Location",
  PUSH_CONFIG: "Push Config",
};

const STATUS_STYLES = {
  PENDING: "text-warning-500 bg-warning-500",
  DELIVERED: "text-info-500 bg-info-500",
  ACKNOWLEDGED: "text-success-500 bg-success-500",
  FAILED: "text-danger-500 bg-danger-500",
};

const RemoteControlPage = () => {
  const { user } = useSelector((state) => state.auth);
  const [users, setUsers] = useState([]);
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("users");
  const { closeDialog, isOpen, onConfirm, openDialog } = useConfirmationDialog();

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const { data } = await axiosInstance.get("/user/remote-control/online-users");
      if (data.success) {
        setUsers(data.users || []);
      }
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchHistory = useCallback(async () => {
    try {
      setHistoryLoading(true);
      const { data } = await axiosInstance.get("/user/remote-control/history", {
        params: { limit: 50 },
      });
      if (data.success) {
        setHistory(data.commands || []);
      }
    } catch (error) {
      handleError(error);
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (activeTab === "history") {
      fetchHistory();
    }
  }, [activeTab, fetchHistory]);

  // Refresh online status every 30 seconds
  useEffect(() => {
    if (activeTab !== "users") return;
    const interval = setInterval(fetchUsers, 30000);
    return () => clearInterval(interval);
  }, [activeTab, fetchUsers]);

  const executeCommand = async (endpoint, userId, userName, successMsg) => {
    try {
      const { data } = await axiosInstance.post(`/user/remote-control/${endpoint}/${userId}`);
      if (data.success) {
        toast.success(data.message || successMsg);
        fetchUsers();
      }
    } catch (error) {
      handleError(error);
    }
  };

  const handleForceLogout = (userId, userName) => {
    openDialog(() => executeCommand("force-logout", userId, userName, `${userName} logged out`));
  };

  const handleLockAccount = (userId, userName) => {
    openDialog(() => executeCommand("lock-account", userId, userName, `${userName} account locked`));
  };

  const handleUnlockAccount = (userId, userName) => {
    openDialog(() => executeCommand("unlock-account", userId, userName, `${userName} account unlocked`));
  };

  const handleRequestLocation = async (userId, userName) => {
    try {
      const { data } = await axiosInstance.post(`/user/remote-control/request-location/${userId}`);
      if (data.success) {
        toast.success(data.message);
      }
    } catch (error) {
      handleError(error);
    }
  };

  const userColumns = useMemo(
    () => [
      {
        Header: "User",
        accessor: "name",
        Cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="relative">
              {row.original.profile ? (
                <img
                  src={`${process.env.NEXT_PUBLIC_API_URL}/public/${row.original.profile}`}
                  alt={row.original.name}
                  className="w-9 h-9 rounded-full object-cover"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-slate-600 flex items-center justify-center text-white text-sm font-medium">
                  {row.original.name?.charAt(0)?.toUpperCase()}
                </div>
              )}
              <span
                className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0B1530] ${
                  row.original.isOnline ? "bg-success-500" : "bg-slate-500"
                }`}
              />
            </div>
            <div>
              <p className="text-sm font-medium text-white">{row.original.name}</p>
              <p className="text-xs text-slate-400">{row.original.email}</p>
            </div>
          </div>
        ),
      },
      {
        Header: "Role",
        accessor: "role",
        Cell: ({ value }) => (
          <span className="px-2 py-1 rounded text-xs font-medium bg-slate-700 text-slate-300">
            {value}
          </span>
        ),
      },
      {
        Header: "Branch",
        accessor: "branch.name",
        Cell: ({ value }) => <span className="text-slate-300">{value || "—"}</span>,
      },
      {
        Header: "Status",
        accessor: "isOnline",
        Cell: ({ row }) => (
          <div className="flex items-center gap-2">
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-medium bg-opacity-25 ${
                row.original.isOnline ? "text-success-500 bg-success-500" : "text-slate-400 bg-slate-600"
              }`}
            >
              {row.original.isOnline ? "Online" : "Offline"}
            </span>
            {!row.original.status && (
              <span className="inline-block px-2 py-1 rounded-full text-xs font-medium bg-opacity-25 text-danger-500 bg-danger-500">
                Locked
              </span>
            )}
          </div>
        ),
      },
      {
        Header: "Actions",
        accessor: "actions",
        Cell: ({ row }) => (
          <div className="flex items-center gap-2 flex-wrap">
            {row.original.isOnline && (
              <button
                onClick={() => handleForceLogout(row.original.id, row.original.name)}
                className="px-2.5 py-1.5 rounded text-xs font-medium bg-danger-500 bg-opacity-20 text-danger-400 hover:bg-opacity-30 transition-all flex items-center gap-1"
                title="Force Logout"
              >
                <Icon icon="mdi:logout" className="text-sm" />
                Logout
              </button>
            )}
            {row.original.status ? (
              <button
                onClick={() => handleLockAccount(row.original.id, row.original.name)}
                className="px-2.5 py-1.5 rounded text-xs font-medium bg-warning-500 bg-opacity-20 text-warning-400 hover:bg-opacity-30 transition-all flex items-center gap-1"
                title="Lock Account"
              >
                <Icon icon="mdi:lock" className="text-sm" />
                Lock
              </button>
            ) : (
              <button
                onClick={() => handleUnlockAccount(row.original.id, row.original.name)}
                className="px-2.5 py-1.5 rounded text-xs font-medium bg-success-500 bg-opacity-20 text-success-400 hover:bg-opacity-30 transition-all flex items-center gap-1"
                title="Unlock Account"
              >
                <Icon icon="mdi:lock-open" className="text-sm" />
                Unlock
              </button>
            )}
            {row.original.isOnline && (
              <button
                onClick={() => handleRequestLocation(row.original.id, row.original.name)}
                className="px-2.5 py-1.5 rounded text-xs font-medium bg-info-500 bg-opacity-20 text-info-400 hover:bg-opacity-30 transition-all flex items-center gap-1"
                title="Request Location"
              >
                <Icon icon="mdi:map-marker" className="text-sm" />
                Location
              </button>
            )}
          </div>
        ),
      },
    ],
    []
  );

  const historyColumns = useMemo(
    () => [
      {
        Header: "Command",
        accessor: "command",
        Cell: ({ value }) => (
          <span className="font-medium text-white">{COMMAND_LABELS[value] || value}</span>
        ),
      },
      {
        Header: "Issued By",
        accessor: "issuedBy.name",
        Cell: ({ value }) => <span className="text-slate-300">{value}</span>,
      },
      {
        Header: "Target",
        accessor: "target.name",
        Cell: ({ value }) => <span className="text-slate-300">{value}</span>,
      },
      {
        Header: "Status",
        accessor: "status",
        Cell: ({ value }) => (
          <span
            className={`inline-block px-3 py-1 rounded-full text-xs font-medium bg-opacity-25 ${
              STATUS_STYLES[value] || ""
            }`}
          >
            {value}
          </span>
        ),
      },
      {
        Header: "Date",
        accessor: "createdAt",
        Cell: ({ value }) => <span className="text-slate-400">{formatDate(value)}</span>,
      },
    ],
    []
  );

  const userTableInstance = useTable(
    { columns: userColumns, data: users },
    useGlobalFilter,
    useSortBy,
    usePagination
  );

  const historyTableInstance = useTable(
    { columns: historyColumns, data: history },
    useGlobalFilter,
    useSortBy,
    usePagination
  );

  const activeTableInstance = activeTab === "users" ? userTableInstance : historyTableInstance;

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    state: tableState,
    setGlobalFilter: setActiveGlobalFilter,
  } = activeTableInstance;

  return (
    <div className="space-y-5">
      <Card>
        <div className="md:flex justify-between items-center mb-6">
          <div>
            <h4 className="card-title text-white">Remote Control</h4>
            <p className="text-sm text-slate-400 mt-1">Manage agent sessions and accounts remotely</p>
          </div>
          <div className="flex items-center gap-3 mt-3 md:mt-0">
            <GlobalFilter
              filter={tableState.globalFilter}
              setFilter={setActiveGlobalFilter}
              placeholder={activeTab === "users" ? "Search users..." : "Search commands..."}
            />
            <button
              onClick={activeTab === "users" ? fetchUsers : fetchHistory}
              className="px-3 py-2 rounded bg-slate-700 hover:bg-slate-600 text-white transition-all"
              title="Refresh"
            >
              <Icon icon="mdi:refresh" />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-slate-700">
          <button
            onClick={() => setActiveTab("users")}
            className={`px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px ${
              activeTab === "users"
                ? "border-[#D4AF37] text-[#D4AF37]"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <Icon icon="heroicons:users" className="mr-2 inline-block" />
            Users ({users.length})
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2.5 text-sm font-medium transition-all border-b-2 -mb-px ${
              activeTab === "history"
                ? "border-[#D4AF37] text-[#D4AF37]"
                : "border-transparent text-slate-400 hover:text-white"
            }`}
          >
            <Icon icon="mdi:history" className="mr-2 inline-block" />
            Command History
          </button>
        </div>

        {/* Stats */}
        {activeTab === "users" && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-slate-800 rounded-lg p-4">
              <p className="text-2xl font-bold text-white">{users.length}</p>
              <p className="text-xs text-slate-400 mt-1">Total Users</p>
            </div>
            <div className="bg-slate-800 rounded-lg p-4">
              <p className="text-2xl font-bold text-success-500">
                {users.filter((u) => u.isOnline).length}
              </p>
              <p className="text-xs text-slate-400 mt-1">Online</p>
            </div>
            <div className="bg-slate-800 rounded-lg p-4">
              <p className="text-2xl font-bold text-slate-400">
                {users.filter((u) => !u.isOnline).length}
              </p>
              <p className="text-xs text-slate-400 mt-1">Offline</p>
            </div>
            <div className="bg-slate-800 rounded-lg p-4">
              <p className="text-2xl font-bold text-danger-500">
                {users.filter((u) => !u.status).length}
              </p>
              <p className="text-xs text-slate-400 mt-1">Locked</p>
            </div>
          </div>
        )}

        {/* Table */}
        <div className="overflow-x-auto">
          {(activeTab === "users" ? isLoading : historyLoading) ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#D4AF37]" />
            </div>
          ) : (
            <table className="min-w-full divide-y divide-slate-700" {...getTableProps()}>
              <thead>
                {headerGroups.map((headerGroup) => {
                  const { key, ...headerGroupProps } = headerGroup.getHeaderGroupProps();
                  return (
                    <tr key={key} {...headerGroupProps}>
                      {headerGroup.headers.map((column) => {
                        const { key: colKey, ...columnProps } = column.getHeaderProps(
                          column.getSortByToggleProps()
                        );
                        return (
                          <th
                            key={colKey}
                            {...columnProps}
                            className="table-th text-slate-400 text-xs uppercase tracking-wider"
                          >
                            {column.render("Header")}
                            <span>
                              {column.isSorted ? (column.isSortedDesc ? " ▾" : " ▴") : ""}
                            </span>
                          </th>
                        );
                      })}
                    </tr>
                  );
                })}
              </thead>
              <tbody className="divide-y divide-slate-700/50" {...getTableBodyProps()}>
                {page.length === 0 ? (
                  <tr>
                    <td
                      colSpan={activeTab === "users" ? userColumns.length : historyColumns.length}
                      className="text-center py-10 text-slate-500"
                    >
                      {activeTab === "users" ? "No users found" : "No command history"}
                    </td>
                  </tr>
                ) : (
                  page.map((row) => {
                    prepareRow(row);
                    const { key, ...rowProps } = row.getRowProps();
                    return (
                      <tr
                        key={key}
                        {...rowProps}
                        className="hover:bg-slate-800/50 transition-colors"
                      >
                        {row.cells.map((cell) => {
                          const { key: cellKey, ...cellProps } = cell.getCellProps();
                          return (
                            <td key={cellKey} {...cellProps} className="table-td py-3">
                              {cell.render("Cell")}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </Card>

      <ConfirmationDialog isOpen={isOpen} closeDialog={closeDialog} onConfirm={onConfirm} />
    </div>
  );
};

export default RemoteControlPage;
