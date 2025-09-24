"use client";
import React, { Fragment } from "react";
import Card from "@/components/ui/Card";
import { Tab } from "@headlessui/react";
import Personal from "./components/Personal";

const newButtons = [
  {
    title: "Personal",
    icon: "heroicons-outline:home",
  },
];

const Setting = () => {
  return (
    <Card bodyClass="p-4 md:p-6 text-white" title="Settings">
      <Tab.Group>
        <div className="grid grid-cols-12 md:gap-10">
          <div className="lg:col-span-4 md:col-span-5 col-span-12">
            <Tab.List className="grid grid-cols-1  mb-5 gap-2">
              {newButtons.map((item, i) => (
                <Tab key={i} as={Fragment}>
                  {({ selected }) => (
                    <button
                      className={`md:w-full text-center text-sm lg:text-base font-medium capitalize ring-0 focus:ring-0 focus:outline-none px-3 rounded-md py-2.5 transition duration-150
                                                ${
                                                  selected
                                                    ? "text-white bg-gradient-to-bl from-[#D4AF37] to-[#9b7f24]"
                                                    : "text-slate-200 bg-[#0c1221] dark:bg-slate-700 border border-slate-700"
                                                }
                                            `}
                    >
                      {item.title}
                    </button>
                  )}
                </Tab>
              ))}
            </Tab.List>
          </div>
          <div className="lg:col-span-8 md:col-span-7 col-span-12">
            <Tab.Panels>
              <Tab.Panel>
                <Personal />
              </Tab.Panel>
            </Tab.Panels>
          </div>
        </div>
      </Tab.Group>
    </Card>
  );
};

export default Setting;
