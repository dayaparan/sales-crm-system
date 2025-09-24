"use client";

import BackButton from "@/components/ui/BackButton";
import Card from "@/components/ui/Card";
import Loading from "@/components/ui/Loading";
import axiosInstance from "@/lib/axiosInstance";
import handleError from "@/lib/handleError";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Building2, Ruler, DollarSign, Layers, CheckCircle, XCircle, Calendar, User } from "lucide-react";

const UnitTypeInfo = () => {
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    const getData = async () => {
      try {
        setIsLoading(true);
        const { data } = await axiosInstance.get(`/user/unitType/${id}`);
        if (data.success) {
          setData(data.unitType);
        }
      } catch (error) {
        handleError(error);
      } finally {
        setIsLoading(false);
      }
    };
    getData();
  }, [id]);

  return (
    <Loading loading={isLoading}>
      <Card title={"Unit Type Info"} headerslot={<BackButton />}>
        <div className="p-6 grid gap-6">
          {data ? (
            <>
              {/* Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">{data.name}</h2>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    data.status ? "bg-green-600/20 text-green-600" : "bg-red-600/20 text-red-600"
                  }`}
                >
                  {data.status ? "Active" : "Inactive"}
                </span>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem
                  icon={<Building2 className="w-4 h-4" />}
                  label="Project"
                  value={data.project?.name}
                />
                <InfoItem icon={<Ruler className="w-4 h-4" />} label="Size (sqft)" value={data.sizeSqft} />
                <InfoItem
                  icon={<DollarSign className="w-4 h-4" />}
                  label="Base Price (Lakhs)"
                  value={data.basePriceLakhs}
                />
                <InfoItem icon={<Layers className="w-4 h-4" />} label="Total Units" value={data.totalUnits} />
                <InfoItem
                  icon={<Layers className="w-4 h-4" />}
                  label="Available Units"
                  value={data.availableUnits}
                />
                <InfoItem
                  icon={<CheckCircle className="w-4 h-4" />}
                  label="Fine Acres Eligible"
                  value={data.fineAcresEligible}
                />
                <InfoItem
                  icon={<CheckCircle className="w-4 h-4" />}
                  label="Property Type Eligible"
                  value={data.propertyTypeEligible}
                />
                <InfoItem
                  icon={<Calendar className="w-4 h-4" />}
                  label="Created At"
                  value={new Date(data.createdAt).toLocaleString()}
                />
              </div>

              {/* Branch Info */}
              <div className="mt-6 border-t pt-4">
                <h3 className="text-lg font-semibold mb-2 text-white">Branch</h3>
                <p className="text-muted-foreground">
                  {data.branch?.name} ({data.branch?.code})
                </p>
              </div>

              {/* User Info */}
              <div className="mt-4 border-t pt-4">
                <h3 className="text-lg font-semibold mb-2 text-white">Created By</h3>
                <div className="flex items-center gap-3">
                  <User className="w-6 h-6 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-white">{data.user?.name}</p>
                    <p className="text-sm text-muted-foreground">{data.user?.email}</p>
                    <p className="text-xs text-muted-foreground uppercase">{data.user?.role}</p>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <p className="text-center text-muted-foreground">No data found.</p>
          )}
        </div>
      </Card>
    </Loading>
  );
};

const InfoItem = ({ icon, label, value }) => (
  <div className="flex items-start gap-2 p-3 rounded-xl bg-muted/30">
    {icon}
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-medium break-words">{value}</p>
    </div>
  </div>
);

export default UnitTypeInfo;
