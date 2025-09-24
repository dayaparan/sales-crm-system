"use client";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";

const ConfirmationDialog = ({ isOpen, closeDialog, onConfirm }) => {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-[999999999999999999]"
        onClose={closeDialog}
      >
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm" />
        </Transition.Child>

        {/* Dialog Panel */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-[#0c1221] p-6 text-left align-middle shadow-xl transition-all border border-gray-700">
                {/* Title */}
                <Dialog.Title
                  as="h3"
                  className="text-lg font-semibold leading-6 text-white"
                >
                  Confirm Action
                </Dialog.Title>

                {/* Body */}
                <div className="mt-4">
                  <p className="text-sm text-gray-300">
                    Are you sure you want to proceed? This action cannot be
                    undone.
                  </p>
                </div>

                {/* Buttons */}
                <div className="mt-6 flex justify-end gap-4">
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-gray-600 bg-transparent px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-600 focus:ring-offset-0"
                    onClick={closeDialog}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md bg-purple-700 hover:bg-purple-600 px-4 py-2 text-sm font-medium text-white shadow-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-0"
                    onClick={() => {
                      if (onConfirm) onConfirm();
                      closeDialog();
                    }}
                  >
                    Confirm
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ConfirmationDialog;
