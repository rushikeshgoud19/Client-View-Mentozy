import { Search, Filter, Star, Linkedin, Loader2, Calendar } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getMentors, Mentor, createBooking } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

import { BookingModal } from '../components/booking/BookingModal';

export function MentorsPage() {
  const [mentors, setMentors] = useState<Mentor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMentor, setSelectedMentor] = useState<Mentor | null>(null);

  useEffect(() => {
    async function loadMentors() {
      setLoading(true);
      const data = await getMentors();
      setMentors(data);
      setLoading(false);
    }
    loadMentors();
  }, []);


  const { user } = useAuth();
  const navigate = useNavigate();

  const handleBookClick = (mentor: Mentor) => {
    if (!user) {
      toast.error("Please log in to book a session");
      navigate('/login');
      return;
    }
    setSelectedMentor(mentor);
  };

  const handleConfirmBooking = async (date: Date, timeSlot: string) => {
    if (!selectedMentor || !user) return false;

    // Convert local date to ISO string while preserving the time
    // This is a naive implementation; in prod use date-fns-tz or dayjs
    const scheduledTime = date.toISOString();

    const success = await createBooking(user.id, selectedMentor.id, scheduledTime);
    if (success) {
      toast.success(`Session requested with ${selectedMentor.name}! Check your dashboard.`);
      navigate('/student-dashboard');
      return true;
    } else {
      toast.error("Failed to book session. Please try again.");
      return false;
    }
  };

  return (
    <div className="pt-24 pb-20 bg-gray-50 min-h-screen font-sans">
      <div className="container mx-auto px-6">

        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Find your <span className="text-amber-600">Mentor</span>
          </h1>
          <p className="text-lg text-gray-600">
            Connect with industry experts who have walked the path you want to take.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-10 flex flex-col md:flex-row gap-4">
          <div className="relative flex-grow">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, company, or skill..."
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none transition-all"
            />
          </div>
          <button className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-gray-200 rounded-xl font-medium text-gray-700 hover:border-amber-300 hover:text-amber-700 transition-colors">
            <Filter className="w-4 h-4" /> Filters
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
          </div>
        ) : (
          /* Mentors Grid */
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mentors.map((mentor) => (
              <div key={mentor.id} className="bg-white rounded-2xl p-6 border border-gray-200 hover:border-amber-200 hover:shadow-xl transition-all duration-300 group">
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold ${mentor.image}`}>
                      {mentor.initials}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg group-hover:text-amber-600 transition-colors">{mentor.name}</h3>
                      <p className="text-sm text-gray-500 font-medium">{mentor.role}</p>
                      <p className="text-xs text-gray-400">at {mentor.company}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">
                    <Star className="w-3 h-3 text-amber-500 fill-current" />
                    <span className="text-xs font-bold text-amber-700">{mentor.rating}</span>
                  </div>
                </div>

                <div className="space-y-3 mb-6">
                  <div className="flex flex-wrap gap-2">
                    {mentor.expertise.map((skill, i) => (
                      <span key={i} className="px-2 py-1 bg-gray-50 text-gray-600 text-xs rounded-md border border-gray-100">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-50 flex gap-3">
                  <button
                    onClick={() => handleBookClick(mentor)}
                    className="flex-1 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-amber-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <Calendar className="w-4 h-4" /> Book Session
                  </button>
                  <button className="p-2.5 border border-gray-200 rounded-xl text-gray-500 hover:text-blue-600 hover:border-blue-200 transition-colors">
                    <Linkedin className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <BookingModal
        isOpen={!!selectedMentor}
        onClose={() => setSelectedMentor(null)}
        mentorName={selectedMentor?.name || ''}
        userPlan="Free" // Mock plan state
        onConfirm={handleConfirmBooking}
      />
    </div>
  );
}