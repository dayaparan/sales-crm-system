"use client";

import BackButton from "@/components/ui/BackButton";
import Card from "@/components/ui/Card";
import Loading from "@/components/ui/Loading";
import axiosInstance from "@/lib/axiosInstance";
import handleError from "@/lib/handleError";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import { MapPin, Phone, Mail, Calendar, CheckCircle, XCircle, User } from "lucide-react";

const TerritoryInfo = () => {
  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    const getData = async () => {
      try {
        setIsLoading(true);
        const { data } = await axiosInstance.get(`/user/territory/${id}`);
        if (data.success) {
          setData(data.territory);
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
      <Card title={"Territory Info"} headerslot={<BackButton />}>
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

              {/* Branch Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem icon={<MapPin className="w-4 h-4" />} label="Branch" value={`${data.branch?.name} (${data.branch?.code})`} />
                <InfoItem icon={<MapPin className="w-4 h-4" />} label="Address" value={data.branch?.address} />
                <InfoItem icon={<MapPin className="w-4 h-4" />} label="City" value={data.branch?.city} />
                <InfoItem icon={<MapPin className="w-4 h-4" />} label="Country" value={data.branch?.country} />
                <InfoItem icon={<Phone className="w-4 h-4" />} label="Phone" value={data.branch?.phone} />
                <InfoItem icon={<Mail className="w-4 h-4" />} label="Email" value={data.branch?.email} />
                <InfoItem icon={<Calendar className="w-4 h-4" />} label="Created At" value={new Date(data.createdAt).toLocaleString()} />
              </div>

              {/* User Info */}
              <div className="mt-6 border-t pt-4">
                <h3 className="text-lg font-semibold mb-2">Created By</h3>
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

export default TerritoryInfo;