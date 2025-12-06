"use client";

import { useAtom } from "jotai";
import {
  eventTypeFiltersAtom,
  eventSubtypeFiltersAtom,
  mobileSidebarOpenAtom,
} from "@/lib/atoms";
import {
  DotsVerticalIcon,
  ChevronRightIcon,
  CheckIcon,
  ExitIcon,
  CalendarIcon,
} from "@radix-ui/react-icons";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import * as Checkbox from "@radix-ui/react-checkbox";
import { EventType, EVENT_SUBTYPES, EventSubtype } from "@/lib/types";
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

const organizationName = "Lackluster Org";
const organizationLogo = "/avatar.webp";

export default function LeftSidebar() {
  const [typeFilters, setTypeFilters] = useAtom(eventTypeFiltersAtom);
  const [subtypeFilters, setSubtypeFilters] = useAtom(eventSubtypeFiltersAtom);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useAtom(
    mobileSidebarOpenAtom
  );
  const [openMenus, setOpenMenus] = useState<Set<string>>(new Set());
  const [isMobile, setIsMobile] = useState(false);
  const [eventTypesExpanded, setEventTypesExpanded] = useState(true);
  const [expandedEventTypes, setExpandedEventTypes] = useState<Set<EventType>>(
    new Set()
  );

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
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

  const toggleSubtypeFilter = (
    subtype: EventSubtype,
    parentType?: EventType
  ) => {
    const newFilters = new Set(subtypeFilters);
    const isCurrentlyHidden = newFilters.has(subtype);

    if (isCurrentlyHidden) {
      // Showing the subtype - remove from filters
      newFilters.delete(subtype);
      // Also ensure parent type is shown
      if (parentType) {
        const newTypeFilters = new Set(typeFilters);
        newTypeFilters.delete(parentType);
        setTypeFilters(newTypeFilters);
      }
    } else {
      // Hiding the subtype - add to filters
      newFilters.add(subtype);
      // Check if all subtypes are now hidden, and if so, hide the parent
      if (parentType && hasSubtypes(parentType)) {
        const parentSubtypes = EVENT_SUBTYPES[parentType];
        const allSubtypesHidden = parentSubtypes.every((st) =>
          newFilters.has(st.value)
        );
        if (allSubtypesHidden) {
          const newTypeFilters = new Set(typeFilters);
          newTypeFilters.add(parentType);
          setTypeFilters(newTypeFilters);
        }
      }
    }
    setSubtypeFilters(newFilters);
  };

  const hasSubtypes = (
    type: EventType
  ): type is "meeting" | "deadline" | "company-event" => {
    return (
      type === "meeting" || type === "deadline" || type === "company-event"
    );
  };

  const toggleEventTypesExpanded = () => {
    setEventTypesExpanded(!eventTypesExpanded);
  };

  const toggleEventTypeExpanded = (type: EventType) => {
    const newExpanded = new Set(expandedEventTypes);
    if (newExpanded.has(type)) {
      newExpanded.delete(type);
    } else {
      newExpanded.add(type);
    }
    setExpandedEventTypes(newExpanded);
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

      <motion.div
        initial={false}
        animate={{
          x: isMobile ? (mobileSidebarOpen ? 0 : -256) : 0,
        }}
        transition={{
          type: "spring",
          bounce: 0,
          duration: 0.3,
          ease: "easeOut",
        }}
        className="md:flex fixed md:relative inset-y-0 left-0 z-50 md:z-auto w-64 shrink-0 py-6 px-2 border-r border-zinc-300 flex-col bg-[#fafafa]"
      >
        <div className="space-y-6 flex-1 text-sm">
          <div className="flex items-center justify-between pl-2 pr-1">
            <div className="flex items-center gap-2">
              <Image
                src={organizationLogo}
                alt="Daniel Nguyen"
                width={32}
                height={32}
                className="rounded-full"
              />
              <h2 className="font-semibold">{organizationName}</h2>
            </div>
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="md:hidden rounded-md p-1 hover:bg-zinc-100"
              aria-label="Close menu"
            >
              <ExitIcon className="h-4 w-4 text-zinc-400 rotate-180 hover:text-zinc-600" />
            </button>
          </div>

          <div className="space-y-2">
            <div
              className="text-sm hover:bg-zinc-100 cursor-pointer rounded-md p-2 px-2 flex justify-between group items-center"
              onClick={toggleEventTypesExpanded}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  toggleEventTypesExpanded();
                }
              }}
            >
              <div className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-zinc-400" />
                Calendar
              </div>
              <ChevronRightIcon
                className={`h-4 w-4 text-zinc-400 transition-all group-hover:text-zinc-800 ${
                  eventTypesExpanded ? "rotate-90" : ""
                }`}
              />
            </div>
            {eventTypesExpanded && (
              <motion.div
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: {},
                  visible: {
                    transition: {
                      staggerChildren: 0.05,
                    },
                  },
                }}
              >
                {EVENT_TYPES.map((eventType) => {
                const typeHidden = typeFilters.has(eventType.value);
                const subtypes = hasSubtypes(eventType.value)
                  ? EVENT_SUBTYPES[eventType.value]
                  : null;

                let isHidden = typeHidden;
                if (subtypes) {
                  const allSubtypesHidden = subtypes.every((subtype) =>
                    subtypeFilters.has(subtype.value)
                  );
                  isHidden = typeHidden || allSubtypesHidden;
                }

                const isExpanded = expandedEventTypes.has(eventType.value);

                return (
                  <motion.div
                    key={eventType.value}
                    variants={{
                      hidden: { opacity: 0, y: -5 },
                      visible: { opacity: 1, y: 0 },
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    <div
                      className={`flex w-full items-center rounded-md py-2 pl-6 pr-2 transition-colors group ${
                        openMenus.has(eventType.value)
                          ? "bg-black/5"
                          : "hover:bg-black/5"
                      } ${subtypes ? "cursor-pointer" : ""}`}
                      onClick={
                        subtypes
                          ? () => toggleEventTypeExpanded(eventType.value)
                          : () => toggleTypeFilter(eventType.value)
                      }
                      role={subtypes ? "button" : undefined}
                      tabIndex={subtypes ? 0 : undefined}
                      onKeyDown={
                        subtypes
                          ? (e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                toggleEventTypeExpanded(eventType.value);
                              }
                            }
                          : undefined
                      }
                    >
                      <div className="flex flex-1 items-center gap-3">
                        <Checkbox.Root
                          checked={!typeHidden}
                          onCheckedChange={(checked) => {
                            if (!checked) {
                              // Hide
                              const newFilters = new Set(typeFilters);
                              newFilters.add(eventType.value);
                              setTypeFilters(newFilters);
                              // If the type has subtypes, also hide all subtypes
                              if (hasSubtypes(eventType.value)) {
                                const subtypes =
                                  EVENT_SUBTYPES[eventType.value];
                                const newSubtypeFilters = new Set(
                                  subtypeFilters
                                );
                                subtypes.forEach((subtype) => {
                                  newSubtypeFilters.add(subtype.value);
                                });
                                setSubtypeFilters(newSubtypeFilters);
                              }
                            } else {
                              // Show
                              const newFilters = new Set(typeFilters);
                              newFilters.delete(eventType.value);
                              setTypeFilters(newFilters);
                              // If the type has subtypes, also show all subtypes
                              if (hasSubtypes(eventType.value)) {
                                const subtypes =
                                  EVENT_SUBTYPES[eventType.value];
                                const newSubtypeFilters = new Set(
                                  subtypeFilters
                                );
                                subtypes.forEach((subtype) => {
                                  newSubtypeFilters.delete(subtype.value);
                                });
                                setSubtypeFilters(newSubtypeFilters);
                              }
                            }
                          }}
                          onClick={(e) => e.stopPropagation()}
                          className="flex h-4 w-4 items-center justify-center rounded border border-zinc-300 bg-white hover:bg-zinc-100 data-[state=checked]:border-black data-[state=checked]:bg-black"
                        >
                          <Checkbox.Indicator>
                            <CheckIcon className="h-3 w-3 text-white" />
                          </Checkbox.Indicator>
                        </Checkbox.Root>
                        <span
                          className={`flex-1 text-sm transition-opacity ${
                            isHidden ? "opacity-50" : ""
                          }`}
                        >
                          {eventType.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {subtypes && (
                          <ChevronRightIcon
                            className={`h-3.5 w-3.5 text-zinc-400 transition-all group-hover:text-zinc-800 ${
                              isExpanded ? "rotate-90" : ""
                            }`}
                          />
                        )}
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
                                  openMenus.has(eventType.value)
                                    ? "opacity-100"
                                    : "opacity-0 group-hover:opacity-100"
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
                                <DropdownMenu.Item className="px-3 py-2 text-sm text-zinc-700 rounded-md cursor-pointer hover:bg-zinc-100 outline-none">
                                  Sync to Google
                                </DropdownMenu.Item>
                              </DropdownMenu.Content>
                            </DropdownMenu.Portal>
                          </DropdownMenu.Root>
                        )}
                      </div>
                    </div>
                    {subtypes && isExpanded && (
                      <motion.div
                        className="ml-8"
                        initial="hidden"
                        animate="visible"
                        variants={{
                          hidden: {},
                          visible: {
                            transition: {
                              staggerChildren: 0.05,
                            },
                          },
                        }}
                      >
                        {subtypes.map((subtype) => {
                          const isSubtypeHidden = subtypeFilters.has(
                            subtype.value
                          );
                          const menuKey = `${eventType.value}-${subtype.value}`;
                          return (
                            <motion.div
                              key={subtype.value}
                              variants={{
                                hidden: { opacity: 0, y: -5 },
                                visible: { opacity: 1, y: 0 },
                              }}
                              transition={{ duration: 0.2 }}
                              className={`flex w-full items-center rounded-md px-2 py-1.5 transition-colors group ${
                                openMenus.has(menuKey)
                                  ? "bg-black/5"
                                  : "hover:bg-black/5"
                              }`}
                            >
                              <div className="flex flex-1 items-center gap-3">
                                <Checkbox.Root
                                  checked={!isSubtypeHidden}
                                  onCheckedChange={() => {
                                    toggleSubtypeFilter(
                                      subtype.value,
                                      eventType.value
                                    );
                                  }}
                                  className="flex h-4 w-4 items-center justify-center rounded border border-zinc-300 bg-white hover:bg-zinc-100 data-[state=checked]:border-black data-[state=checked]:bg-black"
                                >
                                  <Checkbox.Indicator>
                                    <CheckIcon className="h-3 w-3 text-white" />
                                  </Checkbox.Indicator>
                                </Checkbox.Root>
                                <span
                                  className={`flex-1 text-sm transition-opacity ${
                                    isSubtypeHidden ? "opacity-50" : ""
                                  }`}
                                >
                                  {subtype.label}
                                </span>
                              </div>
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
                                      openMenus.has(menuKey)
                                        ? "opacity-100"
                                        : "opacity-0 group-hover:opacity-100"
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
                                    <DropdownMenu.Item className="px-3 py-2 text-sm text-zinc-700 rounded-md cursor-pointer hover:bg-zinc-100 outline-none">
                                      Sync to Google
                                    </DropdownMenu.Item>
                                  </DropdownMenu.Content>
                                </DropdownMenu.Portal>
                              </DropdownMenu.Root>
                            </motion.div>
                          );
                        })}
                      </motion.div>
                    )}
                  </motion.div>
                );
                })}
              </motion.div>
            )}
          </div>

          {/* {typeFilters.size > 0 || subtypeFilters.size > 0 ? (
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
                setTypeFilters(
                  new Set(EVENT_TYPES.map((eventType) => eventType.value))
                );
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
          )} */}
        </div>
      </motion.div>
    </>
  );
}
