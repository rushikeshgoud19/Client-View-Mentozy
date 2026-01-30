
import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getUserProfile, updateUserProfile, Profile } from '../../lib/api';
import { DashboardLayout } from '../components/dashboard/DashboardLayout';
import { Loader2, User, Save, Camera, Mail, Lock } from 'lucide-react';
import { toast } from 'sonner';

export function ProfilePage() {
    const { user } = useAuth();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        full_name: '',
        bio: '', // Note: 'bio' is not on the base Profile type in API, but we might want to support it for Mentors later or use a different field. 
        // For now, let's stick to fields we know exist on Profile interface: full_name, avatar_url, school, grade, phone, interests
        school: '',
        grade: '',
        phone: ''
    });

    useEffect(() => {
        async function loadProfile() {
            if (!user) return;
            try {
                const data = await getUserProfile(user.id);
                if (data) {
                    setProfile(data);
                    setFormData({
                        full_name: data.full_name || '',
                        bio: '', // Placeholder if we extend Profile later
                        school: data.school || '',
                        grade: data.grade || '',
                        phone: data.phone || ''
                    });
                }
            } catch (error) {
                console.error("Error loading profile:", error);
                toast.error("Failed to load profile");
            } finally {
                setLoading(false);
            }
        }
        loadProfile();
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setSaving(true);
        try {
            // Only update fields that exist on Profile interface
            const updates: Partial<Profile> = {
                full_name: formData.full_name,
                school: formData.school,
                grade: formData.grade,
                phone: formData.phone
            };

            const updatedProfile = await updateUserProfile(user.id, updates);

            if (updatedProfile) {
                setProfile(updatedProfile);
                toast.success("Profile updated successfully");
            } else {
                throw new Error("Update failed");
            }
        } catch (error) {
            console.error("Error updating profile:", error);
            toast.error("Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
            </div>
        );
    }

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Account Settings</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Left Column: Avatar & Basic Info */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm text-center">
                            <div className="relative inline-block mb-4 group">
                                <div className="w-32 h-32 rounded-full bg-gray-100 mx-auto overflow-hidden border-4 border-white shadow-lg">
                                    {profile?.avatar_url ? (
                                        <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-indigo-50 text-indigo-300">
                                            <User className="w-16 h-16" />
                                        </div>
                                    )}
                                </div>
                                <button className="absolute bottom-0 right-0 p-2 bg-indigo-600 rounded-full text-white shadow-lg hover:bg-indigo-700 transition-colors">
                                    <Camera className="w-4 h-4" />
                                </button>
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">{profile?.full_name || 'User'}</h2>
                            <p className="text-sm text-gray-500 capitalize">{profile?.role}</p>

                            <div className="mt-6 pt-6 border-t border-gray-100 flex items-center justify-center gap-2 text-gray-500 text-sm">
                                <Mail className="w-4 h-4" />
                                {profile?.email || user?.email}
                            </div>
                        </div>

                        {/* Password / Security Placeholder */}
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Lock className="w-4 h-4 text-gray-400" /> Security
                            </h3>
                            <button className="w-full py-2.5 border border-gray-200 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                                Change Password
                            </button>
                        </div>
                    </div>

                    {/* Right Column: Edit Form */}
                    <div className="md:col-span-2">
                        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-900 mb-6">Profile Details</h3>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700">Full Name</label>
                                        <input
                                            type="text"
                                            name="full_name"
                                            value={formData.full_name}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                                            placeholder="Your full name"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700">Phone Number</label>
                                        <input
                                            type="tel"
                                            name="phone"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                                            placeholder="+1 (555) 000-0000"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700">School / Organization</label>
                                        <input
                                            type="text"
                                            name="school"
                                            value={formData.school}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                                            placeholder="Where do you study/work?"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-700">Grade / Role</label>
                                        <input
                                            type="text"
                                            name="grade"
                                            value={formData.grade}
                                            onChange={handleChange}
                                            className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                                            placeholder="e.g. 10th Grade, Senior Dev"
                                        />
                                    </div>
                                </div>

                                {/* Bio Section - Currently disabled as mapped to DB correctly yet for students */}
                                {/* 
                                <div className="space-y-2">
                                    <label className="text-sm font-bold text-gray-700">Bio</label>
                                    <textarea
                                        name="bio"
                                        value={formData.bio}
                                        onChange={handleChange}
                                        rows={4}
                                        className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all resize-none"
                                        placeholder="Tell us a bit about yourself..."
                                    />
                                </div> 
                                */}

                                <div className="pt-4 flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 hover:bg-indigo-700 disabled:opacity-70 transition-all flex items-center gap-2"
                                    >
                                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                        Save Changes
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

export default ProfilePage;
