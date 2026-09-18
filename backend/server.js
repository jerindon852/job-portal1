const express = require("express");
const cors = require("cors");
const { Pool } = require("pg");
const multer = require("multer");

const app = express();
const PORT = 5000;

// ===============================
// MIDDLEWARE
// ===============================

app.use(cors());
app.use(express.json());

// ===============================
// RESUME UPLOAD
// ===============================

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "uploads/");
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + "-" + file.originalname);
    }
});

const upload = multer({ storage });

// ===============================
// POSTGRESQL
// ===============================

const pool = new Pool({
    user: "postgres",
    host: "172.17.0.1",
    database: "job_portal",
    password: "jerin20",
    port: 5432
});

pool.query("SELECT NOW()", (err) => {
    if (err) {
        console.error("Database connection failed:", err.message);
    } else {
        console.log("PostgreSQL connected successfully!");
    }
});

// =====================================================
// JOB APIs
// =====================================================

// GET ALL JOBS

app.get("/api/jobs", async (req, res) => {
    try {
        const result = await pool.query(
            "SELECT * FROM jobs ORDER BY id DESC"
        );

        res.json(result.rows);
    } catch (err) {
        console.error(err.message);

        res.status(500).json({
            message: "Database error"


        });
    }
});

// ADD JOB

app.post("/api/jobs", async (req, res) => {
    try {
        const { title, company, location } = req.body;

        const result = await pool.query(
            "INSERT INTO jobs (title, company, location) VALUES ($1, $2, $3) RETURNING *",
            [title, company, location]
        );

        res.status(201).json({
            message: "Job added successfully",
            job: result.rows[0]
        });
    } catch (err) {
        console.error(err.message);

        res.status(500).json({
            message: "Database error"
        });
    }
});

// UPDATE JOB

app.put("/api/jobs/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { title, company, location } = req.body;

        const result = await pool.query(
            "UPDATE jobs SET title = $1, company = $2, location = $3 WHERE id = $4 RETURNING *",
            [title, company, location, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Job not found"
            });
        }

        res.json({
            message: "Job updated successfully",
            job: result.rows[0]
        });
    } catch (err) {
        console.error(err.message);

        res.status(500).json({
            message: "Database error"
        });
    }
});

// DELETE JOB

app.delete("/api/jobs/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            "DELETE FROM jobs WHERE id = $1 RETURNING *",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Job not found"
            });
        }

        res.json({
            message: "Job deleted successfully",
            job: result.rows[0]
        });
    } catch (err) {
        console.error(err.message);

        res.status(500).json({
            message: "Database error"
        });
    }
});

// =====================================================
// APPLICATION APIs
// =====================================================

// GET ALL APPLICATIONS

app.get("/api/applications", async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT
                a.id,
                a.applicant_name,
                a.email,
                a.phone,
                a.resume,
                a.status,
                a.applied_at,
                j.title AS job_title,
                j.company
            FROM applications a
            LEFT JOIN jobs j
                ON a.job_id = j.id
            ORDER BY a.id DESC
        `);

        res.json(result.rows);
    } catch (err) {
        console.error(err.message);

        res.status(500).json({
            message: "Failed to fetch applications"
        });
    }
});

// SUBMIT APPLICATION

app.post(
    "/api/applications",
    upload.single("resume"),
    async (req, res) => {
        try {
            const {
                job_id,
                applicant_name,
                email,
                phone
            } = req.body;

            const resume = req.file
                ? req.file.filename
                : "";

            const result = await pool.query(
                "INSERT INTO applications (job_id, applicant_name, email, phone, resume) VALUES ($1, $2, $3, $4, $5) RETURNING *",
                [
                    job_id,
                    applicant_name,
                    email,
                    phone,
                    resume
                ]
            );

            res.status(201).json({
                message: "Application submitted successfully",
                application: result.rows[0]
            });
        } catch (err) {
            console.error(err.message);

            res.status(500).json({
                message: "Application submission failed"
            });
        }
    }
);

// UPDATE APPLICATION STATUS

app.put("/api/applications/:id/status", async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const result = await pool.query(
            "UPDATE applications SET status = $1 WHERE id = $2 RETURNING *",
            [status, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Application not found"
            });
        }

        res.json({
            message: "Application status updated",
            application: result.rows[0]
        });
    } catch (err) {
        console.error(err.message);

        res.status(500).json({
            message: "Failed to update application status"
        });
    }
});

// DELETE APPLICATION

app.delete("/api/applications/:id", async (req, res) => {
    try {
        const { id } = req.params;

        const result = await pool.query(
            "DELETE FROM applications WHERE id = $1 RETURNING *",
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({
                message: "Application not found"
            });
        }

        res.json({
            message: "Application deleted successfully",
            application: result.rows[0]
        });
    } catch (err) {
        console.error(err.message);

        res.status(500).json({
            message: "Failed to delete application"
        });
    }
});

// =====================================================
// START SERVER
// =====================================================

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
