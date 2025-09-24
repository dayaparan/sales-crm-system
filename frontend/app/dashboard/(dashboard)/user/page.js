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
const COLUMNS = [
  {
    Header: "Name",
    accessor: "name",
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
            className={` inline-block px-3 min-w-[90px] text-center mx-auto py-1 rounded-[999px] bg-opacity-25 ${row?.cell?.value === "Active" ? "text-success-500 bg-success-500" : ""
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
  const router = useRouter()
  const columns = useMemo(() => COLUMNS, []);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState([]);
  const { pagination, setPagination, handlePageChange, handlePageSizeChange } = usePaginate();
  const { closeDialog, isOpen, onConfirm, openDialog } = useConfirmationDialog();

  const getData = async (page, size) => {
    try {
      setIsLoading(true);
      const { data } = await axiosInstance.get("/user", { params: { page, limit: size } });
      if (!data.error) {
        setData(data.users);
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
  }, [pagination.currentPage, pagination.pageSize]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      console.log(newStatus);

      const { data } = await axiosInstance.put(`/user/${id}`, { status: newStatus });
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
      const { data } = await axiosInstance.delete(`/user/${id}`);
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
                  onClick={() => router.push(`/dashboard/user/${row.original._id}/edit`)}
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
        <h4 className="card-title">Users</h4>
        <div className="flex gap-2">
          <GlobalFilter filter={globalFilter} setFilter={setGlobalFilter} placeholder="Search Users..." />
          <AddButton route={"/dashboard/user/add"} />
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
