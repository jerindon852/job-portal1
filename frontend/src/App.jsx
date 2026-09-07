import { useEffect, useState } from "react";
import "./index.css";

const API_URL = "http://localhost:5000/api";

function App() {
  const [jobs, setJobs] = useState([]);

  const [title, setTitle] = useState("");
  const [company, setCompany] = useState("");
  const [location, setLocation] = useState("");
  const [editId, setEditId] = useState(null);

  const [showApplyForm, setShowApplyForm] = useState(false);
  const [selectedJob, setSelectedJob] = useState(null);

  const [applicantName, setApplicantName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [resume, setResume] = useState(null);

  const [showAdmin, setShowAdmin] = useState(false);
  const [applications, setApplications] = useState([]);

  // =========================
  // FETCH JOBS
  // =========================

  const fetchJobs = async () => {
    try {
      const response = await fetch(`${API_URL}/jobs`);

      if (!response.ok) {
        throw new Error("Failed to fetch jobs");
      }

      const data = await response.json();
      setJobs(data);
    } catch (error) {
      console.error(error);
      alert("Unable to load jobs");
    }
  };

  // =========================
  // FETCH APPLICATIONS
  // =========================

  const fetchApplications = async () => {
    try {
      const response = await fetch(`${API_URL}/applications`);

      if (!response.ok) {
        throw new Error("Failed to fetch applications");
      }

      const data = await response.json();
      setApplications(data);
    } catch (error) {
      console.error(error);
    }
  };

  // =========================
  // INITIAL LOAD
  // =========================

  useEffect(() => {
    fetchJobs();
    fetchApplications();
  }, []);

  // =========================
  // SAVE JOB
  // =========================

  const saveJob = async (e) => {
    e.preventDefault();

    if (!title.trim() || !company.trim() || !location.trim()) {
      alert("Please fill all job fields");
      return;
    }

    try {
      let response;

      if (editId) {
        response = await fetch(`${API_URL}/jobs/${editId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            company,
            location,
          }),
        });
      } else {
        response = await fetch(`${API_URL}/jobs`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title,
            company,
            location,
          }),
        });
      }

      if (!response.ok) {
        throw new Error("Failed to save job");
      }

      setTitle("");
      setCompany("");
      setLocation("");
      setEditId(null);

      await fetchJobs();

      alert(editId ? "Job updated successfully!" : "Job posted successfully!");
    } catch (error) {
      console.error(error);
      alert("Unable to save job");
    }
  };

  // =========================
  // EDIT JOB
  // =========================

  const editJob = (job) => {
    setTitle(job.title);
    setCompany(job.company);
    setLocation(job.location);
    setEditId(job.id);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================
  // DELETE JOB
  // =========================

  const deleteJob = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this job?"
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(`${API_URL}/jobs/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete job");
      }

      await fetchJobs();
      await fetchApplications();
    } catch (error) {
      console.error(error);
      alert("Unable to delete job");
    }
  };

  // =========================
  // OPEN APPLY FORM
  // =========================

  const openApplyForm = (job) => {
    setSelectedJob(job);
    setShowApplyForm(true);

    setApplicantName("");
    setEmail("");
    setPhone("");
    setResume(null);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  // =========================
  // SUBMIT APPLICATION
  // =========================

  const submitApplication = async (e) => {
    e.preventDefault();

    if (!applicantName.trim() || !email.trim() || !phone.trim()) {
      alert("Please fill all required fields");
      return;
    }

    if (!selectedJob) {
      alert("No job selected");
      return;
    }

    try {
      const formData = new FormData();

      formData.append("job_id", selectedJob.id);
      formData.append("applicant_name", applicantName);
      formData.append("email", email);
      formData.append("phone", phone);

      if (resume) {
        formData.append("resume", resume);
      }

      const response = await fetch(`${API_URL}/applications`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Application failed");
      }

      alert("Application submitted successfully!");

      setApplicantName("");
      setEmail("");
      setPhone("");
      setResume(null);

      setShowApplyForm(false);
      setSelectedJob(null);

      await fetchApplications();
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  };

  // =========================
  // UPDATE APPLICATION STATUS
  // =========================

  const updateApplicationStatus = async (id, status) => {
    try {
      const response = await fetch(
        `${API_URL}/applications/${id}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update status");
      }

      await fetchApplications();
    } catch (error) {
      console.error(error);
      alert("Unable to update application status");
    }
  };

  // =========================
  // DELETE APPLICATION
  // =========================

  const deleteApplication = async (id) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this application?"
    );

    if (!confirmDelete) return;

    try {
      const response = await fetch(`${API_URL}/applications/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Failed to delete application");
      }

      await fetchApplications();
    } catch (error) {
      console.error(error);
      alert("Unable to delete application");
    }
  };

  // =========================
  // RESET JOB FORM
  // =========================

  const resetJobForm = () => {
    setTitle("");
    setCompany("");
    setLocation("");
    setEditId(null);
  };

  // =========================
  // BACK TO JOBS
  // =========================

  const backToJobs = () => {
    setShowApplyForm(false);
    setSelectedJob(null);
  };

  // ==========================================================
  // ADMIN DASHBOARD
  // ==========================================================

  if (showAdmin) {
    const totalJobs = jobs.length;

    const totalApplications = applications.length;

    const totalResumes = applications.filter(
      (application) => application.resume
    ).length;

    const selectedCount = applications.filter(
      (application) => application.status === "Selected"
    ).length;

    const reviewingCount = applications.filter(
      (application) => application.status === "Reviewing"
    ).length;

    const rejectedCount = applications.filter(
      (application) => application.status === "Rejected"
    ).length;

    return (
      <div className="app">
        {/* ADMIN NAVBAR */}

        <nav className="navbar">
          <div className="logo">
            <span>Job</span>Portal
          </div>

          <button
            className="nav-btn elegant-admin-btn"
            onClick={() => setShowAdmin(false)}
          >
            <span>←</span>
            Back to Jobs
          </button>
        </nav>

        {/* ADMIN HERO */}

        <section className="admin-hero">
          <div>
            <p className="eyebrow">ADMINISTRATION</p>

            <h1>
              Application
              <span> Dashboard</span>
            </h1>

            <p>
              Manage candidates, applications and hiring
              decisions from one place.
            </p>
          </div>
        </section>

        {/* ADMIN STATS */}

        <section className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">💼</div>

            <div>
              <p>Total Jobs</p>
              <h2>{totalJobs}</h2>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">👥</div>

            <div>
              <p>Applications</p>
              <h2>{totalApplications}</h2>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">📄</div>

            <div>
              <p>Resumes</p>
              <h2>{totalResumes}</h2>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">⭐</div>

            <div>
              <p>Selected</p>
              <h2>{selectedCount}</h2>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">🔎</div>

            <div>
              <p>Reviewing</p>
              <h2>{reviewingCount}</h2>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon">✕</div>

            <div>
              <p>Rejected</p>
              <h2>{rejectedCount}</h2>
            </div>
          </div>
        </section>

        {/* APPLICATION TABLE */}

        <section className="admin-section">
          <div className="section-heading">
            <div>
              <p className="eyebrow">CANDIDATES</p>

              <h2>Applications</h2>

              <p className="section-description">
                Review candidate profiles and manage application status.
              </p>
            </div>

            <button
              className="refresh-btn"
              onClick={fetchApplications}
            >
              ↻ Refresh
            </button>
          </div>

          {applications.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>

              <h3>No applications yet</h3>

              <p>
                Candidate applications will appear here.
              </p>
            </div>
          ) : (
            <div className="table-wrapper">
              <table className="applications-table">
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Position</th>
                    <th>Contact</th>
                    <th>Resume</th>
                    <th>Status</th>
                    <th>Applied</th>
                    <th>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {applications.map((application) => (
                    <tr key={application.id}>
                      <td>
                        <div className="candidate-info">
                          <div className="candidate-avatar">
                            {application.applicant_name
                              ? application.applicant_name
                                  .charAt(0)
                                  .toUpperCase()
                              : "C"}
                          </div>

                          <div>
                            <strong>
                              {application.applicant_name}
                            </strong>

                            <small>
                              Application #{application.id}
                            </small>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="position-info">
                          <strong>
                            {application.job_title || "N/A"}
                          </strong>

                          <small>
                            {application.company || ""}
                          </small>
                        </div>
                      </td>

                      <td>
                        <div className="contact-info">
                          <span>
                            {application.email}
                          </span>

                          <span>
                            {application.phone}
                          </span>
                        </div>
                      </td>

                      <td>
                        {application.resume ? (
                          <a
                            className="resume-link"
                            href={`http://localhost:5000/uploads/${application.resume}`}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <span>↗</span>
                            View Resume
                          </a>
                        ) : (
                          <span className="no-resume">
                            No Resume
                          </span>
                        )}
                      </td>

                      <td>
                        <select
                          className={`status-select status-${(
                            application.status || "Applied"
                          )
                            .toLowerCase()
                            .replace(/\s+/g, "-")}`}
                          value={application.status || "Applied"}
                          onChange={(e) =>
                            updateApplicationStatus(
                              application.id,
                              e.target.value
                            )
                          }
                        >
                          <option value="Applied">
                            Applied
                          </option>

                          <option value="Reviewing">
                            Reviewing
                          </option>

                          <option value="Selected">
                            Selected
                          </option>

                          <option value="Rejected">
                            Rejected
                          </option>
                        </select>
                      </td>

                      <td>
                        <span className="date-text">
                          {application.applied_at
                            ? new Date(
                                application.applied_at
                              ).toLocaleDateString()
                            : "N/A"}
                        </span>
                      </td>

                      <td>
                        <button
                          className="delete-application-btn"
                          onClick={() =>
                            deleteApplication(application.id)
                          }
                          title="Delete Application"
                        >
                          🗑
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    );
  }

  // ==========================================================
  // APPLICATION FORM
  // ==========================================================

  if (showApplyForm && selectedJob) {
    return (
      <div className="app">
        <nav className="navbar">
          <div className="logo">
            <span>Job</span>Portal
          </div>

          <button
            className="nav-btn elegant-admin-btn"
            onClick={backToJobs}
          >
            <span>←</span>
            Back to Jobs
          </button>
        </nav>

        <section className="application-page">
          <div className="application-container">
            {/* APPLICATION INFO */}

            <div className="application-info">
              <p className="eyebrow">CAREER OPPORTUNITY</p>

              <h1>
                Apply for your
                <span> next opportunity.</span>
              </h1>

              <p className="application-description">
                Take the next step in your career. Submit your
                details and let your experience speak for you.
              </p>

              <div className="selected-job-card">
                <div className="job-icon">💼</div>

                <div>
                  <p>You're applying for</p>

                  <h3>{selectedJob.title}</h3>

                  <span>
                    {selectedJob.company}
                  </span>

                  <small>
                    📍 {selectedJob.location}
                  </small>
                </div>
              </div>
            </div>

            {/* APPLICATION FORM */}

            <div className="application-form-card">
              <div className="form-header">
                <p className="eyebrow">APPLICATION</p>

                <h2>Candidate Details</h2>

                <p>
                  Complete the form below to submit your application.
                </p>
              </div>

              <form onSubmit={submitApplication}>
                <div className="form-group">
                  <label>Full Name *</label>

                  <input
                    type="text"
                    placeholder="Enter your full name"
                    value={applicantName}
                    onChange={(e) =>
                      setApplicantName(e.target.value)
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Email Address *</label>

                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) =>
                      setEmail(e.target.value)
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Phone Number *</label>

                  <input
                    type="tel"
                    placeholder="Enter your phone number"
                    value={phone}
                    onChange={(e) =>
                      setPhone(e.target.value)
                    }
                  />
                </div>

                <div className="form-group">
                  <label>Resume</label>

                  <div className="resume-upload">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) =>
                        setResume(e.target.files[0] || null)
                      }
                    />

                    <div className="upload-content">
                      <div className="upload-icon">
                        ↑
                      </div>

                      <strong>
                        {resume
                          ? resume.name
                          : "Upload your resume"}
                      </strong>

                      <span>
                        PDF, DOC or DOCX
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="submit-application-btn"
                >
                  Submit Application
                  <span>→</span>
                </button>
              </form>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // ==========================================================
  // MAIN JOB PORTAL
  // ==========================================================

  return (
    <div className="app">
      {/* NAVBAR */}

      <nav className="navbar">
        <div className="logo">
          <span>Job</span>Portal
        </div>

        <button
          className="nav-btn elegant-admin-btn"
          onClick={() => {
            setShowAdmin(true);
            fetchApplications();
          }}
        >
          Admin Panel
          <span>→</span>
        </button>
      </nav>

      {/* HERO */}

      <section className="hero">
        <div className="hero-content">
          <p className="eyebrow">
            FIND YOUR NEXT OPPORTUNITY
          </p>

          <h1>
            Build your future.
            <br />
            <span>Find your dream job.</span>
          </h1>

          <p className="hero-description">
            Discover meaningful opportunities from leading
            companies and take the next step in your career.
          </p>

          <div className="hero-stats">
            <div>
              <strong>{jobs.length}+</strong>
              <span>Open Positions</span>
            </div>

            <div>
              <strong>{applications.length}+</strong>
              <span>Applications</span>
            </div>
          </div>
        </div>
      </section>

      {/* POST JOB */}

      <section className="job-management">
        <div className="section-heading">
          <div>
            <p className="eyebrow">
              {editId ? "EDIT POSITION" : "EMPLOYER"}
            </p>

            <h2>
              {editId
                ? "Update Job"
                : "Post a New Job"}
            </h2>

            <p className="section-description">
              {editId
                ? "Update the position details below."
                : "Create a professional job listing for talented candidates."}
            </p>
          </div>
        </div>

        <form
          className="job-form"
          onSubmit={saveJob}
        >
          <div className="form-group">
            <label>Job Title</label>

            <input
              type="text"
              placeholder="Software Developer"
              value={title}
              onChange={(e) =>
                setTitle(e.target.value)
              }
            />
          </div>

          <div className="form-group">
            <label>Company</label>

            <input
              type="text"
              placeholder="Company name"
              value={company}
              onChange={(e) =>
                setCompany(e.target.value)
              }
            />
          </div>

          <div className="form-group">
            <label>Location</label>

            <input
              type="text"
              placeholder="Chennai"
              value={location}
              onChange={(e) =>
                setLocation(e.target.value)
              }
            />
          </div>

          <div className="job-form-actions">
            <button
              type="submit"
              className="primary-btn elegant-post-btn"
            >
              {editId ? "Update Job" : "Post Job"}
              <span>→</span>
            </button>

            {editId && (
              <button
                type="button"
                className="secondary-btn"
                onClick={resetJobForm}
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </section>

      {/* AVAILABLE JOBS */}

      <section className="jobs-section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">
              OPPORTUNITIES
            </p>

            <h2>Available Jobs</h2>

            <p className="section-description">
              Explore opportunities and apply for the role
              that matches your skills.
            </p>
          </div>

          <div className="job-count">
            {jobs.length}{" "}
            {jobs.length === 1 ? "Position" : "Positions"}
          </div>
        </div>

        {jobs.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">💼</div>

            <h3>No jobs available</h3>

            <p>
              New opportunities will appear here.
            </p>
          </div>
        ) : (
          <div className="jobs-grid">
            {jobs.map((job) => (
              <article
                className="job-card"
                key={job.id}
              >
                <div className="job-card-top">
                  <div className="job-icon">
                    💼
                  </div>

                  <span className="job-id">
                    #{job.id}
                  </span>
                </div>

                <div className="job-card-content">
                  <h3>{job.title}</h3>

                  <p className="company-name">
                    {job.company}
                  </p>

                  <p className="location">
                    📍 {job.location}
                  </p>
                </div>

                <div className="job-card-actions">
                  <button
                    className="apply-btn"
                    onClick={() =>
                      openApplyForm(job)
                    }
                  >
                    Apply Now
                    <span>→</span>
                  </button>

                  <div className="admin-job-actions">
                    <button
                      className="edit-btn"
                      onClick={() =>
                        editJob(job)
                      }
                      title="Edit Job"
                    >
                      ✎
                    </button>

                    <button
                      className="delete-btn"
                      onClick={() =>
                        deleteJob(job.id)
                      }
                      title="Delete Job"
                    >
                      🗑
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* FOOTER */}

      <footer className="footer">
        <div className="footer-content">
          <div className="logo">
            <span>Job</span>Portal
          </div>

          <p>
            © 2026 JobPortal. Built for better careers.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;