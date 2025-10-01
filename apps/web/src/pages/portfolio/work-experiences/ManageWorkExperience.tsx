import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  fetchWorkExperiences,
  deleteWorkExperience,
  fetchUserById,
  type WorkExperienceDto,
} from "../../../services/workExperienceService";
import { Button, useAuth, Eye, Remove, Edit } from "@asafarim/shared-ui-react";
import "./work-exp-styles.css";
import { WorkExperienceActionsBar } from "./components";

interface UserInfo {
  id: string;
  email: string;
  userName: string;
  roles: string[];
}

const ManageWorkExperience: React.FC = () => {
  const navigate = useNavigate();
  const [workExperiences, setWorkExperiences] = useState<WorkExperienceDto[]>(
    []
  );
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [userCache, setUserCache] = useState<Record<string, UserInfo>>({});

  // Check if user is admin based on roles in the user object
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const isAdmin =
    user?.roles?.map((role: string) => role.toLowerCase()).includes("admin") ||
    false;

  // Only redirect if not authenticated after loading is complete
  useEffect(() => {
    // Only check authentication after the loading state is complete
    if (!authLoading && !isAuthenticated) {
      console.log(
        "Authentication check complete, not authenticated. Redirecting to login."
      );
      window.location.href = `http://identity.asafarim.local:5177/login?returnUrl=${encodeURIComponent(
        window.location.href
      )}`;
    }
  }, [authLoading, isAuthenticated]);

  // Load work experiences based on user role
  useEffect(() => {
    const loadWorkExperiences = async () => {
      try {
        setLoading(true);
        console.log("Fetching work experiences, isAdmin:", isAdmin);
        // For non-admin users, always fetch only their own work experiences
        // For admin users, fetch all work experiences if isAdmin is true, otherwise fetch only their own
        const data = await fetchWorkExperiences(undefined, undefined, !isAdmin);
        console.log("Work experiences fetched:", data.length);
        setWorkExperiences(data);
        setError(null);

        // Fetch user details for each unique userId
        const userIds = new Set(
          data.filter((exp) => exp.userId).map((exp) => exp.userId as string)
        );
        for (const userId of userIds) {
          if (!userCache[userId]) {
            try {
              const userData = await fetchUserById(userId);
              if (userData) {
                setUserCache((prev) => ({
                  ...prev,
                  [userId]: userData as UserInfo,
                }));
              }
            } catch (err) {
              console.error(`Failed to fetch user ${userId}:`, err);
            }
          }
        }
      } catch (err) {
        setError("Failed to load work experiences");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      loadWorkExperiences();
    }
  }, [isAuthenticated, isAdmin, userCache]);

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return "Present";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
  };

  // Handle delete work experience
  const handleDelete = async (id: number, experienceUserId?: string) => {
    // Check if user has permission to delete (admin or owner)
    const canDelete = isAdmin || user?.id === experienceUserId;

    if (!canDelete) {
      setError("You do not have permission to delete this work experience");
      return;
    }

    if (
      window.confirm("Are you sure you want to delete this work experience?")
    ) {
      setIsDeleting(true);
      try {
        const success = await deleteWorkExperience(
          id,
          isAdmin && experienceUserId !== user?.id
        );
        if (success) {
          // Remove from state
          setWorkExperiences(workExperiences.filter((exp) => exp.id !== id));
        } else {
          setError("Failed to delete work experience");
        }
      } catch (err) {
        setError("An error occurred while deleting the work experience");
        console.error(err);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  // Handle edit work experience
  const handleEdit = (id: number, experienceUserId?: string) => {
    // Check if user has permission to edit (admin or owner)
    const canEdit = isAdmin || user?.id === experienceUserId;

    if (!canEdit) {
      setError("You do not have permission to edit this work experience");
      return;
    }

    navigate(`/portfolio/work-experiences/edit/${id}`);
  };

  // Handle view work experience
  const handleView = (id: number, userId: string): void => {
    navigate(`/portfolio/${userId}/work-experiences/view/${id}`);
  };

  if (!isAuthenticated) {
    return (
      <div className="manage-work-experiences">Redirecting to login...</div>
    );
  }

  if (loading) {
    return (
      <div className="manage-work-experiences">
        <div className="manage-work-experiences-container">
          <h1 className="manage-work-experiences-title">
            Manage Your Work Experience
          </h1>
          <div className="loading-spinner"></div>
          <p>Loading your work experiences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="manage-work-experiences">
      <div className="manage-work-experiences-container">
        <div className="manage-header">
          <h1 className="manage-work-experiences-title">
            {isAdmin
              ? "Manage All Work Experiences"
              : "Manage Your Work Experience"}
          </h1>
        </div>
        <WorkExperienceActionsBar />

        {error && <div className="work-experiences-error">{error}</div>}

        {workExperiences.length === 0 ? (
          <div className="empty-state">
            <p className="empty-state-message">No work experiences found.</p>
            <Button
              onClick={() => navigate("/portfolio/work-experiences/new")}
            >
              Add Your First Work Experience
            </Button>
          </div>
        ) : (
          <div className="work-experiences-table-wrapper">
            <table className="work-experiences-table">
              <thead>
                <tr>
                  <th className="table-header">Company</th>
                  <th className="table-header">Title</th>
                  <th className="table-header">Location</th>
                  <th className="table-header">Period</th>
                  <th className="table-header">Status</th>
                  {isAdmin && <th className="table-header">User</th>}
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {workExperiences.map((exp) => (
                  <tr key={exp.id}>
                    <td className="table-cell">
                      <div className="table-cell-content">
                        <div className="table-title-wrapper">
                          <Eye
                            onClick={() =>
                              handleView(exp.id, exp.userId as string)
                            }
                            className="table-icon"
                          />
                          <div className="table-title">{exp.companyName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell">
                      <div className="table-text">{exp.jobTitle}</div>
                    </td>
                    <td className="table-cell">
                      <div className="table-text">{exp.location || "-"}</div>
                    </td>
                    <td className="table-cell">
                      <div className="date-display">
                        {formatDate(exp.startDate)} - {formatDate(exp.endDate)}
                      </div>
                    </td>
                    <td className="table-cell">
                      {exp.isCurrent && (
                        <span className="current-indicator">Current</span>
                      )}
                    </td>
                    {isAdmin && (
                      <td className="table-cell">
                        <div className="table-text">
                          {exp.userId && userCache[exp.userId]
                            ? userCache[exp.userId].userName ||
                              userCache[exp.userId].email
                            : "Unknown user"}
                        </div>
                      </td>
                    )}
                    <td className="table-cell">
                      <div className="table-actions">
                        <button
                          onClick={() =>
                            handleView(exp.id, exp.userId as string)
                          }
                          className="action-button view"
                          disabled={isDeleting}
                          aria-label="View work experience"
                        >
                          <Eye width={16} height={16} /> View
                        </button>
                        <button
                          onClick={() => handleEdit(exp.id, exp.userId)}
                          className="action-button edit"
                          disabled={
                            isDeleting || (!isAdmin && user?.id !== exp.userId)
                          }
                          aria-label="Edit work experience"
                        >
                          <Edit width={16} height={16} /> Edit
                        </button>
                        <button
                          onClick={() => handleDelete(exp.id, exp.userId)}
                          disabled={
                            isDeleting || (!isAdmin && user?.id !== exp.userId)
                          }
                          aria-label="Delete work experience"
                          title="Delete work experience"
                          className="action-button delete"
                        >
                          <Remove />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="back-button-wrapper">
          <Button onClick={() => navigate("/portfolio")} variant="link">
            Back to Portfolio
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ManageWorkExperience;
