import { Loader2, AlertTriangle } from "lucide-react";
import { useGetStudentByIdQuery } from "./studentsApi";

// Read-only profile view - "View" button isko kholta hai.
function InfoRow({ label, value }) {
  return (
    <div>
      <p className="text-[11px] text-slate-400">{label}</p>
      <p className="text-sm font-medium text-ink">{value || "—"}</p>
    </div>
  );
}

function StudentProfileView({ studentId }) {
  const { data, isLoading, isError, error } = useGetStudentByIdQuery(studentId, {
    skip: !studentId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-400">
        <Loader2 className="animate-spin mr-2" size={20} /> Loading profile...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-coral gap-2">
        <AlertTriangle size={28} />
        <p className="text-sm">{error?.data?.message || "Failed to load student profile"}</p>
      </div>
    );
  }

  const user = data?.data?.user;
  const profile = data?.data?.profile;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-marigold-soft flex items-center justify-center font-display font-bold text-xl text-marigold shrink-0 overflow-hidden">
          {user?.avatar?.url ? (
            <img src={user.avatar.url} alt={user.name} className="w-full h-full object-cover" />
          ) : (
            user?.name?.charAt(0)
          )}
        </div>
        <div>
          <p className="font-display font-bold text-ink text-lg">{user?.name}</p>
          <p className="text-sm text-slate-400">{user?.email}</p>
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wide">Academic Details</p>
        <div className="grid grid-cols-2 gap-4 bg-slate-50 rounded-xl p-4">
          <InfoRow label="Roll No" value={profile?.rollNo} />
          <InfoRow label="Admission No" value={profile?.admissionNo} />
          <InfoRow label="Class" value={profile?.classId?.name} />
          <InfoRow label="Section" value={profile?.sectionId?.name} />
          <InfoRow
            label="Admission Date"
            value={
              profile?.admissionDate
                ? new Date(profile.admissionDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
                : null
            }
          />
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wide">Personal Details</p>
        <div className="grid grid-cols-2 gap-4 bg-slate-50 rounded-xl p-4">
          <InfoRow
            label="Date of Birth"
            value={profile?.dob ? new Date(profile.dob).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : null}
          />
          <InfoRow label="Gender" value={profile?.gender} />
          <InfoRow label="Blood Group" value={profile?.bloodGroup} />
          <InfoRow label="Address" value={profile?.address} />
        </div>
      </div>

      {profile?.parentId && (
        <div>
          <p className="text-xs font-semibold text-slate-500 mb-3 uppercase tracking-wide">Parent / Guardian</p>
          <div className="grid grid-cols-2 gap-4 bg-slate-50 rounded-xl p-4">
            <InfoRow label="Name" value={profile.parentId.name} />
            <InfoRow label="Phone" value={profile.parentId.phone} />
            <InfoRow label="Email" value={profile.parentId.email} />
            <InfoRow label="Occupation" value={profile.parentId.occupation} />
          </div>
        </div>
      )}
    </div>
  );
}

export default StudentProfileView;
