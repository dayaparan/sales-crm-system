// "use client";
// import React from "react";
// import Image from "next/image";
// import profile from "@/assets/img/profile.png";
// import Calender from "@/components/ui/Calender";

// const leadQueue = [
//   {
//     profile: "",
//     name: "Ali",
//     action: "Closed a deal with",
//     with: "Inovate LLC.",
//     time: "15 minutes",
//   },
//   {
//     profile: "",
//     name: "Sara",
//     action: "Followed up with",
//     with: "TechCorp",
//     time: "30 minutes",
//   },
//   {
//     profile: "",
//     name: "John",
//     action: "Added a new lead for",
//     with: "Green Solutions",
//     time: "1 hour",
//   },
// ];

// const UserPage = () => {
//   return (
//     <div className="flex flex-col lg:flex-row gap-5">
//       {/* left side */}
//       <div className="flex flex-col gap-6 lg:w-1/3 w-full">
//         {/* log daily activity */}
//         <section className="w-full mx-auto p-6 bg-gradient-to-b from-[#0c1221] to-[#0f183a] rounded-lg shadow-lg text-white">
//           <div className="flex justify-between items-center mb-6">
//             <h2 className="text-lg font-bold text-[#D4AF37] capitalize">
//               log daily activity
//             </h2>
//           </div>

//           <form className="grid grid-cols-1 gap-6">
//             <div className="flex flex-col">
//               <label className="text-sm mb-1">Activity Type</label>
//               <select className="bg-[#0B1530] border border-gray-600 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400">
//                 <option>Option 1</option>
//                 <option>Option 2</option>
//                 <option>Option 3</option>
//               </select>
//             </div>

//             <div className="flex flex-col">
//               <label className="text-sm mb-1">Related Leads</label>
//               <input
//                 type="text"
//                 defaultValue="Jane Doe"
//                 className="bg-[#0B1530] border border-gray-600 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
//               />
//             </div>

//             <div className="flex flex-col">
//               <label className="text-sm mb-1">Notes</label>
//               <textarea
//                 rows={4}
//                 className="bg-[#0B1530] border border-gray-600 rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
//               ></textarea>
//             </div>

//             <div className="flex justify-end">
//               <button
//                 type="submit"
//                 className="bg-[#D4AF37] hover:bg-[#D4AF37]/90 text-black px-6 py-2 rounded text-sm font-semibold"
//               >
//                 Log Activity
//               </button>
//             </div>
//           </form>
//         </section>

//         {/* smart lead queue */}
//         <section className="w-full mx-auto p-6 bg-gradient-to-b from-[#0c1221] to-[#0f183a] rounded-lg shadow-lg text-white">
//           <div className="flex justify-between items-center mb-6">
//             <h2 className="text-lg font-bold text-[#D4AF37] capitalize">
//               smart lead queue
//             </h2>
//           </div>
//           <div className="flex flex-col gap-4">
//             {leadQueue.map((item, index) => (
//               <div
//                 key={index}
//                 className="flex text-sm gap-4 items-center bg-[#111C44] p-3 rounded-2xl border border-gray-600"
//               >
//                 <Image
//                   src={item.profile ? item.profile : profile}
//                   alt="profile"
//                   width={60}
//                   height={60}
//                   className="rounded-xl bg-gray-500"
//                 />
//                 <div>
//                   <p>
//                     <span className="text-white font-bold">{item.name} </span>
//                     <span>{item.action} </span>
//                     <span className="text-[#D4AF37] font-bold">{item.with}</span>
//                   </p>
//                   <p className="text-gray-300">{item.time} ago</p>
//                 </div>
//               </div>
//             ))}
//           </div>
//         </section>
//       </div>

//       {/* right side calendar */}
//       <div className="lg:w-2/3 w-full lg:max-w-[880px]">
//         <Calender />
//       </div>
//     </div>
//   );
// };

// export default UserPage;

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
    Header: "Ownership Type",
    accessor: "ownershipType",
    Cell: (row) => {
      return <span>{row?.cell?.value}</span>;
    },
  },
  {
    Header: "Min Investment Lakhs",
    accessor: "minInvestmentLakhs",
    Cell: (row) => {
      return <span>{row?.cell?.value}</span>;
    },
  },
  {
    Header: "Buy back Terms",
    accessor: "buybackTerms",
    Cell: (row) => {
      return <span>{row?.cell?.value}</span>;
    },
  },
  {
    Header: "Guaranteed Roi Percent",
    accessor: "guaranteedRoiPercent",
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
  const { user } = useSelector((state) => state.auth);
  const { branch } = useSelector((state) => state.branch);
  const router = useRouter();
  const columns = useMemo(() => COLUMNS, []);
  const [isLoading, setIsLoading] = useState(false);
  const [filters, setFilters] = useState({ branchId: "" });
  const [data, setData] = useState([]);
  const { pagination, setPagination, handlePageChange, handlePageSizeChange } = usePaginate();
  const { closeDialog, isOpen, onConfirm, openDialog } = useConfirmationDialog();

  const getData = async (page, size) => {
    try {
      setIsLoading(true);
      const { data } = await axiosInstance.get("/user/salesModel", {
        params: { page, limit: size, ...filters },
      });
      if (!data.error) {
        setData(data.salesModels);
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
      const { data } = await axiosInstance.patch(`/user/salesModel/${id}`, { status: newStatus });
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
      const { data } = await axiosInstance.delete(`/user/salesModel/${id}`);
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
                  onClick={() => router.push(`/dashboard/salesmodel/${row.original._id}/edit`)}
                />
                <ActionButton
                  title="Info"
                  icon={"hugeicons:view"}
                  onClick={() => router.push(`/dashboard/salesmodel/${row.original._id}/info`)}
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
        <h4 className="card-title">Sales Models</h4>
        <div className="flex gap-2">
          {user?.role === "ADMIN" && (
            <Select
              placeholder="Select Branch"
              onChange={(e) => handleFilterChange({ branchId: e.target.value })}
              options={branch}
            />
          )}
          <GlobalFilter
            filter={globalFilter}
            setFilter={setGlobalFilter}
            placeholder="Search Sales Models..."
          />
          <AddButton route={"/dashboard/salesmodel/add"} />
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
