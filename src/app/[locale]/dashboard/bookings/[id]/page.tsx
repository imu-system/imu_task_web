
import { redirect } from '@/navigation';

export default function BookingDetailPage({ params }: { params: { id: string } }) {
  // Redirect to the list view with the booking ID as a query param
  // The list view will handle opening the sheet.
  redirect(`/dashboard/bookings?bookingId=${params.id}`);
}
