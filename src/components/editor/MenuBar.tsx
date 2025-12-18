
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
      className="h-10 flex items-center px-3 text-sm select-none"
      style={{
        background: 'var(--panel-elevated)',
        fontFamily: 'var(--font-display)',
        letterSpacing: '0.05em'
      }}
    >
      {/* File Menu */}
      <div className="relative">
        <button
          className={`px-4 py-2 rounded font-semibold tracking-wider transition-all ${
            openMenu === "file" ? "neon-text" : ""
          }`}
          style={{
            background: openMenu === "file" ? 'rgba(0, 229, 255, 0.1)' : 'transparent',
            color: openMenu === "file" ? 'var(--cyan-neon)' : 'var(--text-secondary)',
            border: openMenu === "file" ? '1px solid var(--cyan-neon)' : '1px solid transparent'
          }}
          onClick={() => handleMenuClick("file")}
          onMouseEnter={() => handleMenuHover("file")}
        >
          FILE
        </button>
        {openMenu === "file" && (
          <div className="absolute top-full left-0 mt-2 w-56 cyber-panel-elevated rounded-lg shadow-lg z-50 overflow-hidden" style={{ border: '1px solid var(--ui-border-bright)' }}>
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
          className={`px-4 py-2 rounded font-semibold tracking-wider transition-all ${
            openMenu === "edit" ? "neon-text" : ""
          }`}
          style={{
            background: openMenu === "edit" ? 'rgba(0, 229, 255, 0.1)' : 'transparent',
            color: openMenu === "edit" ? 'var(--cyan-neon)' : 'var(--text-secondary)',
            border: openMenu === "edit" ? '1px solid var(--cyan-neon)' : '1px solid transparent'
          }}
          onClick={() => handleMenuClick("edit")}
          onMouseEnter={() => handleMenuHover("edit")}
        >
          EDIT
        </button>
        {openMenu === "edit" && (
          <div className="absolute top-full left-0 mt-2 w-56 cyber-panel-elevated rounded-lg shadow-lg z-50 overflow-hidden" style={{ border: '1px solid var(--ui-border-bright)' }}>
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
          className={`px-4 py-2 rounded font-semibold tracking-wider transition-all ${
            openMenu === "add" ? "neon-text" : ""
          }`}
          style={{
            background: openMenu === "add" ? 'rgba(0, 229, 255, 0.1)' : 'transparent',
            color: openMenu === "add" ? 'var(--cyan-neon)' : 'var(--text-secondary)',
            border: openMenu === "add" ? '1px solid var(--cyan-neon)' : '1px solid transparent'
          }}
          onClick={() => handleMenuClick("add")}
          onMouseEnter={() => handleMenuHover("add")}
        >
          ADD
        </button>
        {openMenu === "add" && (
          <div className="absolute top-full left-0 mt-2 w-56 cyber-panel-elevated rounded-lg shadow-lg z-50 overflow-hidden" style={{ border: '1px solid var(--ui-border-bright)' }}>
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
          className={`px-4 py-2 rounded font-semibold tracking-wider transition-all ${
            openMenu === "view" ? "neon-text" : ""
          }`}
          style={{
            background: openMenu === "view" ? 'rgba(0, 229, 255, 0.1)' : 'transparent',
            color: openMenu === "view" ? 'var(--cyan-neon)' : 'var(--text-secondary)',
            border: openMenu === "view" ? '1px solid var(--cyan-neon)' : '1px solid transparent'
          }}
          onClick={() => handleMenuClick("view")}
          onMouseEnter={() => handleMenuHover("view")}
        >
          VIEW
        </button>
        {openMenu === "view" && (
          <div className="absolute top-full left-0 mt-2 w-56 cyber-panel-elevated rounded-lg shadow-lg z-50 overflow-hidden" style={{ border: '1px solid var(--ui-border-bright)' }}>
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
          className={`px-4 py-2 rounded font-semibold tracking-wider transition-all ${
            openMenu === "help" ? "neon-text" : ""
          }`}
          style={{
            background: openMenu === "help" ? 'rgba(0, 229, 255, 0.1)' : 'transparent',
            color: openMenu === "help" ? 'var(--cyan-neon)' : 'var(--text-secondary)',
            border: openMenu === "help" ? '1px solid var(--cyan-neon)' : '1px solid transparent'
          }}
          onClick={() => handleMenuClick("help")}
          onMouseEnter={() => handleMenuHover("help")}
        >
          HELP
        </button>
        {openMenu === "help" && (
          <div className="absolute top-full left-0 mt-2 w-56 cyber-panel-elevated rounded-lg shadow-lg z-50 overflow-hidden" style={{ border: '1px solid var(--ui-border-bright)' }}>
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
      className={`w-full text-left px-4 py-3 flex items-center justify-between font-medium tracking-wide transition-all ${
        disabled
          ? "cursor-not-allowed opacity-40"
          : ""
      }`}
      style={{
        background: disabled ? 'transparent' : undefined,
        color: disabled ? 'var(--text-muted)' : 'var(--text-primary)',
        fontFamily: 'var(--font-display)'
      }}
      onMouseEnter={(e) => !disabled && (e.currentTarget.style.background = 'rgba(0, 229, 255, 0.1)')}
      onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
    >
      <span>{label.toUpperCase()}</span>
      {shortcut && (
        <span className="text-xs ml-6" style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-code)' }}>{shortcut}</span>
      )}
    </button>
  );
}

function MenuDivider() {
  return <div className="holographic-divider my-1" />;
}
