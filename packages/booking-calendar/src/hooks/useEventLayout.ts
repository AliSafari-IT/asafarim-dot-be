// packages/booking-calendar/src/hooks/useEventLayout.ts
import { BookingEvent } from '../types';
import { differenceInMinutes, startOfDay } from 'date-fns';

export function useEventLayout() {
  const getEventPosition = (event: BookingEvent, day: Date) => {
    const dayStart = startOfDay(day);
    const eventStart = new Date(event.startTime);
    const eventEnd = new Date(event.endTime);
    
    const startMinutes = differenceInMinutes(eventStart, dayStart);
    const durationMinutes = differenceInMinutes(eventEnd, eventStart);
    
    const top = (startMinutes / (24 * 60)) * 100;
    const height = (durationMinutes / (24 * 60)) * 100;
    
    return {
      top,
      height,
      left: 0,
      width: 95,
    };
  };

  const detectOverlaps = (events: BookingEvent[], day: Date) => {
    const dayEvents = events.filter(e => {
      const eventDate = new Date(e.startTime);
      return eventDate.toDateString() === day.toDateString();
    });

    const groups: BookingEvent[][] = [];
    dayEvents.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    dayEvents.forEach(event => {
      let placed = false;
      for (const group of groups) {
        const hasOverlap = group.some(e => {
          const e1Start = new Date(e.startTime).getTime();
          const e1End = new Date(e.endTime).getTime();
          const e2Start = new Date(event.startTime).getTime();
          const e2End = new Date(event.endTime).getTime();
          return e1Start < e2End && e2Start < e1End;
        });
        if (!hasOverlap) {
          group.push(event);
          placed = true;
          break;
        }
      }
      if (!placed) {
        groups.push([event]);
      }
    });

    return groups;
  };

  return { getEventPosition, detectOverlaps };
}