
import { useEffect, useMemo, useState } from "react";
import {
  RefreshCw,
  Users,
  Search,
  BriefcaseBusiness,
  AlertCircle,
} from "lucide-react";
import { getEmployees } from "../../app/api/managementApis";

const unwrapRecords = (data) => {
  if (Array.isArray(data)) return data;

  if (data && typeof data === "object") {
    for (const key of ["data", "content", "employees", "records", "items"]) {
      if (Array.isArray(data[key])) return data[key];
    }
  }

  return null;
};

const Employees = () => {
  const [employees, setEmployees] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [responseWarning, setResponseWarning] = useState("");

  const loadEmployees = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    setError("");
    setResponseWarning("");

    try {
      const response = await getEmployees();
      const records = unwrapRecords(response);

      setEmployees(records ?? []);

      if (records === null) {
        setResponseWarning(
          "The API response format could not be recognized. Check the response before mapping employee fields."
        );
      }
    } catch (err) {
      console.error("Failed to load employees:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load employee data. Please try again."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const filteredEmployees = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return employees;

    return employees.filter((employee) =>
      [
        employee?.id,
        employee?.name,
        employee?.email,
        employee?.phone,
        employee?.status,
      ].some((value) =>
        String(value ?? "").toLowerCase().includes(query)
      )
    );
  }, [employees, search]);

  return (
    <main className="min-w-0 w-full space-y-6 p-4 sm:p-6">
      {/* Page header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-teal-700">
            ONLINE LEARNING ADMINISTRATION
          </p>

          <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
            Employee Management
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            View and search employee records.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadEmployees(true)}
          disabled={loading || refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-700 px-4 py-3 text-sm font-bold text-white transition hover:bg-teal-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <RefreshCw
            className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
        >
          <AlertCircle className="h-5 w-5 shrink-0" />

          <div>
            <p className="font-bold">Could not load employee data</p>
            <p className="mt-1">{error}</p>

            <button
              type="button"
              onClick={() => loadEmployees(true)}
              className="mt-2 font-bold underline"
            >
              Try again
            </button>
          </div>
        </div>
      )}

      {/* Summary card */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-500">
                Total Employees
              </p>

              <p className="mt-3 text-3xl font-black text-slate-900">
                {loading ? "—" : employees.length}
              </p>
            </div>

            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
              <Users className="h-6 w-6" />
            </div>
          </div>
        </article>
      </section>

      {/* Employee records */}
      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              Employee Records
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {loading
                ? "Loading records..."
                : `${filteredEmployees.length} of ${employees.length} employees`}
            </p>
          </div>

          <div className="relative w-full sm:max-w-sm">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search employee records..."
              aria-label="Search employees"
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
            Loading employee records...
          </div>
        ) : error ? (
          <div className="p-10 text-center text-sm text-slate-500">
            Employee records could not be displayed.
          </div>
        ) : filteredEmployees.length === 0 ? (
          <div className="p-10 text-center">
            <BriefcaseBusiness className="mx-auto h-10 w-10 text-slate-300" />

            <p className="mt-3 font-semibold text-slate-700">
              No employees found
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Try another search term.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-[900px] w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500">
                <tr>
                    <th className="px-5 py-4 font-bold">Employee</th>
                    <th className="px-5 py-4 font-bold">Phone</th>
                    <th className="px-5 py-4 font-bold">Role</th>
                    <th className="px-5 py-4 font-bold">Status</th>
                    <th className="px-5 py-4 font-bold">Email Verification</th>
                </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                {filteredEmployees.map((employee, index) => (
                    <tr
                    key={employee.id ?? index}
                    className="transition hover:bg-slate-50"
                    >
                    <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                        {employee.profileImageUrl ? (
                            <img
                            src={employee.profileImageUrl}
                            alt=""
                            className="h-10 w-10 rounded-full object-cover"
                            />
            ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-teal-50 font-bold text-teal-700">
                  {(employee.name || "E").charAt(0).toUpperCase()}
                </div>
              )}

              <div>
                <p className="font-bold text-slate-800">
                  {employee.name || "Unnamed employee"}
                </p>
                <p className="text-xs text-slate-500">
                  {employee.email || "—"}
                </p>
                <p className="text-xs text-slate-400">
                  ID: {employee.id ?? "—"}
                </p>
              </div>
            </div>
          </td>

          <td className="px-5 py-4 text-slate-600">
            {employee.phone || "—"}
          </td>

          <td className="px-5 py-4">
            <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">
              {employee.role || "—"}
            </span>
          </td>

          <td className="px-5 py-4">
            <span
              className={`rounded-full px-3 py-1 text-xs font-bold ${
                employee.status === "ACTIVE"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              {employee.status || "Unknown"}
            </span>
          </td>

          <td className="px-5 py-4">
            {employee.emailVerified === true ? (
              <span className="font-semibold text-emerald-700">
                Verified
              </span>
            ) : employee.emailVerified === false ? (
              <span className="font-semibold text-amber-700">
                Not verified
              </span>
            ) : (
              "—"
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

export default Employees;
