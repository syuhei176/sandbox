"use client";

import { useState, useRef, useEffect } from "react";

interface MenuBarProps {
  onNewProject: () => void;
  onSave: () => void;
  onSaveAs: () => void;
  onLoad: () => void;
  onExport: () => void;
  onImport: () => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onAddGameObject: () => void;
  onAddScript: () => void;
  hasSelection: boolean;
  canSaveAs: boolean;
}

type MenuId = "file" | "edit" | "add" | "view" | "help" | null;

export function MenuBar({
  onNewProject,
  onSave,
  onSaveAs,
  onLoad,
  onExport,
  onImport,
  onDuplicate,
  onDelete,
  onAddGameObject,
  onAddScript,
  hasSelection,
  canSaveAs,
}: MenuBarProps) {
  const [openMenu, setOpenMenu] = useState<MenuId>(null);
  const [isAnyMenuOpen, setIsAnyMenuOpen] = useState(false);
  const menuBarRef = useRef<HTMLDivElement>(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuBarRef.current &&
        !menuBarRef.current.contains(event.target as Node)
      ) {
        setOpenMenu(null);
        setIsAnyMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMenuClick = (menuId: MenuId) => {
    if (openMenu === menuId) {
      setOpenMenu(null);
      setIsAnyMenuOpen(false);
    } else {
      setOpenMenu(menuId);
      setIsAnyMenuOpen(true);
    }
  };

  const handleMenuHover = (menuId: MenuId) => {
    if (isAnyMenuOpen) {
      setOpenMenu(menuId);
    }
  };

  const handleMenuItemClick = (action: () => void) => {
    action();
    setOpenMenu(null);
    setIsAnyMenuOpen(false);
  };

  return (
    <div
      ref={menuBarRef}
      className="h-8 bg-gray-800 border-b border-gray-700 flex items-center px-2 text-sm select-none"
    >
      {/* File Menu */}
      <div className="relative">
        <button
          className={`px-3 py-1 hover:bg-gray-700 rounded ${
            openMenu === "file" ? "bg-gray-700" : ""
          }`}
          onClick={() => handleMenuClick("file")}
          onMouseEnter={() => handleMenuHover("file")}
        >
          File
        </button>
        {openMenu === "file" && (
          <div className="absolute top-full left-0 mt-1 w-48 bg-gray-800 border border-gray-700 rounded shadow-lg z-50">
            <MenuItem
              label="New Project"
              shortcut="Ctrl+N"
              onClick={() => handleMenuItemClick(onNewProject)}
            />
            <MenuItem
              label="Save"
              shortcut="Ctrl+S"
              onClick={() => handleMenuItemClick(onSave)}
            />
            {canSaveAs && (
              <MenuItem
                label="Save As..."
                onClick={() => handleMenuItemClick(onSaveAs)}
              />
            )}
            <MenuItem
              label="Load Project..."
              onClick={() => handleMenuItemClick(onLoad)}
            />
            <MenuDivider />
            <MenuItem
              label="Export JSON"
              onClick={() => handleMenuItemClick(onExport)}
            />
            <MenuItem
              label="Import JSON"
              onClick={() => handleMenuItemClick(onImport)}
            />
          </div>
        )}
      </div>

      {/* Edit Menu */}
      <div className="relative">
        <button
          className={`px-3 py-1 hover:bg-gray-700 rounded ${
            openMenu === "edit" ? "bg-gray-700" : ""
          }`}
          onClick={() => handleMenuClick("edit")}
          onMouseEnter={() => handleMenuHover("edit")}
        >
          Edit
        </button>
        {openMenu === "edit" && (
          <div className="absolute top-full left-0 mt-1 w-48 bg-gray-800 border border-gray-700 rounded shadow-lg z-50">
            <MenuItem
              label="Duplicate"
              shortcut="Ctrl+D"
              onClick={() => handleMenuItemClick(onDuplicate)}
              disabled={!hasSelection}
            />
            <MenuItem
              label="Delete"
              shortcut="Delete"
              onClick={() => handleMenuItemClick(onDelete)}
              disabled={!hasSelection}
            />
          </div>
        )}
      </div>

      {/* Add Menu */}
      <div className="relative">
        <button
          className={`px-3 py-1 hover:bg-gray-700 rounded ${
            openMenu === "add" ? "bg-gray-700" : ""
          }`}
          onClick={() => handleMenuClick("add")}
          onMouseEnter={() => handleMenuHover("add")}
        >
          Add
        </button>
        {openMenu === "add" && (
          <div className="absolute top-full left-0 mt-1 w-48 bg-gray-800 border border-gray-700 rounded shadow-lg z-50">
            <MenuItem
              label="GameObject"
              onClick={() => handleMenuItemClick(onAddGameObject)}
            />
            <MenuDivider />
            <MenuItem
              label="Script"
              onClick={() => handleMenuItemClick(onAddScript)}
            />
          </div>
        )}
      </div>

      {/* View Menu */}
      <div className="relative">
        <button
          className={`px-3 py-1 hover:bg-gray-700 rounded ${
            openMenu === "view" ? "bg-gray-700" : ""
          }`}
          onClick={() => handleMenuClick("view")}
          onMouseEnter={() => handleMenuHover("view")}
        >
          View
        </button>
        {openMenu === "view" && (
          <div className="absolute top-full left-0 mt-1 w-48 bg-gray-800 border border-gray-700 rounded shadow-lg z-50">
            <MenuItem
              label="Reset Layout"
              onClick={() =>
                handleMenuItemClick(() => console.log("Reset layout"))
              }
              disabled
            />
          </div>
        )}
      </div>

      {/* Help Menu */}
      <div className="relative">
        <button
          className={`px-3 py-1 hover:bg-gray-700 rounded ${
            openMenu === "help" ? "bg-gray-700" : ""
          }`}
          onClick={() => handleMenuClick("help")}
          onMouseEnter={() => handleMenuHover("help")}
        >
          Help
        </button>
        {openMenu === "help" && (
          <div className="absolute top-full left-0 mt-1 w-48 bg-gray-800 border border-gray-700 rounded shadow-lg z-50">
            <MenuItem
              label="Documentation"
              onClick={() =>
                handleMenuItemClick(() =>
                  window.open("https://github.com/anthropics/claude-code", "_blank")
                )
              }
            />
            <MenuItem
              label="Keyboard Shortcuts"
              onClick={() =>
                handleMenuItemClick(() => console.log("Show shortcuts"))
              }
              disabled
            />
            <MenuDivider />
            <MenuItem
              label="About"
              onClick={() =>
                handleMenuItemClick(() => console.log("Show about"))
              }
              disabled
            />
          </div>
        )}
      </div>
    </div>
  );
}

interface MenuItemProps {
  label: string;
  shortcut?: string;
  onClick: () => void;
  disabled?: boolean;
}

function MenuItem({ label, shortcut, onClick, disabled }: MenuItemProps) {
  return (
    <button
      className={`w-full text-left px-3 py-2 flex items-center justify-between ${
        disabled
          ? "text-gray-500 cursor-not-allowed"
          : "hover:bg-gray-700 text-gray-200"
      }`}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      <span>{label}</span>
      {shortcut && (
        <span className="text-xs text-gray-500 ml-4">{shortcut}</span>
      )}
    </button>
  );
}

function MenuDivider() {
  return <div className="h-px bg-gray-700 my-1" />;
}
