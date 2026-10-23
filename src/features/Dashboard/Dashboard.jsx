import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Users,
  GraduationCap,
  BookOpen,
  UserCheck,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  Clock3,
  ChevronRight,
} from "lucide-react";
import { getDashboardData } from "../../app/api/managementApis";

const DashboardPage = () => {
  const navigate = useNavigate();
  const [accountDashboard, setAccountDashboard] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState("");

  const loadDashboard = async () => {
    try {
      setDashboardLoading(true);
      setDashboardError("");
      const data = await getDashboardData();
      setAccountDashboard(data);
    } catch (error) {
      console.error("Dashboard API error:", error);
      setDashboardError(
        error?.response?.data?.message ||
          "Unable to load dashboard data. Please try again."
      );
    } finally {
      setDashboardLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const stats = [
    {
      title: "Total Students",
      value: accountDashboard?.totalStudents,
      icon: Users,
      iconStyle: "bg-teal-50 text-teal-700",
      accent: "border-t-teal-500",
    },
    {
      title: "Total Teachers",
      value: accountDashboard?.totalTeachers,
      icon: GraduationCap,
      iconStyle: "bg-blue-50 text-blue-700",
      accent: "border-t-blue-500",
    },
    {
      title: "Total Courses",
      value: accountDashboard?.totalCourses,
      icon: BookOpen,
      iconStyle: "bg-violet-50 text-violet-700",
      accent: "border-t-violet-500",
    },
    {
      title: "Total Enrolled",
      value: accountDashboard?.totalEnrolled,
      icon: UserCheck,
      iconStyle: "bg-emerald-50 text-emerald-700",
      accent: "border-t-emerald-500",
    },
  ];

  const courses = Array.isArray(accountDashboard?.courses)
    ? accountDashboard.courses
    : [];

  const formatNumber = (value) =>
    typeof value === "number" ? value.toLocaleString() : "—";

  return (
    <div className="min-h-screen bg-[#F8FAFB]">
      <div className="mx-auto max-w-screen-2xl px-4 py-8 md:px-8">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-slate-900">
              Dashboard
            </h1>
            <p className="font-medium text-slate-500">
              Overview of students, teachers, courses, and enrollments.
            </p>
          </div>
          <button
            type="button"
            onClick={loadDashboard}
            disabled={dashboardLoading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-3 font-bold text-white transition-colors hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${dashboardLoading ? "animate-spin" : ""}`}
            />
            Refresh data
          </button>
        </div>

        {dashboardError && (
          <div
            role="alert"
            className="mb-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700"
          >
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <div className="flex-1 text-sm">{dashboardError}</div>
            <button
              type="button"
              onClick={loadDashboard}
              className="text-sm font-bold underline"
            >
              Retry
            </button>
          </div>
        )}

        <div className="mb-8 grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.title}
                className={`rounded-2xl border border-slate-100 border-t-4 ${stat.accent} bg-white p-6 shadow-sm transition-shadow hover:shadow-md`}
              >
                <div className="mb-5 flex items-start justify-between">
                  <div className={`rounded-xl p-3 ${stat.iconStyle}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className="rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500">
                    Overview
                  </span>
                </div>
                <p className="mb-1 text-sm font-semibold text-slate-500">
                  {stat.title}
                </p>
                <p className="text-3xl font-extrabold text-slate-900">
                  {dashboardLoading ? "..." : formatNumber(stat.value)}
                </p>
              </div>
            );
          })}
        </div>

        <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Course Enrollment Summary
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Enrollment and payment status for each course.
              </p>
            </div>
            <button
              type="button"
              onClick={() => navigate("/students")}
              className="inline-flex items-center gap-1 self-start text-sm font-bold text-teal-700 hover:text-teal-800 sm:self-auto"
            >
              View students <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          {dashboardLoading ? (
            <div className="p-10 text-center text-sm font-medium text-slate-500">
              Loading course summary...
            </div>
          ) : dashboardError ? (
            <div className="p-10 text-center text-sm text-slate-500">
              Course summary is unavailable until the dashboard data loads.
            </div>
          ) : courses.length === 0 ? (
            <div className="p-10 text-center">
              <BookOpen className="mx-auto mb-3 h-8 w-8 text-slate-300" />
              <p className="font-semibold text-slate-700">
                No course summary available
              </p>
              <p className="mt-1 text-sm text-slate-500">
                The API returned no courses to display.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px]">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Course
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                      Enrolled Students
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                      Fully Paid
                    </th>
                    <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-slate-500">
                      Due Students
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-slate-500">
                      Payment Overview
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {courses.map((course, index) => {
                    const enrolled = Number(course.enrolledStudents) || 0;
                    const paid = Number(course.fullyPaidStudents) || 0;
                    const paidPercent =
                      enrolled > 0
                        ? Math.min(100, Math.round((paid / enrolled) * 100))
                        : 0;

                    return (
                      <tr
                        key={course.courseId ?? `${course.courseTitle}-${index}`}
                        className="transition-colors hover:bg-slate-50"
                      >
                        <td className="px-6 py-5">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                              <BookOpen className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-bold text-slate-900">
                                {course.courseTitle || "Untitled course"}
                              </p>
                              <p className="mt-1 text-xs text-slate-500">
                                Course ID: {course.courseId ?? "—"}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-5 text-right font-bold text-slate-800">
                          {formatNumber(course.enrolledStudents)}
                        </td>
                        <td className="px-6 py-5 text-right">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">
                            <CheckCircle2 className="h-4 w-4" />
                            {formatNumber(course.fullyPaidStudents)}
                          </span>
                        </td>
                        <td className="px-6 py-5 text-right">
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-sm font-semibold text-amber-700">
                            <Clock3 className="h-4 w-4" />
                            {formatNumber(course.dueStudents)}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="mb-2 flex items-center justify-between gap-3 text-xs">
                            <span className="font-semibold text-slate-600">
                              Paid students
                            </span>
                            <span className="font-bold text-slate-800">
                              {paidPercent}%
                            </span>
                          </div>
                          <div
                            className="h-2 overflow-hidden rounded-full bg-slate-100"
                            aria-label={`${paidPercent}% of enrolled students fully paid`}
                          >
                            <div
                              className="h-full rounded-full bg-emerald-500 transition-all"
                              style={{ width: `${paidPercent}%` }}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <p className="mt-5 text-xs text-slate-400">
          Dashboard figures are loaded from the account dashboard API.
        </p>
      </div>
    </div>
  );
};

export default DashboardPage;
