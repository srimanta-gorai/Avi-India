
import { useEffect, useMemo, useState } from "react";
import {
  RefreshCw,
  GraduationCap,
  Users,
  Search,
  Mail,
  Phone,
  ShieldCheck,
  ShieldAlert,
  AlertCircle,
} from "lucide-react";
import {
  getStudents,
  getActiveStudents,
} from "../../app/api/managementApis";

const unwrapRecords = (data) => {
  if (Array.isArray(data)) return data;

  if (data && typeof data === "object") {
    for (const key of ["data", "content", "students", "records", "items"]) {
      if (Array.isArray(data[key])) return data[key];
    }
  }

  return null;
};

const Students = () => {
  const [students, setStudents] = useState([]);
  const [activeStudents, setActiveStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [responseWarning, setResponseWarning] = useState("");

  const loadStudents = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    setError("");
    setResponseWarning("");

    try {
      const [allResponse, activeResponse] = await Promise.all([
        getStudents(),
        getActiveStudents(),
      ]);

      const allRecords = unwrapRecords(allResponse);
      const activeRecords = unwrapRecords(activeResponse);

      setStudents(allRecords ?? []);
      setActiveStudents(activeRecords ?? []);

      if (allRecords === null || activeRecords === null) {
        setResponseWarning(
          "The API response format could not be recognized."
        );
      }
    } catch (err) {
      console.error("Failed to load students:", err);
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load student data. Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadStudents();
  }, []);

  const filteredStudents = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return students;

    return students.filter((student) =>
      [
        student?.id,
        student?.name,
        student?.email,
        student?.phone,
        student?.status,
      ].some((value) =>
        String(value ?? "").toLowerCase().includes(query)
      )
    );
  }, [students, search]);

  return (
    <main className="min-w-0 w-full space-y-6 p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-teal-700">
            ONLINE LEARNING ADMINISTRATION
          </p>
          <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            Student Management
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            View and search student records.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadStudents(true)}
          disabled={loading || refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-teal-800 disabled:opacity-60"
        >
          <RefreshCw
            className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {/* Error */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <AlertCircle className="h-5 w-5 shrink-0" />
          <div>
            <p className="font-bold">Could not load student data</p>
            <p className="mt-1">{error}</p>
            <button
              type="button"
              onClick={() => loadStudents(true)}
              className="mt-2 font-bold underline"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Summary cards */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {[
          {
            title: "Total Students",
            value: students.length,
            icon: Users,
            style: "bg-teal-50 text-teal-700",
          },
          {
            title: "Active Students",
            value: activeStudents.length,
            icon: GraduationCap,
            style: "bg-cyan-50 text-cyan-700",
          },
        ].map((card) => {
          const Icon = card.icon;

          return (
            <article
              key={card.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
            >
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-semibold text-slate-500">
                    {card.title}
                  </p>
                  <p className="mt-3 text-3xl font-black text-slate-900">
                    {loading ? "—" : card.value}
                  </p>
                </div>
                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${card.style}`}
                >
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </article>
          );
        })}
      </section>

      {/* Student table */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Student Records
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {loading
                ? "Loading records..."
                : `${filteredStudents.length} of ${students.length} students`}
            </p>
          </div>

          <div className="relative w-full sm:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search name, email, phone..."
              aria-label="Search students"
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-teal-600 focus:bg-white focus:ring-2 focus:ring-teal-100"
            />
          </div>
        </div>

        {responseWarning && !error && (
          <p className="bg-amber-50 p-4 text-sm text-amber-800">
            {responseWarning}
          </p>
        )}

        {loading ? (
          <div className="p-10 text-center text-sm text-slate-500">
            Loading student records...
          </div>
        ) : error ? (
          <div className="p-10 text-center text-sm text-slate-500">
            Student records could not be displayed.
          </div>
        ) : filteredStudents.length === 0 ? (
          <div className="p-10 text-center">
            <GraduationCap className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 font-semibold text-slate-700">
              No students found
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Try another search term.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[850px] w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-bold">Student</th>
                  <th className="px-5 py-4 font-bold">Contact</th>
                  <th className="px-5 py-4 font-bold">Student ID</th>
                  <th className="px-5 py-4 font-bold">Status</th>
                  <th className="px-5 py-4 font-bold">Email Verified</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredStudents.map((student, index) => (
                  <tr
                    key={student.id ?? index}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {student.profileImageUrl ? (
                          <img
                            src={student.profileImageUrl}
                            alt=""
                            className="h-10 w-10 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-50 font-bold text-teal-700">
                            {(student.name || "S")
                              .trim()
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-slate-800">
                            {student.name || "Unnamed student"}
                          </p>
                          <p className="text-xs text-slate-500">
                            {student.email || "No email provided"}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Phone className="h-4 w-4 text-slate-400" />
                        {student.phone || "—"}
                      </div>
                      <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                        <Mail className="h-3.5 w-3.5 text-slate-400" />
                        {student.email || "—"}
                      </div>
                    </td>

                    <td className="px-5 py-4 font-semibold text-slate-700">
                      {student.id ?? "—"}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ${
                          student.status === "ACTIVE"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {student.status || "Unknown"}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      {student.emailVerified === true ? (
                        <span className="inline-flex items-center gap-1.5 font-semibold text-emerald-700">
                          <ShieldCheck className="h-4 w-4" />
                          Verified
                        </span>
                      ) : student.emailVerified === false ? (
                        <span className="inline-flex items-center gap-1.5 font-semibold text-amber-700">
                          <ShieldAlert className="h-4 w-4" />
                          Not verified
                        </span>
                      ) : (
                        <span className="text-slate-500">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
};

export default Students;
