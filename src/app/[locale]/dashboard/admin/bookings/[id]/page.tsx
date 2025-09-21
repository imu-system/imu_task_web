
import { redirect } from '@/navigation';

export default function AdminBookingDetailPage({ params }: { params: { id: string } }) {
  // Redirect to the list view with the booking ID as a query param
  // The list view will handle opening the sheet.
  redirect(`/dashboard/admin/bookings?bookingId=${params.id}`);
}
