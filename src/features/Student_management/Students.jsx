
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
  CreditCard,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  IndianRupee,
} from "lucide-react";

import {
  getStudents,
  getActiveStudents,
  getPaymentStudents,
} from "../../app/api/managementApis";

import {
  PaymentStatus,
  paymentStatuses,
  fromById,
} from "../../app/enums/paymentStauts";

const PAYMENT_TYPES = [
  { label: "All statuses", value: "ALL" },
  ...paymentStatuses.map((status) => ({
    label: status.charAt(0) + status.slice(1).toLowerCase(),
    value: status,
  })),
];

const unwrapRecords = (data) => {
  if (Array.isArray(data)) return data;

  if (data && typeof data === "object") {
    for (const key of ["data", "content", "students", "records", "items"]) {
      if (Array.isArray(data[key])) return data[key];
    }
  }

  return null;
};

const formatAmount = (value) =>
  Number(value ?? 0).toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  });

const getErrorMessage = (err, fallback) =>
  err?.response?.data?.message ||
  err?.response?.data?.error ||
  err?.message ||
  fallback;

const getStatusClasses = (status) => {
  const value = String(status ?? "").toUpperCase();

  if (
    value === "ACTIVE" ||
    value === "PAID" ||
    value === "COMPLETED" ||
    value === "VERIFIED"
  ) {
    return "bg-emerald-50 text-emerald-700 ring-emerald-600/20";
  }

  if (value === "PARTIAL" || value === "PENDING") {
    return "bg-amber-50 text-amber-700 ring-amber-600/20";
  }

  if (
    value === "INACTIVE" ||
    value === "CANCELLED" ||
    value === "REFUNDED" ||
    value === "REJECTED"
  ) {
    return "bg-rose-50 text-rose-700 ring-rose-600/20";
  }

  return "bg-slate-100 text-slate-700 ring-slate-500/20";
};

