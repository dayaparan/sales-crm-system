"use client";
import React, { useState, useMemo, useEffect, useRef } from "react";
import Card from "@/components/ui/Card";
import { useTable, useRowSelect, useSortBy, useGlobalFilter, usePagination } from "react-table";
import handleError from "@/lib/handleError";
import formatDate from "@/lib/formatDate";
import TableBody from "@/components/shared/TableBody";
import GlobalFilter from "@/components/ui/GlobalFilter";
import ActionButton from "@/components/shared/ActionButton";
import axiosInstance from "@/lib/axiosInstance";
import { toast } from "react-toastify";
import usePaginate from "@/hooks/usePaginate";
import ConfirmationDialog from "@/components/shared/ConfirmationDialog";
import useConfirmationDialog from "@/hooks/useConfirmationDialog";
import AddButton from "@/components/shared/AddButton";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import { priorityOptions } from "@/constant/data";
import DateFilter from "@/components/shared/DateFilter";
import Select from "@/components/ui/Select";
import SubmitButton from "@/components/ui/SubmitButton";

const COLUMNS = [
  {
    Header: "First Name",
    accessor: "firstName",
    Cell: (row) => {
      return <span>{row?.cell?.value}</span>;
    },
  },
  {
    Header: "Last Name",
    accessor: "lastName",
    Cell: (row) => {
      return <span>{row?.cell?.value}</span>;
    },
  },
  {
    Header: "Email",
    accessor: "email",
    Cell: (row) => {
      return <span>{row?.cell?.value}</span>;
    },
  },
  {
    Header: "Phone Number",
    accessor: "phone",
    Cell: (row) => {
      return <span>{row?.cell?.value}</span>;
    },
  },
  {
    Header: "DOB",
    accessor: "dob",
    Cell: (row) => {
      return <span>{row?.cell?.value? formatDate(row?.cell?.value, "DD/MM/YYYY") : "N/A"}</span>;
    },
  },
  {
    Header: "Anniversary",
    accessor: "anniversary",
    Cell: (row) => {
      return <span>{row?.cell?.value? formatDate(row?.cell?.value, "DD/MM/YYYY") : "N/A"}</span>;
    },
  },
  {
    Header: "Investment Model",
    accessor: "investmentModel",
    Cell: (row) => {
      return <span>{row?.cell?.value || "N/A"}</span>;
    },
  },
  {
    Header: "Lead Score",
    accessor: "leadScore",
    Cell: (row) => {
      return <span>{row?.cell?.value || 0}</span>;
    },
  },
  {
    Header: "created At",
    accessor: "createdAt",
    Cell: (row) => {
      return <span>{formatDate(row?.cell?.value)}</span>;
    },
  },
];

