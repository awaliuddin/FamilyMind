import { useEffect, useState } from "react";
import { Command } from "cmdk";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  TrendingUp,
  ShoppingCart,
  Calendar,
  Lightbulb,
  Heart,
  Gift,
  Plus,
  Search,
} from "lucide-react";

interface CommandPaletteProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onAction?: (action: string) => void;
}

export function CommandPalette({ activeTab, onTabChange, onAction }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleSelect = (callback: () => void) => {
    callback();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="p-0 max-w-2xl">
        <Command className="rounded-lg border shadow-md">
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Command.Input
              placeholder="Search or jump to..."
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <Command.List className="max-h-[400px] overflow-y-auto p-2">
            <Command.Empty className="py-6 text-center text-sm text-muted-foreground">
              No results found.
            </Command.Empty>

            <Command.Group heading="Navigation" className="mb-2">
              <Command.Item
                onSelect={() => handleSelect(() => onTabChange('dashboard'))}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm cursor-pointer hover:bg-accent"
              >
                <TrendingUp className="h-4 w-4" />
                <span>Dashboard</span>
                {activeTab === 'dashboard' && (
                  <span className="ml-auto text-xs text-muted-foreground">Active</span>
                )}
              </Command.Item>
              <Command.Item
                onSelect={() => handleSelect(() => onTabChange('grocery'))}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm cursor-pointer hover:bg-accent"
              >
                <ShoppingCart className="h-4 w-4" />
                <span>Grocery Lists</span>
                {activeTab === 'grocery' && (
                  <span className="ml-auto text-xs text-muted-foreground">Active</span>
                )}
              </Command.Item>
              <Command.Item
                onSelect={() => handleSelect(() => onTabChange('calendar'))}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm cursor-pointer hover:bg-accent"
              >
                <Calendar className="h-4 w-4" />
                <span>Calendar</span>
                {activeTab === 'calendar' && (
                  <span className="ml-auto text-xs text-muted-foreground">Active</span>
                )}
              </Command.Item>
              <Command.Item
                onSelect={() => handleSelect(() => onTabChange('ideas'))}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm cursor-pointer hover:bg-accent"
              >
                <Lightbulb className="h-4 w-4" />
                <span>Family Ideas</span>
                {activeTab === 'ideas' && (
                  <span className="ml-auto text-xs text-muted-foreground">Active</span>
                )}
              </Command.Item>
              <Command.Item
                onSelect={() => handleSelect(() => onTabChange('vision'))}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm cursor-pointer hover:bg-accent"
              >
                <Heart className="h-4 w-4" />
                <span>Vision Board</span>
                {activeTab === 'vision' && (
                  <span className="ml-auto text-xs text-muted-foreground">Active</span>
                )}
              </Command.Item>
              <Command.Item
                onSelect={() => handleSelect(() => onTabChange('wishlist'))}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm cursor-pointer hover:bg-accent"
              >
                <Gift className="h-4 w-4" />
                <span>Wishlist</span>
                {activeTab === 'wishlist' && (
                  <span className="ml-auto text-xs text-muted-foreground">Active</span>
                )}
              </Command.Item>
            </Command.Group>

            <Command.Separator className="my-2" />

            <Command.Group heading="Quick Actions">
              <Command.Item
                onSelect={() => handleSelect(() => onAction?.('create-grocery-list'))}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm cursor-pointer hover:bg-accent"
              >
                <Plus className="h-4 w-4" />
                <span>Create Grocery List</span>
                <span className="ml-auto text-xs text-muted-foreground">Alt+G</span>
              </Command.Item>
              <Command.Item
                onSelect={() => handleSelect(() => onAction?.('create-event'))}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm cursor-pointer hover:bg-accent"
              >
                <Plus className="h-4 w-4" />
                <span>Add Calendar Event</span>
                <span className="ml-auto text-xs text-muted-foreground">Alt+C</span>
              </Command.Item>
              <Command.Item
                onSelect={() => handleSelect(() => onAction?.('create-idea'))}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm cursor-pointer hover:bg-accent"
              >
                <Plus className="h-4 w-4" />
                <span>Add Family Idea</span>
                <span className="ml-auto text-xs text-muted-foreground">Alt+I</span>
              </Command.Item>
            </Command.Group>
          </Command.List>
          <div className="border-t px-3 py-2 text-xs text-muted-foreground flex items-center justify-between">
            <span>Press <kbd className="px-1 py-0.5 bg-muted rounded">⌘K</kbd> to toggle</span>
            <span>Use arrow keys to navigate</span>
          </div>
        </Command>
      </DialogContent>
    </Dialog>
  );
}