const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${getStatusClasses(
      status
    )}`}
  >
    {status || "Unknown"}
  </span>
);

const EmptyState = ({ title, description }) => (
  <div className="flex flex-col items-center justify-center px-4 py-12 text-center">
    <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
      <Users size={23} />
    </div>
    <p className="font-semibold text-slate-800">{title}</p>
    <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>
  </div>
);

const ErrorMessage = ({ message, onRetry }) => (
  <div className="flex flex-col gap-3 rounded-xl border border-rose-200 bg-rose-50 p-4 sm:flex-row sm:items-center sm:justify-between">
    <div className="flex items-start gap-3">
      <AlertCircle className="mt-0.5 shrink-0 text-rose-600" size={19} />
      <div>
        <p className="text-sm font-semibold text-rose-800">
          Something went wrong
        </p>
        <p className="mt-1 break-words text-sm text-rose-700">{message}</p>
      </div>
    </div>

    {onRetry && (
      <button
        type="button"
        onClick={onRetry}
        className="shrink-0 rounded-lg border border-rose-300 bg-white px-3 py-2 text-sm font-semibold text-rose-700 transition hover:bg-rose-100"
      >
        Try again
      </button>
    )}
  </div>
);

const Students = () => {
  // Existing student management state
  const [students, setStudents] = useState([]);
  const [activeStudents, setActiveStudents] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [responseWarning, setResponseWarning] = useState("");

  // View selector
  const [view, setView] = useState("students");

  // Student payment state
  const [paymentStudents, setPaymentStudents] = useState([]);
  const [paymentType, setPaymentType] = useState("ALL");
  const [paymentSearch, setPaymentSearch] = useState("");
  const [paymentPage, setPaymentPage] = useState(0);
  const [paymentSize] = useState(20);
  const [paymentTotalElements, setPaymentTotalElements] = useState(0);
  const [paymentTotalPages, setPaymentTotalPages] = useState(0);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  const loadStudents = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

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
          "The API response format could not be recognized. Some student information may be unavailable."
        );
      }
    } catch (err) {
      console.error("Failed to load students:", err);

      setError(
        getErrorMessage(
          err,
          "Unable to load student data. Please try again."
        )
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

const loadPaymentStudents = async () => {
  setPaymentLoading(true);
  setPaymentError("");

  try {
    const selectedStatuses =
      paymentType === "ALL"
        ? paymentStatuses
        : [paymentType];

    const responses = await Promise.all(
      selectedStatuses.map((status) =>
        getPaymentStudents({
          type: PaymentStatus[status],
          q: paymentSearch.trim(),
          page: paymentPage,
          size: paymentSize,
        })
      )
    );

    const combinedRecords = responses.flatMap((response) => {
      if (!response || !Array.isArray(response.content)) {
        throw new Error("Unexpected payment API response format.");
      }

      return response.content;
    });

    // Avoid duplicate students when combining statuses.
    const uniqueRecords = Array.from(
      new Map(
        combinedRecords.map((student) => [
          student.id,
          student,
        ])
      ).values()
    );

    setPaymentStudents(uniqueRecords);

    setPaymentTotalElements(
      responses.reduce(
        (total, response) =>
          total + Number(response.totalElements ?? 0),
        0
      )
    );

    setPaymentTotalPages(
      Math.max(
        0,
        ...responses.map((response) =>
          Number(response.totalPages ?? 0)
        )
      )
    );
  } catch (err) {
    console.error("Failed to load payment students:", err);

    setPaymentError(
      getErrorMessage(
        err,
        "Unable to load payment records. Please try again."
      )
    );
  } finally {
    setPaymentLoading(false);
  }
};

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    if (view !== "payments") return undefined;

    const timer = setTimeout(() => {
      loadPaymentStudents();
    }, 300);

    return () => clearTimeout(timer);
  }, [view, paymentType, paymentSearch, paymentPage, paymentSize]);

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

  const handleViewChange = (nextView) => {
    setView(nextView);
  };

  const handlePaymentTypeChange = (event) => {
    setPaymentType(event.target.value);
    setPaymentPage(0);
  };

  const handlePaymentSearchChange = (event) => {
    setPaymentSearch(event.target.value);
    setPaymentPage(0);
  };

  const refreshCurrentView = () => {
    if (view === "payments") {
      loadPaymentStudents();
    } else {
      loadStudents(true);
    }
  };

  const isRefreshing = view === "payments" ? paymentLoading : refreshing || loading;

  return (
    <main className="min-w-0 w-full space-y-6 p-4 sm:p-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold tracking-wide text-teal-700">
            ONLINE LEARNING ADMINISTRATION
          </p>

          <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            Student Management
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage student records, enrollment information, and fee payments.
          </p>

          {/* View selector */}
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleViewChange("students")}
              aria-pressed={view === "students"}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                view === "students"
                  ? "bg-teal-700 text-white shadow-sm"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-teal-300 hover:text-teal-700"
              }`}
            >
              <GraduationCap size={17} />
              Students
            </button>

            <button
              type="button"
              onClick={() => handleViewChange("payments")}
              aria-pressed={view === "payments"}
              className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                view === "payments"
                  ? "bg-teal-700 text-white shadow-sm"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-teal-300 hover:text-teal-700"
              }`}
            >
              <CreditCard size={17} />
              Student Payments
            </button>
          </div>
        </div>

        <button
          type="button"
          onClick={refreshCurrentView}
          disabled={isRefreshing}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-teal-300 hover:text-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            size={16}
            className={isRefreshing ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* Student list view */}
      {view === "students" && (
        <>
          {error && <ErrorMessage message={error} onRetry={() => loadStudents(true)} />}

          {/* Summary cards */}
          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Total Students
                  </p>

                  <p className="mt-2 text-3xl font-black tracking-tight text-slate-900">
                    {loading ? "—" : students.length.toLocaleString("en-IN")}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    All available student records
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                  <Users size={23} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-slate-500">
                    Active Students
                  </p>

                  <p className="mt-2 text-3xl font-black tracking-tight text-slate-900">
                    {loading
                      ? "—"
                      : activeStudents.length.toLocaleString("en-IN")}
                  </p>

                  <p className="mt-1 text-xs text-slate-500">
                    Students returned by the active-students API
                  </p>
                </div>

                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700">
                  <GraduationCap size={23} />
                </div>
              </div>
            </div>
          </section>

          {/* Student records */}
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Student Records
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  View and search registered students.
                </p>
              </div>

              <div className="relative w-full sm:max-w-xs">
                <Search
                  size={17}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search students..."
                  aria-label="Search students"
                  className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10"
                />
              </div>
            </div>

            {responseWarning && (
              <div className="m-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                <AlertCircle size={18} className="mt-0.5 shrink-0" />
                <p>{responseWarning}</p>
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center gap-3 py-16 text-sm text-slate-500">
                <RefreshCw size={18} className="animate-spin" />
                Loading student records...
              </div>
            ) : error ? (
              <div className="p-4">
                <EmptyState
                  title="Student records unavailable"
                  description="Resolve the loading error above and try again."
                />
              </div>
            ) : filteredStudents.length === 0 ? (
              <EmptyState
                title="No students found"
                description={
                  search.trim()
                    ? "Try a different name, email, phone number, or student ID."
                    : "There are no student records to display."
                }
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[760px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-4 font-semibold">Student</th>
                      <th className="px-5 py-4 font-semibold">Contact</th>
                      <th className="px-5 py-4 font-semibold">Student ID</th>
                      <th className="px-5 py-4 font-semibold">Status</th>
                      <th className="px-5 py-4 font-semibold">
                        Email Verified
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {filteredStudents.map((student, index) => (
                      <tr
                        key={student?.id ?? `${student?.email ?? "student"}-${index}`}
                        className="transition hover:bg-slate-50/70"
                      >
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            {student?.profileImageUrl ? (
                              <img
                                src={student.profileImageUrl}
                                alt={student?.name || "Student"}
                                className="h-10 w-10 shrink-0 rounded-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-50 font-bold text-teal-700">
                                {String(student?.name || "S")
                                  .trim()
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>
                            )}

                            <div className="min-w-0">
                              <p className="truncate font-semibold text-slate-900">
                                {student?.name || "Unnamed student"}
                              </p>
                              <p className="mt-0.5 text-xs text-slate-500">
                                Student
                              </p>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-2 text-slate-600">
                              <Mail size={14} className="shrink-0 text-slate-400" />
                              <span className="max-w-[220px] truncate">
                                {student?.email || "—"}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-slate-600">
                              <Phone size={14} className="shrink-0 text-slate-400" />
                              <span>{student?.phone || "—"}</span>
                            </div>
                          </div>
                        </td>

                        <td className="px-5 py-4 font-medium text-slate-700">
                          {student?.id ?? "—"}
                        </td>

                        <td className="px-5 py-4">
                          <StatusBadge status={student?.status} />
                        </td>

                        <td className="px-5 py-4">
                          {student?.emailVerified ? (
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                              <ShieldCheck size={16} />
                              Verified
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700">
                              <ShieldAlert size={16} />
                              Not verified
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!loading && !error && filteredStudents.length > 0 && (
              <div className="border-t border-slate-100 px-5 py-3 text-xs text-slate-500">
                Showing {filteredStudents.length.toLocaleString("en-IN")} of{" "}
                {students.length.toLocaleString("en-IN")} students
              </div>
            )}
          </section>
        </>
      )}

      {/* Student payments view */}
      {view === "payments" && (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Payments heading and filters */}
          <div className="border-b border-slate-100 p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="flex items-center gap-2 text-lg font-bold text-slate-900">
                  <CreditCard size={20} className="text-teal-700" />
                  Student Payments
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Track course fees, paid amounts, pending balances, and payment
                  statuses.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative w-full sm:min-w-[230px]">
                  <Search
                    size={17}
                    className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="search"
                    value={paymentSearch}
                    onChange={handlePaymentSearchChange}
                    placeholder="Search name, email, phone..."
                    aria-label="Search payment records"
                    className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10"
                  />
                </div>

                <select
                  value={paymentType}
                  onChange={handlePaymentTypeChange}
                  aria-label="Filter payments by status"
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/10 sm:w-44"
                >
                  {PAYMENT_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {paymentError ? (
            <div className="p-4">
              <ErrorMessage
                message={paymentError}
                onRetry={loadPaymentStudents}
              />
            </div>
          ) : paymentLoading ? (
            <div className="flex items-center justify-center gap-3 py-16 text-sm text-slate-500">
              <RefreshCw size={18} className="animate-spin" />
              Loading payment records...
            </div>
          ) : paymentStudents.length === 0 ? (
            <EmptyState
              title="No payment records found"
              description={
                paymentSearch.trim() || paymentType !== "All"
                  ? "Try changing your search or selecting a different payment status."
                  : "No student payment records are available."
              }
            />
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1050px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-4 font-semibold">Student</th>
                      <th className="px-5 py-4 font-semibold">Courses</th>
                      <th className="px-5 py-4 text-right font-semibold">
                        Total Fees
                      </th>
                      <th className="px-5 py-4 text-right font-semibold">
                        Paid
                      </th>
                      <th className="px-5 py-4 text-right font-semibold">
                        Pending
                      </th>
                      <th className="px-5 py-4 font-semibold">Fee Status</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {paymentStudents.map((student, index) => (
                      <tr
                        key={student?.id ?? `${student?.email ?? "payment"}-${index}`}
                        className="align-top transition hover:bg-slate-50/70"
                      >
                        {/* Student details */}
                        <td className="px-5 py-5">
                          <div className="flex items-start gap-3">
                            {student?.profileImageUrl ? (
                              <img
                                src={student.profileImageUrl}
                                alt={student?.name || "Student"}
                                className="h-10 w-10 shrink-0 rounded-full object-cover"
                                loading="lazy"
                              />
                            ) : (
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-50 font-bold text-teal-700">
                                {String(student?.name || "S")
                                  .trim()
                                  .charAt(0)
                                  .toUpperCase()}
                              </div>
                            )}

                            <div className="min-w-0">
                              <p className="font-semibold text-slate-900">
                                {student?.name || "Unnamed student"}
                              </p>

                              <p className="mt-1 break-all text-xs text-slate-500">
                                {student?.email || "—"}
                              </p>

                              <p className="mt-1 text-xs text-slate-500">
                                ID: {student?.id ?? "—"}
                              </p>

                              {student?.phone && (
                                <p className="mt-1 text-xs text-slate-500">
                                  {student.phone}
                                </p>
                              )}

                              {student?.status && (
                                <div className="mt-2">
                                  <StatusBadge status={student.status} />
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Course details */}
                        <td className="max-w-sm px-5 py-5">
                          {Array.isArray(student?.courses) &&
                          student.courses.length > 0 ? (
                            <div className="space-y-4">
                              {student.courses.map((course, courseIndex) => (
                                <div
                                  key={
                                    course?.courseId ??
                                    `${course?.courseTitle ?? "course"}-${courseIndex}`
                                  }
                                  className="rounded-xl border border-slate-100 bg-slate-50/70 p-3"
                                >
                                  <div className="flex items-start gap-2">
                                    <BookOpen
                                      size={16}
                                      className="mt-0.5 shrink-0 text-teal-700"
                                    />

                                    <div className="min-w-0">
                                      <p className="font-semibold text-slate-800">
                                        {course?.courseTitle || "Untitled course"}
                                      </p>

                                      <p className="mt-1 text-xs text-slate-500">
                                        Course ID: {course?.courseId ?? "—"}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="mt-3 grid grid-cols-3 gap-3 text-xs">
                                    <div>
                                      <p className="text-slate-500">Fee</p>
                                      <p className="mt-1 font-semibold text-slate-800">
                                        {formatAmount(course?.courseFee)}
                                      </p>
                                    </div>

                                    <div>
                                      <p className="text-slate-500">Paid</p>
                                      <p className="mt-1 font-semibold text-emerald-700">
                                        {formatAmount(course?.paidAmount)}
                                      </p>
                                    </div>

                                    <div>
                                      <p className="text-slate-500">Pending</p>
                                      <p className="mt-1 font-semibold text-amber-700">
                                        {formatAmount(course?.pendingAmount)}
                                      </p>
                                    </div>
                                  </div>

                                  <div className="mt-3 flex flex-wrap items-center gap-2">
                                    {course?.enrollmentStatus && (
                                      <span className="text-xs text-slate-500">
                                        Enrollment: {course.enrollmentStatus}
                                      </span>
                                    )}

                                    {course?.feeStatus && (
                                      <StatusBadge status={course.feeStatus} />
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <span className="text-slate-400">No courses</span>
                          )}
                        </td>

                        {/* Aggregate fee amounts */}
                        <td className="whitespace-nowrap px-5 py-5 text-right font-semibold text-slate-800">
                          <span className="inline-flex items-center justify-end gap-0.5">
                            <IndianRupee size={14} />
                            {formatAmount(student?.totalFees)}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-5 py-5 text-right font-semibold text-emerald-700">
                          <span className="inline-flex items-center justify-end gap-0.5">
                            <IndianRupee size={14} />
                            {formatAmount(student?.paidAmount)}
                          </span>
                        </td>

                        <td className="whitespace-nowrap px-5 py-5 text-right font-semibold text-amber-700">
                          <span className="inline-flex items-center justify-end gap-0.5">
                            <IndianRupee size={14} />
                            {formatAmount(student?.pendingAmount)}
                          </span>
                        </td>

                        <td className="px-5 py-5">
                          <StatusBadge status={student?.feeStatus} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">
                  {paymentTotalElements === 0
                    ? "No records"
                    : `Showing ${paymentPage * paymentSize + 1}–${Math.min(
                        (paymentPage + 1) * paymentSize,
                        paymentTotalElements
                      )} of ${paymentTotalElements.toLocaleString("en-IN")} records`}
                </p>

                <div className="flex items-center justify-between gap-3 sm:justify-end">
                  <span className="text-xs text-slate-500">
                    Page {paymentTotalPages === 0 ? 0 : paymentPage + 1} of{" "}
                    {paymentTotalPages}
                  </span>

                  <button
                    type="button"
                    onClick={() =>
                      setPaymentPage((current) => Math.max(0, current - 1))
                    }
                    disabled={paymentPage <= 0 || paymentLoading}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft size={16} />
                    Previous
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setPaymentPage((current) =>
                        Math.min(paymentTotalPages - 1, current + 1)
                      )
                    }
                    disabled={
                      paymentPage >= paymentTotalPages - 1 ||
                      paymentTotalPages === 0 ||
                      paymentLoading
                    }
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      )}
    </main>
  );
};

export default Students;
