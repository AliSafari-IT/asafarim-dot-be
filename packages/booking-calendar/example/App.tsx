// packages/booking-calendar/example/App.tsx
import { useState } from 'react';
import { BookingCalendar } from '../src';
import { BookingEvent, CalendarView } from '../src/types';
import '../src/styles/calendar.css';
import '../src/styles/grid.css';
import '../src/styles/modal.css';
import '../src/styles/badges.css';

const mockBookings: BookingEvent[] = [
  {
    id: '1',
    title: 'Project Kickoff',
    description: 'Initial meeting to discuss project scope',
    startTime: new Date(2025, 11, 10, 10, 0),
    endTime: new Date(2025, 11, 10, 11, 0),
    durationMinutes: 60,
    status: 'Confirmed',
    clientName: 'John Doe',
    clientEmail: 'john@example.com',
    clientPhone: '+1234567890',
    meetingReason: 'Project planning',
    location: 'Office',
    retryCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '2',
    title: 'Design Review',
    startTime: new Date(2025, 11, 11, 14, 0),
    endTime: new Date(2025, 11, 11, 15, 30),
    durationMinutes: 90,
    status: 'Pending',
    clientName: 'Jane Smith',
    clientEmail: 'jane@example.com',
    meetingReason: 'UI/UX review',
    retryCount: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

export default function App() {
  const [bookings, setBookings] = useState<BookingEvent[]>(mockBookings);
  const [view, setView] = useState<CalendarView>('week');
  const [currentDate, setCurrentDate] = useState(new Date());

  const handleCreateBooking = async (dto: any) => {
    const newBooking: BookingEvent = {
      id: Date.now().toString(),
      title: dto.title,
      description: dto.description,
      startTime: new Date(dto.startTime),
      endTime: new Date(dto.endTime),
      durationMinutes: Math.floor((new Date(dto.endTime).getTime() - new Date(dto.startTime).getTime()) / 60000),
      status: 'Pending',
      clientName: dto.clientName,
      clientEmail: dto.clientEmail,
      clientPhone: dto.clientPhone,
      meetingReason: dto.meetingReason,
      location: dto.location,
      retryCount: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setBookings([...bookings, newBooking]);
  };

  const handleUpdateBooking = async (id: string, dto: any) => {
    setBookings(bookings.map(b => 
      b.id === id
        ? {
            ...b,
            ...dto,
            startTime: dto.startTime ? new Date(dto.startTime) : b.startTime,
            endTime: dto.endTime ? new Date(dto.endTime) : b.endTime,
            updatedAt: new Date(),
          }
        : b
    ));
  };

  const handleDeleteBooking = async (id: string) => {
    setBookings(bookings.filter(b => b.id !== id));
  };

  return (
    <div style={{ height: '100vh' }}>
      <BookingCalendar
        bookings={bookings}
        onCreateBooking={handleCreateBooking}
        onUpdateBooking={handleUpdateBooking}
        onDeleteBooking={handleDeleteBooking}
        initialView={view}
        initialDate={currentDate}
      />
    </div>
  );
}