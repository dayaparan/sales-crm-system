"use client";
import React, { useState, useMemo, useEffect } from "react";
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
import Select from "@/components/ui/Select";

const COLUMNS = [
  {
    Header: "Name",
    accessor: "name",
    Cell: (row) => {
      return <span>{row?.cell?.value}</span>;
    },
  },
  {
    Header: "Brand",
    accessor: "brand",
    Cell: (row) => {
      return <span>{row?.cell?.value}</span>;
    },
  },
  {
    Header: "Location",
    accessor: "location",
    Cell: (row) => {
      return <span>{row?.cell?.value}</span>;
    },
  },
  {
    Header: "City",
    accessor: "city",
    Cell: (row) => {
      return <span>{row?.cell?.value}</span>;
    },
  },
  {
    Header: "State",
    accessor: "state",
    Cell: (row) => {
      return <span>{row?.cell?.value}</span>;
    },
  },
  {
    Header: "TotalAcres",
    accessor: "totalAcres",
    Cell: (row) => {
      return <span>{row?.cell?.value}</span>;
    },
  },
  {
    Header: "TotalUnits",
    accessor: "totalUnits",
    Cell: (row) => {
      return <span>{row?.cell?.value}</span>;
    },
  },
  {
    Header: "created At",
    accessor: "createdAt",
    Cell: (row) => {
      return <span>{formatDate(row?.cell?.value)}</span>;
    },
  },
  {
    Header: "status",
    accessor: (info) => (info.status ? "Active" : "Deactive"),
    Cell: (row) => {
      return (
        <span className="block w-full">
          <span
            className={` inline-block px-3 min-w-[90px] text-center mx-auto py-1 rounded-[999px] bg-opacity-25 ${
              row?.cell?.value === "Active" ? "text-success-500 bg-success-500" : ""
            } 
            ${row?.cell?.value === "Deactive" ? "text-danger-500 bg-danger-500" : ""}
            
             `}
          >
            {row?.cell?.value}
          </span>
        </span>
      );
    },
  },
];

const UserPage = () => {
  const router = useRouter();
  const columns = useMemo(() => COLUMNS, []);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);
  const [filters, setFilters] = useState({ branchId: "" });
  const { pagination, setPagination, handlePageChange, handlePageSizeChange } = usePaginate();
  const { closeDialog, isOpen, onConfirm, openDialog } = useConfirmationDialog();

  const getData = async (page, size) => {
    try {
      setIsLoading(true);
      const { data } = await axiosInstance.get("/user/project", {
        params: { page, limit: size, ...filters },
      });
      if (!data.error) {
        setData(data.projects);
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

  const handleStatusChange = async (id, newStatus) => {
    try {
      const { data } = await axiosInstance.patch(`/user/project/${id}`, { status: newStatus });
      if (!data.error) {
        setData((prev) => prev.map((item) => (item._id === id ? { ...item, status: newStatus } : item)));
        toast.success(data.message);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      handleError(error);
    }
  };

  const handleDelete = async (id) => {
    try {
      const { data } = await axiosInstance.delete(`/user/project/${id}`);
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
        {
          Header: "action",
          accessor: "action",
          Cell: ({ row }) => {
            return (
              <div className="flex space-x-3 rtl:space-x-reverse">
                <ActionButton
                  title={row.original.status ? "Deactive" : "Active"}
                  icon={row.original.status ? "solar:lock-outline" : "mynaui:lock-open"}
                  onClick={() => handleStatusChange(row.original._id, !row.original.status)}
                />
                <ActionButton
                  title="Edit"
                  icon={"uil:edit"}
                  onClick={() => router.push(`/dashboard/project/${row.original._id}/edit`)}
                />
                <ActionButton
                  title="Info"
                  icon={"hugeicons:view"}
                  onClick={() => router.push(`/dashboard/project/${row.original._id}/info`)}
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
        <h4 className="card-title">Projects</h4>
        <div className="flex gap-2">
          <GlobalFilter filter={globalFilter} setFilter={setGlobalFilter} placeholder="Search Projects..." />
          <AddButton route={"/dashboard/project/add"} />
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
