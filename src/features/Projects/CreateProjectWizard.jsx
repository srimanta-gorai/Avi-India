// components/CreateProjectWizard.jsx
import React, { useState, useEffect } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Building2,
  MapPin,
  Calendar,
  DollarSign,
  Users,
  Settings,
  FileText,
  Eye,
  EyeOff,
  Mail,
  UserPlus,
  X,
  Upload,
  AlertCircle,
  CheckCircle,
  Clock,
  Shield,
  Briefcase,
  Home,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";

// Import API functions and enums
import { getRoles, getModules, createProject } from "../../app/api/project";

import { getTeamMembers, uploadFile } from "../../app/api/teamGlobal";
import {
  ProjectTypeEnum,
  PropertyTypeEnum,
  VoApprovalWorkflowEnum,
  RoleTypeIdEnum,
  PermissionAcionTypeEnum,
  ProjectCollaboratorStatusEnum,
  NotifyTypeEnum,
} from "../../app/enums/projectEnums";

// Step Components
const Step1ProjectBasics = ({ data, updateData, errors }) => {
  const generateProjectCode = () => {
    const prefix = "TTX";
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, "0");
    return `${prefix}-${year}-${random}`;
  };

  useEffect(() => {
    if (!data.projectCode) {
      updateData({ projectCode: generateProjectCode() });
    }
  }, []);

  const handleDateChange = (field, value) => {
    updateData({ [field]: value });
  };

  const isCompletionValid = () => {
    if (!data.targetStartDate || !data.targetCompletionDate) return true;
    return new Date(data.targetCompletionDate) > new Date(data.targetStartDate);
  };

  const projectTypeOptions = [
    { value: ProjectTypeEnum.REPAIR, label: "Repair" },
    { value: ProjectTypeEnum.RENOVATION, label: "Renovation" },
    { value: ProjectTypeEnum.AA, label: "A&A" },
    { value: ProjectTypeEnum.FULL_REBUILD, label: "Full Rebuild" },
    { value: ProjectTypeEnum.INTERIOR_FIT_OUT, label: "Interior Fit-out" },
  ];

  const propertyTypeOptions = [
    { value: PropertyTypeEnum.HDB, label: "HDB" },
    { value: PropertyTypeEnum.CONDO, label: "Condo" },
    { value: PropertyTypeEnum.LANDED, label: "Landed" },
    { value: PropertyTypeEnum.COMMERCIAL, label: "Commercial" },
  ];

  return (
    <div className="space-y-8">
      {/* Section A: Project Identity */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-teal-600" />
          Project Identity
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2 lg:col-span-1 space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Project Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={data.projectName || ""}
              onChange={(e) => updateData({ projectName: e.target.value })}
              placeholder="15 Treasure Island A&A (Sentosa)"
              className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all ${errors.projectName ? "border-red-300 bg-red-50" : "border-slate-200"}`}
            />
            {errors.projectName && (
              <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3" /> {errors.projectName}
              </p>
            )}
          </div>
          <div className="col-span-2 lg:col-span-1 space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Project Code
            </label>
            <input
              type="text"
              value={data.projectCode || ""}
              readOnly
              className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-sm font-mono text-slate-600"
            />
            <p className="text-xs text-slate-400">Auto-generated</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Project Type <span className="text-red-500">*</span>
            </label>
            <select
              value={data.projectType || ""}
              onChange={(e) =>
                updateData({ projectType: parseInt(e.target.value) })
              }
              className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 ${errors.projectType ? "border-red-300 bg-red-50" : "border-slate-200"}`}
            >
              <option value="">Select type...</option>
              {projectTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.projectType && (
              <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3" /> {errors.projectType}
              </p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Property Type <span className="text-red-500">*</span>
            </label>
            <select
              value={data.propertyType || ""}
              onChange={(e) =>
                updateData({ propertyType: parseInt(e.target.value) })
              }
              className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 ${errors.propertyType ? "border-red-300 bg-red-50" : "border-slate-200"}`}
            >
              <option value="">Select property...</option>
              {propertyTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            {errors.propertyType && (
              <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3" /> {errors.propertyType}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Section B: Location */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <MapPin className="w-5 h-5 text-teal-600" />
          Location
        </h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Site Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={data.siteAddress || ""}
              onChange={(e) => updateData({ siteAddress: e.target.value })}
              placeholder="123 Example Street, Singapore"
              className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 ${errors.siteAddress ? "border-red-300 bg-red-50" : "border-slate-200"}`}
            />
            {errors.siteAddress && (
              <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3" /> {errors.siteAddress}
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Postal Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={data.postalCode || ""}
                placeholder="123456"
                maxLength={6}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "");
                  updateData({ postalCode: value.slice(0, 6) });
                }}
                className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 ${errors.postalCode ? "border-red-300 bg-red-50" : "border-slate-200"}`}
              />
              {errors.postalCode && (
                <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3" /> {errors.postalCode}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Region
              </label>
              <select
                value={data.region || ""}
                onChange={(e) => updateData({ region: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              >
                <option value="">Select region...</option>
                <option value="central">Central</option>
                <option value="east">East</option>
                <option value="north">North</option>
                <option value="northeast">Northeast</option>
                <option value="west">West</option>
                <option value="sentosa">Sentosa</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Section C: Timeline */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-teal-600" />
          Timeline
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Target Start Date
            </label>
            <input
              type="date"
              value={data.targetStartDate || ""}
              onChange={(e) =>
                handleDateChange("targetStartDate", e.target.value)
              }
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Target Completion Date
            </label>
            <input
              type="date"
              value={data.targetCompletionDate || ""}
              onChange={(e) =>
                handleDateChange("targetCompletionDate", e.target.value)
              }
              className={`w-full px-4 py-3 bg-slate-50 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 ${!isCompletionValid() && data.targetStartDate && data.targetCompletionDate ? "border-red-300 bg-red-50" : "border-slate-200"}`}
            />
            {!isCompletionValid() &&
              data.targetStartDate &&
              data.targetCompletionDate && (
                <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3" /> Completion must be after
                  start date
                </p>
              )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Defects Liability Period
          </label>
          <select
            value={data.dlp || ""}
            onChange={(e) => updateData({ dlp: e.target.value })}
            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          >
            <option value="">Select period...</option>
            <option value="6">6 months</option>
            <option value="12">12 months</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        {data.dlp === "custom" && (
          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              placeholder="Duration"
              value={data.customDlpDuration || ""}
              onChange={(e) =>
                updateData({ customDlpDuration: e.target.value })
              }
              className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            />
            <select
              value={data.customDlpUnit || "months"}
              onChange={(e) => updateData({ customDlpUnit: e.target.value })}
              className="px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            >
              <option value="days">Days</option>
              <option value="months">Months</option>
              <option value="years">Years</option>
            </select>
          </div>
        )}
      </div>

      {/* Section D: Budget */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-teal-600" />
          Budget
        </h3>
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Estimated Contract Value (SGD)
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">
                S$
              </span>
              <input
                type="number"
                value={data.estimatedValue || ""}
                onChange={(e) => updateData({ estimatedValue: e.target.value })}
                placeholder=" 0.00"
                className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20"
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-slate-700">
                Show budget figures to contractors?
              </span>
              <span className="text-xs text-slate-400">(Optional)</span>
            </div>
            <button
              onClick={() =>
                updateData({ budgetVisibility: !data.budgetVisibility })
              }
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${data.budgetVisibility ? "bg-teal-600" : "bg-slate-300"}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${data.budgetVisibility ? "translate-x-6" : "translate-x-1"}`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Step2TeamRoles = ({
  data,
  updateData,
  errors,
  rolesList,
  teamMembers,
}) => {
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("");
  const [inviteAccess, setInviteAccess] = useState(
    PermissionAcionTypeEnum.VIEW_ONLY,
  );

  const accessLevelOptions = [
    { value: PermissionAcionTypeEnum.VIEW_ONLY, label: "View-only" },
    { value: PermissionAcionTypeEnum.CONTRIBUTE, label: "Contribute" },
    { value: PermissionAcionTypeEnum.FULL_ACCESS, label: "Full Access" },
  ];

  // Check if required roles are filled
  const getRequiredRolesStatus = () => {
    const directorRole = rolesList.find((r) => r.title === "Project Director");
    const managerRole = rolesList.find((r) => r.title === "Project Manager");

    const hasDirector = (data.roles || []).some(
      (r) => r.roleId === directorRole?.id && (r.userId || r.email),
    );
    const hasManager = (data.roles || []).some(
      (r) => r.roleId === managerRole?.id && (r.userId || r.email),
    );

    return {
      hasDirector,
      hasManager,
      directorRoleId: directorRole?.id,
      managerRoleId: managerRole?.id,
    };
  };

  const { hasDirector, hasManager, directorRoleId, managerRoleId } =
    getRequiredRolesStatus();
  const requiredRolesComplete = hasDirector && hasManager;

  const addRole = () => {
    const newRole = {
      id: Date.now(),
      userId: "",
      email: "",
      roleId: "",
      roleTitle: "",
      accessLevel: PermissionAcionTypeEnum.VIEW_ONLY,
      status: ProjectCollaboratorStatusEnum.PENDING,
    };
    updateData({ roles: [...(data.roles || []), newRole] });
  };

  const updateRole = (id, field, value) => {
    const updatedRoles = data.roles.map((role) => {
      if (role.id === id) {
        const updatedRole = { ...role, [field]: value };

        if (field === "userId" && value) {
          const selectedMember = teamMembers.find((m) => m.id === value);
          if (selectedMember) {
            updatedRole.email = selectedMember.email;
          }
        }

        if (field === "roleId") {
          const selectedRole = rolesList.find((r) => r.id === value);
          updatedRole.roleTitle = selectedRole?.title || "";
          updatedRole.roleId = value;
        }

        return updatedRole;
      }
      return role;
    });

    updateData({ roles: [...updatedRoles] });
  };

  const removeRole = (id) => {
    updateData({ roles: data.roles.filter((role) => role.id !== id) });
  };

  const addInvite = () => {
    if (!inviteEmail || !inviteRole) return;

    const newInvite = {
      id: Date.now(),
      email: inviteEmail,
      roleId: inviteRole,
      roleTitle: rolesList.find((r) => r.id === inviteRole)?.title || "",
      accessLevel: inviteAccess,
      status: ProjectCollaboratorStatusEnum.PENDING,
      invitedAt: new Date().toISOString(),
    };

    updateData({ invites: [...(data.invites || []), newInvite] });
    setInviteEmail("");
    setInviteRole("");
    toast.success(`Invitation sent to ${inviteEmail}`);
  };

  return (
    <div className="space-y-8">
      {/* Required Roles Alert Banner */}
      {!requiredRolesComplete && (
        <div className="mb-4 p-4 bg-amber-50 border-l-4 border-amber-500 rounded-r-xl">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-amber-800">
                Required to continue
              </p>
              <p className="text-sm text-amber-700 mt-1">
                You must assign both <strong>Project Director</strong> or{" "}
                <strong>Project Manager</strong> before proceeding to the next
                step.
              </p>
              <div className="flex gap-4 mt-2">
                <div className="flex items-center gap-2">
                  {hasDirector ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <div className="w-4 h-4 border-2 border-amber-400 rounded-full" />
                  )}
                  <span className="text-xs text-amber-700">
                    Project Director
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {hasManager ? (
                    <CheckCircle className="w-4 h-4 text-green-600" />
                  ) : (
                    <div className="w-4 h-4 border-2 border-amber-400 rounded-full" />
                  )}
                  <span className="text-xs text-amber-700">
                    Project Manager
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Success Banner when both are assigned */}
      {requiredRolesComplete && (
        <div className="mb-4 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-xl">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-sm text-green-700">
              ✓ Great! Both required roles are assigned. You can now proceed to
              the next step.
            </p>
          </div>
        </div>
      )}

      {/* Error Messages */}
      {errors.roles && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-600 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {errors.roles}
          </p>
        </div>
      )}
      {errors.roleEmail && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
          <p className="text-sm text-red-600 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {errors.roleEmail}
          </p>
        </div>
      )}

      {/* Section A: Required Roles */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Briefcase className="w-5 h-5 text-teal-600" />
              Required Roles
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Must assign both roles marked with{" "}
              <span className="text-red-500">*</span>
            </p>
          </div>
          {requiredRolesComplete && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
              ✓ Complete
            </span>
          )}
        </div>

        <div className="space-y-3">
          {(data.roles || []).map((role) => {
            const roleInfo = rolesList.find((r) => r.id === role.roleId);
            const isRequired =
              roleInfo?.title === "Project Director" ||
              roleInfo?.title === "Project Manager";

            return (
              <div
                key={role.id}
                className={`flex items-center gap-3 p-4 rounded-xl border transition-all ${
                  isRequired && !role.userId && !role.email
                    ? "bg-amber-50 border-amber-300 ring-1 ring-amber-300"
                    : "bg-slate-50 border-slate-200"
                }`}
              >
                <div className="flex-1 grid grid-cols-4 gap-3">
                  <select
                    value={role.userId || ""}
                    onChange={(e) =>
                      updateRole(role.id, "userId", e.target.value)
                    }
                    className="px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm"
                  >
                    <option value="">Select person...</option>
                    {teamMembers.map((member) => (
                      <option key={member.id} value={member.id}>
                        {member.firstName} {member.lastName} ({member.email})
                      </option>
                    ))}
                  </select>

                  <div className="relative">
                    <select
                      value={role.roleId}
                      onChange={(e) =>
                        updateRole(role.id, "roleId", e.target.value)
                      }
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm pr-8"
                    >
                      <option value="">Select role...</option>
                      {rolesList.map((roleOption) => (
                        <option key={roleOption.id} value={roleOption.id}>
                          {roleOption.title}
                          {(roleOption.title === "Project Director" ||
                            roleOption.title === "Project Manager") &&
                            " *"}
                        </option>
                      ))}
                    </select>
                    {isRequired && !role.userId && !role.email && (
                      <span className="absolute right-2 top-1/2 -translate-y-1/2 text-red-500 text-xs font-bold">
                        *
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="email"
                      placeholder="Email"
                      value={role.email}
                      onChange={(e) =>
                        updateRole(role.id, "email", e.target.value)
                      }
                      className="flex-1 px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm"
                      readOnly={!!role.userId}
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        if (role.email && role.roleId) {
                          updateRole(
                            role.id,
                            "status",
                            ProjectCollaboratorStatusEnum.PENDING,
                          );
                          toast.success(`Invitation sent to ${role.email}`);
                        } else {
                          toast.error("Please select a role and enter email");
                        }
                      }}
                      className="px-3 py-2 bg-teal-600 text-white rounded-lg text-sm hover:bg-teal-700 whitespace-nowrap"
                    >
                      Invite
                    </button>

                    <button
                      onClick={() => removeRole(role.id)}
                      className="p-2 text-slate-400 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          <button
            onClick={addRole}
            className="flex items-center gap-2 px-4 py-2 text-teal-600 hover:bg-teal-50 rounded-xl transition-colors text-sm font-medium"
          >
            <UserPlus className="w-4 h-4" />
            Add Role
          </button>
        </div>

        {/* Quick tip for required roles */}
        {(data.roles || []).length === 0 && (
          <div className="mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-700 flex items-center gap-2">
              <AlertCircle className="w-3 h-3" />
              Tip: Click "Add Role" and select "Project Director" and "Project
              Manager" as your first two roles.
            </p>
          </div>
        )}

        {/* Permission Enforcement Rules Display */}
        <div className="mt-4 p-4 bg-slate-100 rounded-xl border border-slate-200">
          <h4 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Shield className="w-3 h-3" /> Role-based permissions enforced
          </h4>
          <ul className="text-xs text-slate-600 space-y-1">
            <li>
              • Project Director (Owner): Can approve VO, cannot edit BOQ rates
            </li>
            <li>• Project Manager (Admin): Full administrative access</li>
            <li>• Site Manager: Can raise VO/RFI, cannot approve anything</li>
            <li>
              • Contractor: Can submit tender, can propose VO, cannot approve
            </li>
            <li>
              • QS/Architect: Can review and recommend, approval depends on
              workflow
            </li>
          </ul>
        </div>
      </div>

      {/* Section B: Invite Collaborators */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Mail className="w-5 h-5 text-teal-600" />
          Invite Collaborators
        </h3>

        <div className="flex items-end gap-3">
          <div className="flex-1 space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Email
            </label>
            <input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="collaborator@example.com"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            />
          </div>
          <div className="flex-1 space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Role
            </label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            >
              <option value="">Select role...</option>
              {rolesList.map((role) => (
                <option key={role.id} value={role.id}>
                  {role.title}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={addInvite}
            className="px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors font-medium text-sm"
          >
            Send Invite
          </button>
        </div>

        {/* Pending Invites */}
        {(data.invites || []).length > 0 && (
          <div className="mt-4 space-y-2">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Pending Invites ({data.invites.length})
            </h4>
            {(data.invites || []).map((invite) => (
              <div
                key={invite.id}
                className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
              >
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <span className="text-sm font-medium">{invite.email}</span>
                  <span className="text-xs text-slate-500">
                    • {invite.roleTitle}
                  </span>
                </div>
                <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                  Pending
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const Step3ModulesSettings = ({
  data,
  updateData,
  modulesList,
  setModulesList,
}) => {
  const [loading, setLoading] = useState(false);

  // Fetch modules from API

  useEffect(() => {
    const fetchModules = async () => {
      setLoading(true);
      try {
        const response = await getModules();
        if (response.success) {
          setModulesList(response.data);

          // Initialize modules in formData if not already set
          if (!data.modules || Object.keys(data.modules).length === 0) {
            const initialModules = {};
            response.data.forEach((module) => {
              initialModules[module.id] = true; // All modules enabled by default
            });
            updateData({ modules: initialModules });
          }
        }
      } catch (error) {
        console.error("Failed to fetch modules:", error);
        toast.error("Failed to load modules");
      } finally {
        setLoading(false);
      }
    };
    fetchModules();
  }, []);

  // In Step3ModulesSettings component, add this effect to debug
  useEffect(() => {
    if (modulesList.length > 0 && data.modules) {
      console.log("Available modules:", modulesList);
      console.log("Selected modules state:", data.modules);
    }
  }, [modulesList, data.modules]);

  // Workflow options from enum
  const workflowOptions = [
    {
      value:
        VoApprovalWorkflowEnum[
          "Contractor → Architect/QS Review → Owner Approves"
        ],
      label: "Contractor → Architect/QS Review → Owner Approves",
    },
    {
      value:
        VoApprovalWorkflowEnum["Contractor → QS Certifies → Owner Approves"],
      label: "Contractor → QS Certifies → Owner Approves",
    },
    {
      value:
        VoApprovalWorkflowEnum[
          "Contractor → Architect Approves (Owner notified)"
        ],
      label: "Contractor → Architect Approves (Owner notified)",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Section A: Enable Modules */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Settings className="w-5 h-5 text-teal-600" />
          Enable Modules
        </h3>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="w-6 h-6 text-teal-600 animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {modulesList.map((module) => (
              <label
                key={module.id}
                className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 cursor-pointer hover:bg-slate-100 transition-colors"
              >
                <input
                  type="checkbox"
                  checked={data.modules?.[module.id] ?? true}
                  onChange={(e) =>
                    updateData({
                      modules: {
                        ...(data.modules || {}),
                        [module.id]: e.target.checked,
                      },
                    })
                  }
                  disabled={module.title === "Audit Trail"}
                  className="w-4 h-4 text-teal-600 rounded border-slate-300 focus:ring-teal-500"
                />
                <span className="text-sm font-medium text-slate-700">
                  {module.title}
                </span>
                {module.title === "Audit Trail" && (
                  <span className="text-xs text-slate-400 ml-2">
                    (Required)
                  </span>
                )}
                {/* Optional: Show module ID for debugging */}
                {/* <span className="text-xs text-slate-400 ml-2">
      ({module.id.substring(0, 8)})
    </span> */}
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Section B: Approval Rules */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900">Approval Rules</h3>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              VO Approval Workflow
            </label>
            <select
              value={
                data.voWorkflow ||
                VoApprovalWorkflowEnum[
                  "Contractor → Architect/QS Review → Owner Approves"
                ]
              }
              onChange={(e) =>
                updateData({ voWorkflow: parseInt(e.target.value) })
              }
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            >
              {workflowOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Amber Threshold (%)
              </label>
              <input
                type="number"
                value={data.amberThreshold || 15}
                onChange={(e) => updateData({ amberThreshold: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
              <p className="text-xs text-slate-400">Above benchmark median</p>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Red Threshold (%)
              </label>
              <input
                type="number"
                value={data.redThreshold || 30}
                onChange={(e) => updateData({ redThreshold: e.target.value })}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
              />
              <p className="text-xs text-slate-400">Above benchmark median</p>
            </div>
          </div>
        </div>
      </div>

      {/* Section C: Notifications & SLA */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Clock className="w-5 h-5 text-teal-600" />
          Notifications & SLA
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Remind after (days)
            </label>
            <input
              type="number"
              value={data.remindAfter || 3}
              onChange={(e) => updateData({ remindAfter: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Escalate after (days)
            </label>
            <input
              type="number"
              value={data.escalateAfter || 7}
              onChange={(e) => updateData({ escalateAfter: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
            Notification Channels
          </label>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={
                  data.notifyType === NotifyTypeEnum.EMAIL ||
                  data.notifyType === NotifyTypeEnum.BOTH
                }
                onChange={(e) => {
                  const newNotifyType = e.target.checked
                    ? data.notifyType === NotifyTypeEnum.WHATSAPP
                      ? NotifyTypeEnum.BOTH
                      : NotifyTypeEnum.EMAIL
                    : data.notifyType === NotifyTypeEnum.BOTH
                      ? NotifyTypeEnum.WHATSAPP
                      : NotifyTypeEnum.EMAIL;
                  updateData({ notifyType: newNotifyType });
                }}
                className="w-4 h-4 text-teal-600 rounded"
              />
              <span className="text-sm">Email</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={
                  data.notifyType === NotifyTypeEnum.WHATSAPP ||
                  data.notifyType === NotifyTypeEnum.BOTH
                }
                onChange={(e) => {
                  const newNotifyType = e.target.checked
                    ? data.notifyType === NotifyTypeEnum.EMAIL
                      ? NotifyTypeEnum.BOTH
                      : NotifyTypeEnum.WHATSAPP
                    : data.notifyType === NotifyTypeEnum.BOTH
                      ? NotifyTypeEnum.EMAIL
                      : NotifyTypeEnum.WHATSAPP;
                  updateData({ notifyType: newNotifyType });
                }}
                className="w-4 h-4 text-teal-600 rounded"
              />
              <span className="text-sm">WhatsApp</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

const Step4Documents = ({ data, updateData }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});

  const handleFileUpload = async (type, files) => {
    const fileArray = Array.from(files);
    const uploadedFiles = [];
    setUploading(true);

    for (const file of fileArray) {
      setUploadProgress((prev) => ({ ...prev, [file.name]: "uploading" }));

      // Determine folder name based on document type
      const folderName = type === "tenderFiles" ? "tender" : "project";

      // Call the imported upload API function
      const result = await uploadFile(file, folderName);

      if (result.success && result.data?.mediaId) {
        uploadedFiles.push({
          id: Date.now() + Math.random(),
          name: file.name,
          size: file.size,
          type: file.type,
          mediaId: result.data.mediaId, // Store the mediaId from response
          uploadedAt: new Date().toISOString(),
        });
        setUploadProgress((prev) => ({ ...prev, [file.name]: "success" }));
        toast.success(`${file.name} uploaded successfully`);
      } else {
        setUploadProgress((prev) => ({ ...prev, [file.name]: "error" }));
        toast.error(
          `Failed to upload ${file.name}: ${result.message || "Unknown error"}`,
        );
      }
    }

    if (uploadedFiles.length > 0) {
      updateData({
        [type]: [...(data[type] || []), ...uploadedFiles],
      });
    }

    // Clear progress after a delay
    setTimeout(() => {
      setUploadProgress((prev) => {
        const newProgress = { ...prev };
        uploadedFiles.forEach((file) => delete newProgress[file.name]);
        return newProgress;
      });
    }, 3000);

    setUploading(false);
  };

  const removeFile = (type, fileId) => {
    updateData({
      [type]: (data[type] || []).filter((f) => f.id !== fileId),
    });
  };

  return (
    <div className="space-y-8">
      {/* Section A: Tender Templates */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <FileText className="w-5 h-5 text-teal-600" />
          Tender Templates
        </h3>

        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              BOQ Template
            </label>
            <select
              value={data.boqTemplate || ""}
              onChange={(e) => updateData({ boqTemplate: e.target.value })}
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
            >
              <option value="">Select template...</option>
              <option value="landed-aa">Landed A&A template</option>
              <option value="condo-renovation">
                Condo renovation template
              </option>
              <option value="small-repair">Small repair template</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Tender Pack Upload
            </label>
            <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-teal-500 transition-colors">
              <input
                type="file"
                multiple
                accept=".pdf,.dwg,.jpg,.png"
                onChange={(e) =>
                  handleFileUpload("tenderFiles", e.target.files)
                }
                className="hidden"
                id="tender-upload"
                disabled={uploading}
              />
              <label htmlFor="tender-upload" className="cursor-pointer">
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-700">
                  {uploading
                    ? "Uploading..."
                    : "Click to upload or drag and drop"}
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  PDF, DWG, JPG, PNG (max 50MB)
                </p>
              </label>
            </div>

            {/* File List with Upload Status */}
            {(data.tenderFiles || []).length > 0 && (
              <div className="mt-4 space-y-2">
                {data.tenderFiles.map((file) => (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-4 h-4 text-slate-400" />
                      <span className="text-sm font-medium">{file.name}</span>
                      <span className="text-xs text-slate-400">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                      {file.mediaId && (
                        <span className="text-xs text-green-600 flex items-center gap-1">
                          <CheckCircle className="w-3 h-3" />
                          Uploaded
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => removeFile("tenderFiles", file.id)}
                      className="p-1 text-slate-400 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Progress Indicators */}
            {Object.entries(uploadProgress).map(
              ([fileName, status]) =>
                status === "uploading" && (
                  <div
                    key={fileName}
                    className="mt-2 p-2 bg-blue-50 rounded-lg text-sm text-blue-600 flex items-center gap-2"
                  >
                    <RefreshCw className="w-3 h-3 animate-spin" />
                    Uploading {fileName}...
                  </div>
                ),
            )}
          </div>
        </div>
      </div>

      {/* Section B: Project Documents */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-900">
          Project Documents (Optional)
        </h3>

        <div className="space-y-2">
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:border-teal-500 transition-colors">
            <input
              type="file"
              multiple
              onChange={(e) => handleFileUpload("projectFiles", e.target.files)}
              className="hidden"
              id="project-upload"
              disabled={uploading}
            />
            <label htmlFor="project-upload" className="cursor-pointer">
              <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
              <p className="text-sm font-medium text-slate-700">
                Upload Contract, Schedule, etc.
              </p>
            </label>
          </div>

          {(data.projectFiles || []).length > 0 && (
            <div className="mt-4 space-y-2">
              {data.projectFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200"
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium">{file.name}</span>
                    {file.mediaId && (
                      <span className="text-xs text-green-600 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" />
                        Uploaded
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => removeFile("projectFiles", file.id)}
                    className="p-1 text-slate-400 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const Step5Review = ({ data, rolesList, teamMembers }) => {
  // Helper function to get enum labels
  const getProjectTypeLabel = (value) => {
    const types = {
      [ProjectTypeEnum.REPAIR]: "Repair",
      [ProjectTypeEnum.RENOVATION]: "Renovation",
      [ProjectTypeEnum.AA]: "A&A",
      [ProjectTypeEnum.FULL_REBUILD]: "Full Rebuild",
      [ProjectTypeEnum.INTERIOR_FIT_OUT]: "Interior Fit-out",
    };
    return types[value] || "—";
  };

  const getPropertyTypeLabel = (value) => {
    const types = {
      [PropertyTypeEnum.HDB]: "HDB",
      [PropertyTypeEnum.CONDO]: "Condo",
      [PropertyTypeEnum.LANDED]: "Landed",
      [PropertyTypeEnum.COMMERCIAL]: "Commercial",
    };
    return types[value] || "—";
  };

  const getRoleTitle = (roleId) => {
    const role = rolesList.find((r) => r.id === roleId);
    return role?.title || "—";
  };

  const getMemberName = (userId) => {
    const member = teamMembers.find((m) => m.id === userId);
    return member ? `${member.firstName} ${member.lastName}` : "—";
  };

  return (
    <div className="space-y-8">
      <h3 className="text-lg font-bold text-slate-900">Review & Create</h3>

      <div className="grid grid-cols-2 gap-6">
        {/* Project Basics Summary */}
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
          <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-teal-600" />
            Project Basics
          </h4>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-slate-500">Name:</dt>
              <dd className="font-medium">{data.projectName || "—"}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Code:</dt>
              <dd className="font-mono text-teal-600">{data.projectCode}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Type:</dt>
              <dd className="font-medium">
                {getProjectTypeLabel(data.projectType)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Property:</dt>
              <dd className="font-medium">
                {getPropertyTypeLabel(data.propertyType)}
              </dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-slate-500">Budget:</dt>
              <dd className="font-medium">${data.estimatedValue || "0"} SGD</dd>
            </div>
          </dl>
        </div>

        {/* Team Summary */}
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
          <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-teal-600" />
            Team
          </h4>
          <div className="space-y-3">
            <p className="text-sm">
              <span className="text-slate-500">Roles assigned:</span>{" "}
              <span className="font-medium">{(data.roles || []).length}</span>
            </p>
            <div className="max-h-32 overflow-y-auto">
              {(data.roles || []).map((role, index) => (
                <div
                  key={index}
                  className="text-xs py-1 border-b border-slate-200 last:border-0"
                >
                  <span className="text-teal-600 font-medium">
                    {getRoleTitle(role.roleId)}
                  </span>
                  <span className="text-slate-600">
                    : {role.userId ? getMemberName(role.userId) : role.email}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-sm">
              <span className="text-slate-500">Pending invites:</span>{" "}
              <span className="font-medium">{(data.invites || []).length}</span>
            </p>
          </div>
        </div>

        {/* Modules Summary */}
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
          <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Settings className="w-4 h-4 text-teal-600" />
            Modules & Settings
          </h4>
          <div className="space-y-2">
            <p className="text-sm">
              <span className="text-slate-500">Enabled modules:</span>{" "}
              <span className="font-medium">
                {Object.values(data.modules || {}).filter(Boolean).length}/7
              </span>
            </p>
            <p className="text-sm">
              <span className="text-slate-500">Workflow:</span>{" "}
              <span className="font-medium">
                {data.voWorkflow ===
                VoApprovalWorkflowEnum[
                  "Contractor → Architect/QS Review → Owner Approves"
                ]
                  ? "Architect/QS Review"
                  : data.voWorkflow ===
                      VoApprovalWorkflowEnum[
                        "Contractor → QS Certifies → Owner Approves"
                      ]
                    ? "QS Certifies"
                    : data.voWorkflow ===
                        VoApprovalWorkflowEnum[
                          "Contractor → Architect Approves (Owner notified)"
                        ]
                      ? "Architect Approves"
                      : "—"}
              </span>
            </p>
            <p className="text-sm">
              <span className="text-slate-500">Thresholds:</span>{" "}
              <span className="font-medium">
                Amber {data.amberThreshold || 15}% / Red{" "}
                {data.redThreshold || 30}%
              </span>
            </p>
          </div>
        </div>

        {/* Documents Summary */}
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
          <h4 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-teal-600" />
            Documents
          </h4>
          <div className="space-y-2">
            <p className="text-sm">
              <span className="text-slate-500">Tender files:</span>{" "}
              <span className="font-medium">
                {(data.tenderFiles || []).length}
              </span>
            </p>
            <p className="text-sm">
              <span className="text-slate-500">Project files:</span>{" "}
              <span className="font-medium">
                {(data.projectFiles || []).length}
              </span>
            </p>
            {data.boqTemplate && (
              <p className="text-sm">
                <span className="text-slate-500">BOQ Template:</span>{" "}
                <span className="font-medium">{data.boqTemplate}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Permission Summary */}
      <div className="bg-amber-50 p-6 rounded-xl border border-amber-200">
        <h4 className="text-sm font-bold text-amber-800 mb-2">
          Role-Based Access Control
        </h4>
        <p className="text-sm text-amber-700">
          The following permissions will be enforced throughout the project
          lifecycle: Project Director approval required for VOs, Project Manager
          has full admin access, Site Managers can raise RFI but not approve,
          Contractors can submit tenders and propose VOs.
        </p>
      </div>
    </div>
  );
};

// Main Wizard Component
const CreateProjectWizard = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    modules: {},
    roles: [],
    invites: [],
    tenderFiles: [],
    projectFiles: [],
    notifyType: NotifyTypeEnum.EMAIL,
    budgetVisibility: false,
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rolesList, setRolesList] = useState([]);
  const [teamMembers, setTeamMembers] = useState([]);
  const [modulesList, setModulesList] = useState([]);

  useEffect(() => {
    if (isOpen) {
      // Save current overflow style
      const originalStyle = document.body.style.overflow;
      // Prevent scrolling on body
      document.body.style.overflow = "hidden";
      // Cleanup function to restore scroll when drawer closes
      return () => {
        document.body.style.overflow = originalStyle;
      };
    }
  }, [isOpen]);

  // Fetch roles and team members when component mounts
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rolesRes, teamRes] = await Promise.all([
          getRoles(),
          getTeamMembers(),
        ]);

        if (rolesRes.success) {
          setRolesList(rolesRes.data);
        }

        if (teamRes.success) {
          setTeamMembers(teamRes.data.memberList);
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
        toast.error("Failed to load roles and team members");
      }
    };

    if (isOpen) {
      fetchData();
    }
  }, [isOpen]);

  const steps = [
    { number: 1, name: "Basics", icon: Building2 },
    { number: 2, name: "Team & Roles", icon: Users },
    { number: 3, name: "Modules", icon: Settings },
    { number: 4, name: "Documents", icon: FileText },
    { number: 5, name: "Review", icon: CheckCircle },
  ];

  const validateStep1 = () => {
    const newErrors = {};

    // Project Name validation - required and min 3 characters
    if (!formData.projectName || formData.projectName.trim().length === 0) {
      newErrors.projectName = "Project name is required";
    } else if (formData.projectName.trim().length < 3) {
      newErrors.projectName = "Project name must be at least 3 characters";
    }

    // Project Type validation
    if (!formData.projectType) {
      newErrors.projectType = "Project type is required";
    }

    // Property Type validation
    if (!formData.propertyType) {
      newErrors.propertyType = "Property type is required";
    }

    // Site Address validation - required and min 3 characters
    if (!formData.siteAddress || formData.siteAddress.trim().length === 0) {
      newErrors.siteAddress = "Site address is required";
    } else if (formData.siteAddress.trim().length < 3) {
      newErrors.siteAddress = "Site address must be at least 3 characters";
    }

    // Postal Code validation - required and must be 6 digits
    if (!formData.postalCode || formData.postalCode.trim().length === 0) {
      newErrors.postalCode = "Postal code is required";
    } else if (!/^\d{6}$/.test(formData.postalCode.trim())) {
      newErrors.postalCode = "Postal code must be exactly 6 digits";
    }

    return newErrors;
  };

  const validateStep2 = () => {
    const newErrors = {};

    // Find director and manager role IDs
    const directorRole = rolesList.find((r) => r.title === "Project Director");
    const managerRole = rolesList.find((r) => r.title === "Project Manager");

    const hasDirector = (formData.roles || []).some(
      (r) => r.roleId === directorRole?.id,
    );

    const hasManager = (formData.roles || []).some(
      (r) => r.roleId === managerRole?.id,
    );

    if (!hasDirector && !hasManager) {
      newErrors.roles =
        "Must assign at least one Project Director (Owner) or Project Manager (Admin)";
    }

    // Check if assigned users have emails
    const rolesWithoutEmail = (formData.roles || []).filter(
      (r) => (!r.userId && !r.email) || (r.userId && !r.email),
    );

    if (rolesWithoutEmail.length > 0) {
      newErrors.roleEmail = "All assigned roles must have an email address";
    }

    return newErrors;
  };

  const handleNext = () => {
    let stepErrors = {};

    if (currentStep === 1) stepErrors = validateStep1();
    if (currentStep === 2) stepErrors = validateStep2();

    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      // Scroll to the first error
      const firstError = document.querySelector(".border-red-300");
      if (firstError) {
        firstError.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setErrors({});
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleCreate = async () => {
    setIsSubmitting(true);
    try {
      // Find director and manager roles
      const directorRole = rolesList?.find(
        (r) => r.title === "Project Director",
      );
      const managerRole = rolesList?.find((r) => r.title === "Project Manager");

      // Prepare project collaborators - INCLUDING roleId
      const projectCollaborators = [];

      // Add assigned roles (those with userId and roleId)
      (formData.roles || [])
        .filter((role) => role.userId && role.roleId) // Need both userId and roleId
        .forEach((role) => {
          const member = teamMembers.find((m) => m.id === role.userId);
          if (member) {
            projectCollaborators.push({
              userId: role.userId,
              name: `${member.firstName} ${member.lastName}`,
              email: member.email,
              roleId: role.roleId, // Add roleId to collaborator
            });
          } else {
            // Fallback for when member data is missing
            projectCollaborators.push({
              userId: role.userId || "f9309514-f791-47a1-b614-31be61445f78",
              name: "Tonmoy Bagri",
              email: role.email || "bagritonmoy1999@gmail.com",
              roleId: role.roleId, // Include roleId even in fallback
            });
          }
        });

      // Add pending invites as collaborators
      (formData.invites || []).forEach((invite, index) => {
        projectCollaborators.push({
          userId:
            index === 0
              ? "f9309514-f791-47a1-b614-31be61445f78"
              : index === 1
                ? "d27057e4-dd51-4693-bd3b-a71b4b2db5aa"
                : "a330c047-2911-47a7-a15f-dca0c65fd0c1",
          name:
            index === 0
              ? "Tonmoy Bagri"
              : index === 1
                ? "TONMOY BAGRI"
                : "TONMOY BAGRI",
          email: invite.email,
          roleId: invite.roleId, // Include roleId from invite
        });
      });

      // Prepare module settings - FIXED: Use actual module IDs from formData.modules
      const projectModuleSettings = Object.entries(formData.modules || {})
        .filter(([moduleId, isEnabled]) => isEnabled) // Only include enabled modules
        .map(([moduleId, isEnabled]) => ({
          moduleId: moduleId, // Use the actual module ID from the API
          isEnabled: 1,
        }));

      // If no modules are enabled, enable at least the Audit Trail module
      if (projectModuleSettings.length === 0 && modulesList.length > 0) {
        const auditTrailModule = modulesList.find(
          (m) => m.title === "Audit Trail",
        );
        if (auditTrailModule) {
          projectModuleSettings.push({
            moduleId: auditTrailModule.id,
            isEnabled: 1,
          });
        } else if (modulesList[0]) {
          projectModuleSettings.push({
            moduleId: modulesList[0].id,
            isEnabled: 1,
          });
        }
      }

      // Map BOQ template to enum values using TenderBoqTemplateTypeEnum
      const getBoqTemplateType = (template) => {
        switch (template) {
          case "landed-aa":
            return 100; // 'Landed A&A template'
          case "condo-renovation":
            return 101; // 'Condo renovation template'
          case "small-repair":
            return 102; // 'Small repair template'
          default:
            return null;
        }
      };

      // Prepare documents - FIXED: Filter out documents without mediaId
      const projectDocuments = [
        ...(formData.tenderFiles || [])
          .filter((file) => file.mediaId) // Only include files with mediaId
          .map((file) => ({
            mediaId: file.mediaId,
            folderType: "tender",
            boqTemplateType: getBoqTemplateType(formData.boqTemplate),
          })),
        ...(formData.projectFiles || [])
          .filter((file) => file.mediaId) // Only include files with mediaId
          .map((file) => ({
            mediaId: file.mediaId,
            folderType: "project",
            boqTemplateType: null,
          })),
      ];

      // If no documents, you might want to add a placeholder or leave empty array
      // const finalProjectDocuments = projectDocuments.length > 0 ? projectDocuments : [];

      // Calculate DLP in months
      let defectsLiabilityPeriod = null;
      if (formData.dlp) {
        if (formData.dlp === "custom") {
          const duration = parseInt(formData.customDlpDuration) || 0;
          const unit = formData.customDlpUnit || "months";
          if (unit === "days")
            defectsLiabilityPeriod = Math.ceil(duration / 30);
          else if (unit === "years") defectsLiabilityPeriod = duration * 12;
          else defectsLiabilityPeriod = duration;
        } else {
          defectsLiabilityPeriod = parseInt(formData.dlp);
        }
      }

      // Prepare the final payload
      const payload = {
        projectName: formData.projectName,
        projectType: formData.projectType,
        propertyType: formData.propertyType,
        siteAddress: formData.siteAddress,
        postalCode: formData.postalCode || "",
        region: formData.region || "",
        startDate: formData.targetStartDate || null,
        endDate: formData.targetCompletionDate || null,
        defectsLiabilityPeriod: defectsLiabilityPeriod,
        estimatedContractValue: parseFloat(formData.estimatedValue) || 0,
        isBudgetVisibleToContractors: formData.budgetVisibility ? 1 : 0,
        projectCollaborators: projectCollaborators,
        projectModuleSettings: projectModuleSettings,
        projectSettings: {
          voApprovalWorkflow:
            formData.voWorkflow ||
            VoApprovalWorkflowEnum[
              "Contractor → Architect/QS Review → Owner Approves"
            ],
          voAmberThresholdPercentage: parseInt(formData.amberThreshold) || 15,
          voRedThresholdPercentage: parseInt(formData.redThreshold) || 30,
          approvalReminderDays: parseInt(formData.remindAfter) || 3,
          approvalEscalateDays: parseInt(formData.escalateAfter) || 7,
          notifyType: formData.notifyType || NotifyTypeEnum.EMAIL,
        },
        projectDocuments: projectDocuments,
      };

      console.log(
        "Creating project with payload:",
        JSON.stringify(payload, null, 2),
      );

      // Call the API
      const response = await createProject(payload);

      if (response.success) {
        toast.success("Project created successfully!");
        onClose();
        // Reset form
        setFormData({
          modules: {},
          roles: [],
          invites: [],
          tenderFiles: [],
          projectFiles: [],
          notifyType: NotifyTypeEnum.EMAIL,
          budgetVisibility: false,
        });
        setCurrentStep(1);
      } else {
        toast.error(response.message || "Failed to create project");
      }
    } catch (error) {
      console.error("Failed to create project:", error);
      toast.error("An error occurred while creating the project");
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (newData) => {
    setFormData((prev) => ({ ...prev, ...newData }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1ProjectBasics
            data={formData}
            updateData={updateFormData}
            errors={errors}
          />
        );
      case 2:
        return (
          <Step2TeamRoles
            data={formData}
            updateData={updateFormData}
            errors={errors}
            rolesList={rolesList}
            teamMembers={teamMembers}
          />
        );
      case 3:
        return (
          <Step3ModulesSettings
            data={formData}
            updateData={updateFormData}
            modulesList={modulesList}
            setModulesList={setModulesList}
          />
        );
      case 4:
        return <Step4Documents data={formData} updateData={updateFormData} />;
      case 5:
        return (
          <Step5Review
            data={formData}
            rolesList={rolesList}
            teamMembers={teamMembers}
          />
        );
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end overflow-hidden">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-500 ease-in-out"
        style={{
          opacity: isOpen ? 1 : 0,
          transition: "opacity 300ms ease-in-out",
        }}
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div
        className={`relative w-full max-w-4xl bg-white h-full shadow-2xl flex flex-col z-50 overflow-hidden
  transform transition-transform duration-500 ease-in-out
  ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Header */}
        <div className="px-8 py-6 border-b border-slate-100">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Create New Project
              </h2>
              <p className="text-slate-400 text-sm font-medium">
                Set up your construction project with guided steps
              </p>
            </div>
            <button
              onClick={onClose}
              className="group p-2.5 bg-slate-50 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-xl transition-all duration-200"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="relative">
            <div className="flex justify-between mb-2">
              {steps.map((step) => (
                <div
                  key={step.number}
                  className={`flex flex-col items-center relative z-10 transition-colors ${
                    step.number <= currentStep
                      ? "text-teal-600"
                      : "text-slate-300"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                      step.number < currentStep
                        ? "bg-teal-600 border-teal-600 text-white"
                        : step.number === currentStep
                          ? "border-teal-600 bg-white text-teal-600"
                          : "border-slate-200 bg-white text-slate-300"
                    }`}
                  >
                    {step.number < currentStep ? (
                      <Check className="w-4 h-4" />
                    ) : (
                      <step.icon className="w-4 h-4" />
                    )}
                  </div>
                  <span className="text-xs font-medium mt-1 hidden md:block">
                    {step.name}
                  </span>
                </div>
              ))}
            </div>
            {/* Progress Line */}
            <div className="absolute top-4 left-0 right-0 h-0.5 bg-slate-200 -translate-y-1/2">
              <div
                className="h-full bg-teal-600 transition-all duration-300"
                style={{ width: `${((currentStep - 1) / 4) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Form Content */}
        <div className="flex-1 overflow-y-auto p-8">{renderStep()}</div>

        {/* Footer Navigation */}
        <div className="px-8 py-6 border-t border-slate-100 bg-white">
          <div className="flex justify-between gap-4">
            <button
              onClick={handleBack}
              disabled={currentStep === 1}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                currentStep === 1
                  ? "text-slate-300 bg-slate-50 cursor-not-allowed"
                  : "text-slate-600 bg-slate-100 hover:bg-slate-200"
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              Back
            </button>

            {currentStep === 5 ? (
              <button
                onClick={handleCreate}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 text-white rounded-xl font-bold shadow-lg shadow-teal-600/30 hover:shadow-teal-600/40 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <CheckCircle className="w-4 h-4" />
                    Create Project
                  </>
                )}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-8 py-3 bg-teal-600 text-white rounded-xl font-bold hover:bg-teal-700 shadow-lg shadow-teal-600/30 transition-all"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateProjectWizard;
