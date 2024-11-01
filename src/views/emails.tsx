"use client";
import Pagination from "@/components/extends/Pagination/Pagination";
import { useEmailFilter } from "@/contexts/FilterEmailContext";
import FilterEmail from "@/components/Filter/filterEmail";
import EmailToolbar from "@/sections/emails/EmailToolbar";
import EmailItem from "@/sections/emails/EmailItem";
import { handleError, runService } from "@/utils/service_utils";
import {
  getMailings,
  getMailingTotalCount,
  MailingModel,
} from "@/services/mailingService";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";

export default function Emails(
  { campaignId, cadenceId }: { campaignId?: string; cadenceId?: string } = {
    cadenceId: "",
    campaignId: "",
  }
) {
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);
  const { emailFilterConfig } = useEmailFilter();
  const [mailings, setMailings] = useState<MailingModel[]>([]);
  const currentParams = Object.fromEntries(useSearchParams());
  const isInitialRendering = useRef(true);

  const fetchMailings = (params: { [key: string]: string }) => {
    const offset = pageSize * (currentPage - 1);
    const limit = pageSize;
    runService(
      {
        offset: offset,
        limit: limit,
        campaignId: campaignId,
        cadenceId: cadenceId,
        fromUser: emailFilterConfig.fromUser,
        search: emailFilterConfig.search,
        params,
      },
      getMailings,
      (data) => {
        setMailings(data);
      },
      (status, error) => {
        handleError(status, error);
        console.log(status, error);
      }
    );
  };

  const fetchMailingTotalCount = (params: { [key: string]: string }) => {
    runService(
      {
        campaignId: campaignId,
        cadenceId: cadenceId,
        fromUser: emailFilterConfig.fromUser,
        search: emailFilterConfig.search,
        params,
      },
      getMailingTotalCount,
      (data) => {
        console.log("Mailing total", data);
        setTotalCount(data?.count ? data?.count : 0);
      },
      (status, error) => {
        handleError(status, error);
        console.log(status, error);
      }
    );
  };

  useEffect(() => {
    if (isInitialRendering.current) {
      isInitialRendering.current = false;
      return;
    }
    fetchMailingTotalCount(emailFilterConfig.params);
    fetchMailings(emailFilterConfig.params);
  }, [emailFilterConfig, currentPage, pageSize]);

  return (
    <div className="flex gap-4 p-4 flex-1 overflow-auto">
      {emailFilterConfig.isOpen && <FilterEmail />}
      <div className="card p-4 pt-7 flex-1 flex flex-col gap-2 overflow-auto shadow-lg min-w-[420px]">
        <div className="overflow-auto">
          <EmailToolbar />
        </div>

        {/* Table */}
        <div className="flex flex-1 flex-col w-full align-middle overflow-auto">
          <div className="w-full h-full border rounded-md overflow-auto">
            {mailings.length > 0 ? (
              mailings.map((mailing: MailingModel) => (
                <EmailItem key={mailing.id} mailing={mailing} />
              ))
            ) : (
              <div className="h-full flex flex-1 justify-center items-center">
                <p className="text-gray-900 text-sm">No mailings</p>
              </div>
            )}
          </div>
        </div>
        {/* Pagination */}
        <div className="flex justify-end">
          <Pagination
            className="pagination-bar"
            totalCount={totalCount}
            pageSize={pageSize}
            onPageChange={(pageSize: number, currentPage: number) => {
              setPageSize(pageSize);
              setCurrentPage(currentPage);
            }}
          />
        </div>
      </div>
    </div>
  );
}
