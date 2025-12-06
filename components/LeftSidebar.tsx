"use client";

import { useAtom } from "jotai";
import { eventTypeFiltersAtom, eventSubtypeFiltersAtom, mobileSidebarOpenAtom } from "@/lib/atoms";
import { DotsVerticalIcon, Cross2Icon } from "@radix-ui/react-icons";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { EventType, EVENT_COLORS, EVENT_SUBTYPES, EventSubtype } from "@/lib/types";
import Image from "next/image";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const EVENT_TYPES: { value: EventType; label: string }[] = [
  { value: "meeting", label: "Meetings" },
  { value: "company-event", label: "Company Events" },
  { value: "time-off", label: "Time Off" },
  { value: "birthday", label: "Birthdays" },
  { value: "work-anniversary", label: "Work Anniversaries" },
  { value: "deadline", label: "Deadlines" },
];

export default function LeftSidebar() {
  const [typeFilters, setTypeFilters] = useAtom(eventTypeFiltersAtom);
  const [subtypeFilters, setSubtypeFilters] = useAtom(eventSubtypeFiltersAtom);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useAtom(mobileSidebarOpenAtom);
  const [openMenus, setOpenMenus] = useState<Set<string>>(new Set());
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const toggleTypeFilter = (type: EventType) => {
    const newFilters = new Set(typeFilters);
    const isCurrentlyHidden = newFilters.has(type);
    
    if (isCurrentlyHidden) {
      newFilters.delete(type);
    } else {
      newFilters.add(type);
    }
    setTypeFilters(newFilters);
    
    // If the type has subtypes, also toggle all subtypes
    if (hasSubtypes(type)) {
      const subtypes = EVENT_SUBTYPES[type];
      const newSubtypeFilters = new Set(subtypeFilters);
      
      if (isCurrentlyHidden) {
        // Showing parent: remove all subtypes from filters
        subtypes.forEach((subtype) => {
          newSubtypeFilters.delete(subtype.value);
        });
      } else {
        // Hiding parent: add all subtypes to filters
        subtypes.forEach((subtype) => {
          newSubtypeFilters.add(subtype.value);
        });
      }
      
      setSubtypeFilters(newSubtypeFilters);
    }
  };

  const toggleSubtypeFilter = (subtype: EventSubtype) => {
    const newFilters = new Set(subtypeFilters);
    if (newFilters.has(subtype)) {
      newFilters.delete(subtype);
    } else {
      newFilters.add(subtype);
    }
    setSubtypeFilters(newFilters);
  };

  const hasSubtypes = (type: EventType): type is 'meeting' | 'deadline' | 'company-event' => {
    return type === 'meeting' || type === 'deadline' || type === 'company-event';
  };

  return (
    <>
      {/* Mobile Backdrop */}
      <AnimatePresence>
        {mobileSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setMobileSidebarOpen(false)}
          />
        )}
      </AnimatePresence>
      
      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{
          x: isMobile ? (mobileSidebarOpen ? 0 : -256) : 0,
        }}
        transition={{ type: "spring", bounce: 0, duration: 0.3, ease: "easeOut" }}
        className="md:flex fixed md:relative inset-y-0 left-0 z-50 md:z-auto w-64 shrink-0 py-6 px-2 border-r border-zinc-300 flex-col bg-white"
      >
        <div className="space-y-6 flex-1">
          <div className="flex items-center justify-between px-2">
            <h2 className="font-semibold">Lackluster Org</h2>
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="md:hidden rounded-md p-1 hover:bg-zinc-100"
              aria-label="Close menu"
            >
              <Cross2Icon className="h-5 w-5 text-zinc-600" />
            </button>
          </div>

        <div className="space-y-2">
          {EVENT_TYPES.map((eventType) => {
            const typeHidden = typeFilters.has(eventType.value);
            const colors = EVENT_COLORS[eventType.value];
            const subtypes = hasSubtypes(eventType.value) ? EVENT_SUBTYPES[eventType.value] : null;
            
            // For types with subtypes, check if all subtypes are hidden
            let isHidden = typeHidden;
            if (subtypes) {
              const allSubtypesHidden = subtypes.every((subtype) => subtypeFilters.has(subtype.value));
              // Parent appears hidden if the type is hidden OR all subtypes are hidden
              isHidden = typeHidden || allSubtypesHidden;
            }

            return (
              <div key={eventType.value}>
                <div className="flex w-full items-center rounded-md py-2">
                  <button
                    onClick={() => toggleTypeFilter(eventType.value)}
                    className={`flex flex-1 items-center gap-3 text-left rounded-md transition-colors cursor-pointer p-2 group relative ${
                      openMenus.has(eventType.value) ? 'bg-black/5' : 'hover:bg-black/5'
                    }`}
                  >
                    <div
                      className={`h-3 w-3 shrink-0 rounded ${colors.bg} ${colors.border} border`}
                    ></div>
                    <span
                      className={`flex-1 text-sm font-medium transition-opacity ${
                        isHidden ? "opacity-50" : ""
                      }`}
                    >
                      {eventType.label}
                    </span>
                    {!subtypes && (
                      <DropdownMenu.Root
                        open={openMenus.has(eventType.value)}
                        onOpenChange={(open) => {
                          const newOpenMenus = new Set(openMenus);
                          if (open) {
                            newOpenMenus.add(eventType.value);
                          } else {
                            newOpenMenus.delete(eventType.value);
                          }
                          setOpenMenus(newOpenMenus);
                        }}
                      >
                        <DropdownMenu.Trigger asChild>
                          <button
                            onClick={(e) => e.stopPropagation()}
                            className={`shrink-0 transition-opacity p-1 hover:bg-black/10 rounded ${
                              openMenus.has(eventType.value) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                            }`}
                          >
                            <DotsVerticalIcon className="h-4 w-4 text-zinc-600" />
                          </button>
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Portal>
                          <DropdownMenu.Content
                            className="min-w-[180px] bg-white rounded-md shadow-lg border border-zinc-300 p-1 z-50"
                            sideOffset={5}
                          >
                            <DropdownMenu.Item
                              className="px-3 py-2 text-sm text-zinc-700 rounded-md cursor-pointer hover:bg-zinc-100 outline-none"
                            >
                              Sync to Google
                            </DropdownMenu.Item>
                          </DropdownMenu.Content>
                        </DropdownMenu.Portal>
                      </DropdownMenu.Root>
                    )}
                  </button>
                </div>
                {subtypes && (
                  <div className="border-l border-zinc-200 ml-3.5">
                    {subtypes.map((subtype) => {
                      const isSubtypeHidden = subtypeFilters.has(subtype.value);
                      const menuKey = `${eventType.value}-${subtype.value}`;
                      return (
                        <div
                          key={subtype.value}
                          className={`flex w-full items-center rounded-md px-2 py-1.5 transition-colors cursor-pointer group ${
                            openMenus.has(menuKey) ? 'bg-black/5' : 'hover:bg-black/5'
                          }`}
                        >
                          <button
                            onClick={() => toggleSubtypeFilter(subtype.value)}
                            className="flex flex-1 items-center gap-3 text-left"
                          >
                            <div
                              className={`h-3 w-3 shrink-0 rounded ${colors.bg} ${colors.border} border`}
                            />
                            <span
                              className={`flex-1 text-sm font-medium transition-opacity ${
                                isSubtypeHidden ? "opacity-50" : ""
                              }`}
                            >
                              {subtype.label}
                            </span>
                          </button>
                          <DropdownMenu.Root
                            open={openMenus.has(menuKey)}
                            onOpenChange={(open) => {
                              const newOpenMenus = new Set(openMenus);
                              if (open) {
                                newOpenMenus.add(menuKey);
                              } else {
                                newOpenMenus.delete(menuKey);
                              }
                              setOpenMenus(newOpenMenus);
                            }}
                          >
                            <DropdownMenu.Trigger asChild>
                              <button
                                onClick={(e) => e.stopPropagation()}
                                className={`shrink-0 transition-opacity p-1 hover:bg-black/10 rounded ${
                                  openMenus.has(menuKey) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                                }`}
                              >
                                <DotsVerticalIcon className="h-3.5 w-3.5 text-zinc-600" />
                              </button>
                            </DropdownMenu.Trigger>
                            <DropdownMenu.Portal>
                              <DropdownMenu.Content
                                className="min-w-[180px] bg-white rounded-md shadow-lg border border-zinc-300 p-1 z-50"
                                sideOffset={5}
                              >
                                <DropdownMenu.Item
                                  className="px-3 py-2 text-sm text-zinc-700 rounded-md cursor-pointer hover:bg-zinc-100 outline-none"
                                >
                                  Sync to Google
                                </DropdownMenu.Item>
                              </DropdownMenu.Content>
                            </DropdownMenu.Portal>
                          </DropdownMenu.Root>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {typeFilters.size > 0 || subtypeFilters.size > 0 ? (
          <button
            onClick={() => {
              setTypeFilters(new Set());
              setSubtypeFilters(new Set());
            }}
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium hover:bg-zinc-100"
          >
            Show all
          </button>
        ) : (
          <button
            onClick={() => {
              setTypeFilters(new Set(EVENT_TYPES.map((eventType) => eventType.value)));
              // Hide all subtypes as well
              const allSubtypes: EventSubtype[] = [];
              EVENT_TYPES.forEach((eventType) => {
                if (hasSubtypes(eventType.value)) {
                  const subtypes = EVENT_SUBTYPES[eventType.value];
                  allSubtypes.push(...subtypes.map((s) => s.value));
                }
              });
              setSubtypeFilters(new Set(allSubtypes));
            }}
            className="w-full rounded-md border border-zinc-300 bg-white px-3 py-2 text-sm font-medium hover:bg-zinc-100"
          >
            Hide all
          </button>
        )}
      </div>

      <div className="mt-auto pt-6 px-2">
        <div className="flex items-center gap-3">
          <Image
            src="/avatar.webp"
            alt="Daniel Nguyen"
            width={32}
            height={32}
            className="rounded-full"
          />
          <span className="text-sm font-medium">Daniel Nguyen</span>
        </div>
      </div>
    </motion.div>
    </>
  );
}
