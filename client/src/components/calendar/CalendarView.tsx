import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus, Trash2, Edit3, Loader2 } from "lucide-react";
import { useCalendarEvents, useCalendarMutations } from "@/hooks/useCalendarEvents";
import { CalendarEventSkeleton } from "@/components/shared/SkeletonLoaders";
import { EmptyState } from "@/components/shared/EmptyState";
import { motion, AnimatePresence } from "framer-motion";

export default function CalendarView() {
  const { calendarEvents, isLoading } = useCalendarEvents();
  const { createEvent, deleteEvent } = useCalendarMutations();

  const [formData, setFormData] = useState({
    title: "",
    location: "",
    startTime: "",
    endTime: "",
    eventType: "",
  });

  const handleCreate = () => {
    if (formData.title && formData.startTime && formData.endTime && formData.eventType) {
      createEvent.mutate(
        {
          ...formData,
          description: "",
          color: "blue",
        },
        {
          onSuccess: () => {
            setFormData({
              title: "",
              location: "",
              startTime: "",
              endTime: "",
              eventType: "",
            });
          },
        }
      );
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">Family Calendar</h2>
          <p className="text-gray-600 dark:text-gray-400">Smart scheduling with conflict detection</p>
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <CalendarEventSkeleton key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-100 mb-2">Family Calendar</h2>
        <p className="text-gray-600 dark:text-gray-400">Smart scheduling with conflict detection</p>
      </div>

      {/* Create Event Form */}
      <Card className="bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800 mb-6">
        <CardContent className="p-6">
          <h3 className="font-semibold text-green-800 dark:text-green-300 mb-3 flex items-center">
            <Calendar className="h-5 w-5 text-green-600 dark:text-green-400 mr-2" />
            Schedule New Event
          </h3>
          <div className="grid md:grid-cols-2 gap-3 mb-3">
            <Input
              placeholder="Event title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            <Input
              placeholder="Location (optional)"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            />
          </div>
          <div className="grid md:grid-cols-3 gap-3 mb-3">
            <Input
              type="datetime-local"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
            />
            <Input
              type="datetime-local"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
            />
            <select
              className="px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
              value={formData.eventType}
              onChange={(e) => setFormData({ ...formData, eventType: e.target.value })}
            >
              <option value="">Event type</option>
              <option value="family">Family</option>
              <option value="work">Work</option>
              <option value="school">School</option>
              <option value="sports">Sports</option>
              <option value="medical">Medical</option>
              <option value="social">Social</option>
            </select>
          </div>
          <div className="flex justify-end">
            <Button
              onClick={handleCreate}
              disabled={!formData.title || !formData.startTime || !formData.endTime || !formData.eventType || createEvent.isPending}
              className="bg-green-600 hover:bg-green-700"
            >
              {createEvent.isPending ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Plus className="h-4 w-4 mr-2" />
              )}
              Add Event
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Events List */}
      {calendarEvents.length === 0 ? (
        <EmptyState
          icon={<Calendar className="h-12 w-12 text-green-500" />}
          title="No events scheduled"
          description="Create your first calendar event to start organizing your family's schedule!"
        />
      ) : (
        <div className="space-y-4">
          <AnimatePresence>
            {calendarEvents.map((event) => (
              <motion.div
                key={event.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                            {new Date(event.startTime).getDate()}
                          </div>
                          <div className="text-sm text-blue-600 dark:text-blue-400">
                            {new Date(event.startTime).toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}
                          </div>
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-800 dark:text-gray-100">{event.title}</h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {formatDate(event.startTime.toString())} - {formatDate(event.endTime.toString())}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="secondary" className="capitalize">
                              {event.eventType}
                            </Badge>
                            {event.location && (
                              <span className="text-xs text-gray-500 dark:text-gray-400">{event.location}</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteEvent.mutate(event.id)}
                        disabled={deleteEvent.isPending}
                        className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
