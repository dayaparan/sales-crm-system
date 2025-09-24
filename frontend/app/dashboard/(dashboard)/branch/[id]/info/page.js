"use client";

import BackButton from "@/components/ui/BackButton";
import Card from "@/components/ui/Card";
import Loading from "@/components/ui/Loading";
import axiosInstance from "@/lib/axiosInstance";
import handleError from "@/lib/handleError";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { Mail, Phone, MapPin, Clock, DollarSign, CheckCircle, XCircle } from "lucide-react";
import { formatImageName } from "@/lib/functions";

const BranchInfo = () => {
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    const getData = async () => {
      try {
        setIsLoading(true);
        const { data } = await axiosInstance.get(`/user/branch/${id}`);
        if (data.success) {
          setData(data.branch);
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
      <Card title={"Branch Info"} headerslot={<BackButton />}>
        <div className="p-6 grid gap-6">
          {data ? (
            <>
              {/* Header Section */}
              <div className="flex items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-white">{data.name}</h2>
                  <p className="text-muted-foreground text-sm">Code: {data.code}</p>
                </div>
              </div>

              {/* Grid Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem
                  icon={<MapPin className="w-4 h-4" />}
                  label="Address"
                  value={`${data.address}, ${data.city}, ${data.country}`}
                />
                <InfoItem icon={<Clock className="w-4 h-4" />} label="Timezone" value={data.timezone} />
                <InfoItem icon={<DollarSign className="w-4 h-4" />} label="Currency" value={data.currency} />
                <InfoItem icon={<Phone className="w-4 h-4" />} label="Phone" value={data.phone} />
                <InfoItem icon={<Mail className="w-4 h-4" />} label="Email" value={data.email} />
                <InfoItem
                  icon={
                    data.status ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )
                  }
                  label="Status"
                  value={data.status ? "Active" : "Inactive"}
                />
              </div>

              {/* Created By Section */}
              <div className="mt-6 border-t pt-4">
                <h3 className="text-lg font-semibold mb-2">Created By</h3>
                <div className="flex items-center gap-3">
                  <img
                    src={formatImageName(data.createdBy?.profile)}
                    alt={data.createdBy?.name}
                    className="object-cover rounded-xl"
                  />
                  <div>
                    <p className="font-medium text-white">{data.createdBy?.name}</p>
                    <p className="text-sm text-muted-foreground">{data.createdBy?.email}</p>
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

export default BranchInfo;
