const express = require("express");
const cors = require("cors");
const neo4j = require("neo4j-driver");
const driver = require("./db");

const app = express();
app.use(cors());
app.use(express.json());

// ---------- Helper ----------
function toNumber(value) {
  return neo4j.isInt(value) ? value.toNumber() : value;
}

// ---------- Health Check ----------
app.get("/", (req, res) => {
  res.send("EKG Backend is running");
});

// ---------- Get All Students ----------
app.get("/students", async (req, res) => {
  const session = driver.session();
  try {
    const result = await session.run("MATCH (s:Student) RETURN s");

    const students = result.records.map(record => {
      const s = record.get("s").properties;
      return {
        id: toNumber(s.id),
        name: s.name,
        dept: s.dept,
        year: toNumber(s.year),
        university_id: s.university_id,
        enrollment_year: toNumber(s.enrollment_year),
        gpa: toNumber(s.gpa),
        career_goal: s.career_goal,
        program: s.program,
        email: s.email,
        country: s.country,
        interests: s.interests || []
      };
    });

    res.json(students);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    await session.close();
  }
});

// ---------- Add / Update Student ----------
app.post("/student", async (req, res) => {
  const { id, name, dept, year } = req.body;

  if (!id || !name || !dept || !year) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const session = driver.session();
  try {
    await session.run(
      `
      MERGE (s:Student {id:$id})
      SET s.name=$name, s.dept=$dept, s.year=$year
      `,
      { id, name, dept, year }
    );

    res.json({ message: "Student added / updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    await session.close();
  }
});

// ---------- Student → Skill ----------
app.post("/student/:id/skill", async (req, res) => {
  const studentId = parseInt(req.params.id);
  const { skill } = req.body;

  if (!skill) {
    return res.status(400).json({ error: "Skill name required" });
  }

  const session = driver.session();
  try {
    await session.run(
      `
      MATCH (s:Student {id:$id})
      MATCH (sk:Skill {name:$skill})
      MERGE (s)-[:HAS_SKILL]->(sk)
      `,
      { id: studentId, skill }
    );

    res.json({ message: "Skill linked to student" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    await session.close();
  }
});

// ---------- Student Skills ----------
app.get("/student/:id/skills", async (req, res) => {
  const studentId = parseInt(req.params.id);
  const session = driver.session();

  try {
    const result = await session.run(
      `
      MATCH (s:Student {id:$id})-[:HAS_SKILL]->(sk:Skill)
      RETURN sk.name AS skill
      `,
      { id: studentId }
    );

    res.json(result.records.map(r => r.get("skill")));
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    await session.close();
  }
});

// ---------- Student Details ----------
app.get("/student/:id", async (req, res) => {
  const studentId = parseInt(req.params.id);
  const session = driver.session();

  try {
    const result = await session.run(
      "MATCH (s:Student {id:$id}) RETURN s",
      { id: studentId }
    );

    if (!result.records.length) {
      return res.status(404).json({ error: "Student not found" });
    }

    const s = result.records[0].get("s").properties;

    res.json({
      id: toNumber(s.id),
      name: s.name,
      dept: s.dept,
      year: toNumber(s.year)
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    await session.close();
  }
});

// ---------- Student Projects ----------
app.get("/student/:id/projects", async (req, res) => {
  const studentId = parseInt(req.params.id);
  const session = driver.session();

  try {
    const result = await session.run(
      `
      MATCH (s:Student {id:$id})-[:WORKED_ON]->(p:Project)
      OPTIONAL MATCH (p)-[:USES]->(sk:Skill)
      RETURN p.title AS project, p.domain AS domain, collect(sk.name) AS skills
      `,
      { id: studentId }
    );

    res.json(
      result.records.map(r => ({
        title: r.get("project"),
        domain: r.get("domain"),
        skills: r.get("skills")
      }))
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    await session.close();
  }
});

// ---------- Student Mentor ----------
app.get("/student/:id/mentor", async (req, res) => {
  const session = driver.session();
  const studentId = parseInt(req.params.id);

  try {
    const result = await session.run(
      `
      MATCH (f:Faculty)-[:MENTORS]->(s:Student {id:$id})
      RETURN f.name AS name, f.designation AS designation, f.department AS department
      `,
      { id: studentId }
    );

    res.json(
      result.records.map(r => ({
        name: r.get("name"),
        designation: r.get("designation"),
        department: r.get("department")
      }))
    );
  } catch (err) {
    res.status(500).send(err.message);
  } finally {
    await session.close();
  }
});

// ---------- Get All Faculty ----------
app.get("/faculty", async (req, res) => {
  const session = driver.session();

  try {
    const result = await session.run("MATCH (f:Faculty) RETURN f");

    const faculty = result.records.map(r => {
      const f = r.get("f").properties;
      return {
        id: toNumber(f.id),
        name: f.name,
        designation: f.designation,
        department: f.department,
        email: f.email,
        country: f.country,
        h_index: toNumber(f.h_index),
        years_of_experience: toNumber(f.years_of_experience),
        highest_degree: f.highest_degree,
        office: f.office,
        google_scholar_url: f.google_scholar_url
      };
    });

    res.json(faculty);
  } catch (err) {
    res.status(500).send(err.message);
  } finally {
    await session.close();
  }
});

// ---------- Faculty Courses ----------
app.get("/faculty/:id/courses", async (req, res) => {
  const session = driver.session();
  const id = parseInt(req.params.id);

  try {
    const result = await session.run(
      `
      MATCH (f:Faculty {id:$id})-[:TEACHES]->(c:Course)
      RETURN c.name AS name, c.code AS code
      `,
      { id }
    );

    res.json(
      result.records.map(r => ({
        name: r.get("name"),
        code: r.get("code")
      }))
    );
  } catch (err) {
    res.status(500).send(err.message);
  } finally {
    await session.close();
  }
});

// ---------- Faculty Publications ----------
app.get("/faculty/:id/publications", async (req, res) => {
  const session = driver.session();
  const id = parseInt(req.params.id);

  try {
    const result = await session.run(
      `
      MATCH (f:Faculty {id:$id})-[:PUBLISHED]->(p:Publication)
      RETURN p.title AS title, p.journal AS journal, p.year AS year
      `,
      { id }
    );

    res.json(
      result.records.map(r => ({
        title: r.get("title"),
        journal: r.get("journal"),
        year: toNumber(r.get("year"))
      }))
    );
  } catch (err) {
    res.status(500).send(err.message);
  } finally {
    await session.close();
  }
});

// ---------- Recommended Projects for Student ----------
app.get("/recommendations/student/:id/projects", async (req, res) => {
  const studentId = parseInt(req.params.id);
  const session = driver.session();

  try {
    const result = await session.run(
      `
      MATCH (s:Student {id:$id})-[:HAS_SKILL]->(sk:Skill)<-[:USES]-(p:Project)
      WHERE NOT (s)-[:WORKED_ON]->(p)
      WITH p, collect(DISTINCT sk.name) AS matchedSkills
      RETURN 
        p.title AS title,
        p.domain AS domain,
        matchedSkills,
        size(matchedSkills) AS relevance
      ORDER BY relevance DESC
      `,
      { id: studentId }
    );

    const recommendations = result.records.map(r => {
  const skills = r.get("matchedSkills");

  return {
    title: r.get("title"),
    domain: r.get("domain"),
    matchedSkills: skills,
    relevance: toNumber(r.get("relevance")),
    explanation: `Recommended because this project uses ${skills.join(
      ", "
    )}, which you already know.`
  };
});


    res.json(recommendations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    await session.close();
  }
});

app.get("/recommendations/student/:id/mentors", async (req, res) => {
  const session = driver.session();
  const id = parseInt(req.params.id);

  try {
    const result = await session.run(
      `
      MATCH (s:Student {id:$id})
      MATCH (f:Faculty)
      OPTIONAL MATCH (s)-[:HAS_SKILL]->(sk:Skill)<-[:USES|:RESEARCHES_IN]-(f)
      OPTIONAL MATCH (s)-[:INTERESTED_IN]->(ra:ResearchArea)<-[:RESEARCHES_IN]-(f)
      WITH f,
           collect(DISTINCT sk.name) AS matchedSkills,
           collect(DISTINCT ra.name) AS matchedResearch,
           size(collect(DISTINCT sk)) * 2 +
           size(collect(DISTINCT ra)) * 3 AS relevance
      WHERE relevance > 0
      RETURN
        f.name AS mentor,
        f.designation AS designation,
        f.department AS department,
        matchedSkills,
        matchedResearch,
        relevance
      ORDER BY relevance DESC, f.h_index DESC
      `,
      { id }
    );

    res.json(
      result.records.map(r => ({
        mentor: r.get("mentor"),
        designation: r.get("designation"),
        department: r.get("department"),
        matchedSkills: r.get("matchedSkills"),
        matchedResearch: r.get("matchedResearch"),
         relevance: toNumber(r.get("relevance"))
      }))
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    await session.close();
  }
});

// ---------- Career-based Skill Gap ----------
app.get("/analysis/student/:id/skill-gap", async (req, res) => {
  const session = driver.session();
  const id = parseInt(req.params.id);

  try {
    const result = await session.run(
      `
      MATCH (s:Student {id:$id})-[:ASPIRES_TO]->(r:CareerRole)
      MATCH (r)-[:REQUIRES_SKILL]->(sk:Skill)
      WHERE NOT (s)-[:HAS_SKILL]->(sk)
      RETURN sk.name AS missingSkill
      `,
      { id }
    );

    res.json(result.records.map(r => r.get("missingSkill")));
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    await session.close();
  }
});

app.get("/analysis/student/:id/readiness", async (req, res) => {
  const session = driver.session();
  const id = parseInt(req.params.id);

  try {
    const result = await session.run(
      `
      MATCH (s:Student {id:$id})-[:ASPIRES_TO]->(r:CareerRole)
      MATCH (r)-[:REQUIRES_SKILL]->(sk:Skill)
      WITH collect(DISTINCT sk) AS requiredSkills

      OPTIONAL MATCH (s)-[:HAS_SKILL]->(owned:Skill)
      WHERE owned IN requiredSkills
      WITH requiredSkills, count(DISTINCT owned) AS ownedCount

      RETURN
        size(requiredSkills) AS totalRequired,
        ownedCount,
        round((ownedCount * 100.0) / size(requiredSkills)) AS readiness
      `,
      { id }
    );

    const row = result.records[0];

    res.json({
      totalRequired: toNumber(row.get("totalRequired")),
      ownedCount: toNumber(row.get("ownedCount")),
      readiness: toNumber(row.get("readiness"))
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    await session.close();
  }
});

// ---------- Server ----------
app.listen(5000, () => {
  console.log("Backend running on http://localhost:5000");
});