const UserPage = () => {
  const inputRef = useRef();
  const { user } = useSelector((state) => state.auth);
  const { branch } = useSelector((state) => state.branch);
  const router = useRouter();
  const columns = useMemo(() => COLUMNS, []);
  const [isLoading, setIsLoading] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [data, setData] = useState([]);
  const [filters, setFilters] = useState({
    priority: "",
    startDate: "",
    endDate: "",
    branchId: "",
  });
  const { pagination, setPagination, handlePageChange, handlePageSizeChange } = usePaginate();
  const { closeDialog, isOpen, onConfirm, openDialog } = useConfirmationDialog();

  const getData = async (page, size) => {
    try {
      setIsLoading(true);
      const { data } = await axiosInstance.get("/user/lead", { params: { page, limit: size, ...filters } });
      if (!data.error) {
        setData(data.leads || []);
        setPagination(data.pagination);
      }
    } catch (error) {
      handleError(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getData(pagination.currentPage, pagination.pageSize);
  }, [pagination.currentPage, pagination.pageSize, filters]);

  const handleDelete = async (id) => {
    try {
      const { data } = await axiosInstance.delete(`/user/lead/${id}`);
      if (!data.error) {
        toast.success(data.message);
        getData(pagination.currentPage, pagination.pageSize);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      handleError(error);
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const handleInputChange = async (e) => {
    try {
      if (e.target.files.length === 0) {
        return;
      }
      setIsImporting(true);
      const { data } = await axiosInstance.post(
        "/user/lead/csv",
        { file: e.target.files[0] },
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (data.success) {
        getData(1, pagination.pageSize);
      }
    } catch (error) {
      handleError(error);
    } finally {
      setIsImporting(false);
      inputRef.current.value = "";
    }
  };

  const tableInstance = useTable(
    {
      columns,
      data,
      manualPagination: true,
      pageCount: pagination.totalPages,
    },
    useGlobalFilter,
    useSortBy,
    usePagination,
    useRowSelect,
    (hooks) => {
      hooks.visibleColumns.push((columns) => [
        ...columns,
        ...(user?.role === "ADMIN"
          ? [
              {
                id: "branchName",
                Header: "Branch",
                accessor: "branch.name",
                Cell: ({ row }) => row.original?.branch?.name ?? "—",
              },
            ]
          : []),
        {
          id: "Status",
          Header: "Status",
          accessor: "priority",
          Cell: ({ row }) => {
            const currentValue = row.original.priority;

            const handleChange = async (e) => {
              const newPriority = e.target.value;
              setData((prev) =>
                prev.map((lead) => (lead._id === row.original._id ? { ...lead, priority: newPriority } : lead))
              );
              try {
                const { data: res } = await axiosInstance.patch(`/user/lead/${row.original.id}/priority`, {
                  priority: newPriority,
                });

                if (!res.error) {
                  toast.success("Priority updated successfully!");
                } else {
                  toast.error(res.message || "Failed to update priority");
                }
              } catch (error) {
                handleError(error);
              }
            };

            return (
              <select
                value={currentValue}
                onChange={handleChange}
                className={`px-2 py-1 rounded-md text-sm font-medium focus:outline-none
          ${currentValue === "HOT" ? "bg-red-600/20 text-red-500" : ""}
          ${currentValue === "WARM" ? "bg-yellow-600/20 text-yellow-500" : ""}
          ${currentValue === "COLD" ? "bg-blue-600/20 text-blue-500" : ""}
        `}
              >
                {priorityOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            );
          },
        },
        {
          Header: "action",
          accessor: "action",
          Cell: ({ row }) => {
            return (
              <div className="flex space-x-3 rtl:space-x-reverse">
                <ActionButton
                  title="Info"
                  icon={"iconamoon:eye-bold"}
                  onClick={() => router.push(`/dashboard/lead/${row.original._id}/info`)}
                />
                <ActionButton
                  title="Edit"
                  icon={"uil:edit"}
                  onClick={() => router.push(`/dashboard/lead/${row.original._id}/edit`)}
                />
                <ActionButton
                  title="Delete"
                  icon={"mdi:delete-outline"}
                  onClick={() => openDialog(() => handleDelete(row.original._id))}
                />
              </div>
            );
          },
        },
      ]);
    }
  );

  const { state, setGlobalFilter } = tableInstance;
  const { globalFilter } = state;

  return (
    <Card>
      <div className="md:flex justify-between items-center mb-6">
        <h4 className="card-title">Lead</h4>
        <div className="flex gap-2">
          {/* <DateFilter
            setDate={(newValue) => setFilters((prev) => ({ ...prev, ...newValue }))}
            values={filters}
          /> */}
          {user?.role === "ADMIN" && (
            <Select
              placeholder="Select Branch"
              onChange={(e) => handleFilterChange({ branchId: e.target.value })}
              options={branch}
            />
          )}
          <div className="w-[120px]">
            <Select
              id={"Status"}
              options={priorityOptions}
              placeholder="Status"
              onChange={(e) => handleFilterChange({ priority: e.target.value })}
              value={filters.priority}
            />
          </div>
          <GlobalFilter filter={globalFilter} setFilter={setGlobalFilter} placeholder="Search Lead..." />
          <AddButton route={"/dashboard/lead/add"} />
          <a href="/sample/lead.csv" download={"lead.csv"} className="btn btn-primary text-center py-1.5">
            Csv Sample
          </a>
          <SubmitButton isSubmitting={isImporting} type="button" onClick={() => inputRef.current.click()}>
            Bulk Lead
          </SubmitButton>
          <input type="file" multiple={false} accept="text/csv" hidden ref={inputRef} onChange={handleInputChange} />
        </div>
      </div>
      <TableBody
        tableInstance={tableInstance}
        pagination={pagination}
        handlePageSizeChange={handlePageSizeChange}
        handlePageChange={handlePageChange}
        isLoading={isLoading}
      />
      <ConfirmationDialog isOpen={isOpen} closeDialog={closeDialog} onConfirm={onConfirm} />
    </Card>
  );
};

export default UserPage;
