const express = require("express");
const cors = require("cors");
const neo4j = require("neo4j-driver");
const driver = require("./db");

const app = express();
app.use(cors());
app.use(express.json());
function extractSkillsFromResume(resumeText) {
  const knownSkills = [
    "Python",
    "Java",
    "C++",
    "DSA",
    "React",
    "Node.js",
    "SQL",
    "MongoDB",
    "Neo4j",
    "AWS",
    "Docker",
    "Kubernetes",
    "System Design",
    "Machine Learning",
    "AI",
    "Cloud",
    "DevOps"
  ];

  const text = resumeText.toLowerCase();

  return knownSkills.filter(skill =>
    text.includes(skill.toLowerCase())
  );
}


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
app.get("/recommendations/student/:id/projects", async (req, res) => {
  const studentId = parseInt(req.params.id);
  const session = driver.session();

  try {
    const result = await session.run(
      `
      MATCH (s:Student {id:$id})
      MATCH (p:Project)
      WHERE NOT (s)-[:WORKED_ON]->(p)

      OPTIONAL MATCH (s)-[:HAS_SKILL]->(sk:Skill)<-[:USES|:BUILDS_SKILL]-(p)
      WITH s, p, collect(DISTINCT sk.name) AS matchedSkills

      WITH p, matchedSkills, size(matchedSkills) AS skillScore
      WHERE skillScore > 0

      RETURN 
        p.title AS title,
        p.domain AS domain,
        matchedSkills,
        skillScore * 20 AS relevance
      ORDER BY relevance DESC
      LIMIT 5
      `,
      { id: studentId }
    );

    const recommendations = result.records.map(r => ({
      title: r.get("title"),
      domain: r.get("domain"),
      matchedSkills: r.get("matchedSkills"),
      relevance: toNumber(r.get("relevance")),
      explanation: `Matches ${r.get("matchedSkills").length} of your skills`
    }));

    res.json(recommendations);

  } catch (err) {
    console.error("PROJECT RECOMMEND ERROR:", err);
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

      // -------- Skill Matches --------
      OPTIONAL MATCH (s)-[:HAS_SKILL]->(sk:Skill)<-[:SPECIALIZED_IN]-(f)
      WITH s, f, collect(DISTINCT sk) AS skillNodes

      WITH s, f, skillNodes, size(skillNodes) AS skillMatches

      // -------- Research Matches --------
      OPTIONAL MATCH (s)-[:INTERESTED_IN]->(ra:ResearchArea)<-[:RESEARCHES_IN]-(f)
      WITH s, f, skillNodes, skillMatches,
           collect(DISTINCT ra) AS researchNodes

      WITH 
        s,
        f,
        skillNodes,
        researchNodes,
        skillMatches,
        size(researchNodes) AS researchMatches

      // -------- Publication Count --------
      OPTIONAL MATCH (f)-[:PUBLISHED]->(p)
      WITH 
        s,
        f,
        skillNodes,
        researchNodes,
        skillMatches,
        researchMatches,
        count(DISTINCT p) AS pubCount

      WITH 
        f,
        skillNodes,
        researchNodes,
        skillMatches,
        researchMatches,
        pubCount,
        CASE WHEN s.dept = f.department THEN 1 ELSE 0 END AS deptMatch

      WITH 
        f,
        skillNodes,
        researchNodes,
        skillMatches,
        researchMatches,
        pubCount,
        deptMatch,
        (
          (skillMatches * 30) +
          (researchMatches * 30) +
          (deptMatch * 20) +
          (pubCount * 5)
        ) AS rawScore

      WHERE rawScore > 0

      RETURN
        f.name AS mentor,
        f.designation AS designation,
        f.department AS department,
        [sk IN skillNodes | sk.name] AS matchedSkills,
        [ra IN researchNodes | ra.name] AS matchedResearch,
        rawScore AS relevance
      ORDER BY rawScore DESC, f.h_index DESC
      LIMIT 5
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

// ---------- Career Simulation ----------
app.get("/simulation/student/:id/role/:role", async (req, res) => {
  const session = driver.session();
  const id = parseInt(req.params.id);
  const roleName = req.params.role;

  try {
    const result = await session.run(
      `
      MATCH (s:Student {id:$id})
      MATCH (r:CareerRole {name:$roleName})-[:REQUIRES_SKILL]->(req:Skill)
      OPTIONAL MATCH (s)-[:HAS_SKILL]->(owned:Skill)
      WITH s, r,
           collect(DISTINCT req.name) AS requiredSkills,
           collect(DISTINCT owned.name) AS ownedSkills

      WITH requiredSkills,
           ownedSkills,
           [skill IN requiredSkills WHERE skill IN ownedSkills] AS matched,
           [skill IN requiredSkills WHERE NOT skill IN ownedSkills] AS missing

      RETURN 
        requiredSkills,
        matched AS owned,
        missing,
        size(requiredSkills) AS totalRequired,
        size(matched) AS ownedCount
      `,
      { id, roleName }
    );

    if (result.records.length === 0) {
      return res.json({ error: "Invalid student or role" });
    }

    const row = result.records[0];

    // ✅ Convert Neo4j Integers properly
    const total = row.get("totalRequired").toNumber();
    const ownedCount = row.get("ownedCount").toNumber();

    const currentReadiness =
      total === 0 ? 0 : Math.round((ownedCount * 100) / total);

    res.json({
      requiredSkills: row.get("requiredSkills"),
      ownedSkills: row.get("owned"),
      missingSkills: row.get("missing"),
      currentReadiness,
      projectedReadiness: 100,
      improvement: 100 - currentReadiness
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    await session.close();
  }
});

// ---------- Get All Career Roles ----------
app.get("/career-roles", async (req, res) => {
  const session = driver.session();
  try {
    const result = await session.run(
      "MATCH (r:CareerRole) RETURN r.name AS name ORDER BY name"
    );

    res.json(result.records.map(r => r.get("name")));
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    await session.close();
  }
});

app.get("/analysis/student/:id/research-compatibility", async (req, res) => {
  const session = driver.session();
  const id = parseInt(req.params.id);

  try {
    const result = await session.run(
      `
      MATCH (s:Student {id:$id})
      MATCH (f:Faculty)

      // ----- Shared Research Areas -----
      OPTIONAL MATCH (s)-[:INTERESTED_IN]->(ra:ResearchArea)<-[:RESEARCHES_IN]-(f)
      WITH s, f, collect(DISTINCT ra) AS researchNodes

      WITH s, f, researchNodes, size(researchNodes) AS researchOverlap

      // ----- Publications -----
      OPTIONAL MATCH (f)-[:PUBLISHED]->(p)
      WITH s, f, researchNodes, researchOverlap, count(DISTINCT p) AS pubCount

      WITH 
        f,
        researchNodes,
        researchOverlap,
        pubCount,
        coalesce(f.h_index, 0) AS hIndex,
        CASE WHEN s.dept = f.department THEN 1 ELSE 0 END AS deptMatch

      // ----- Raw Score Calculation -----
      WITH 
        f,
        researchNodes,
        researchOverlap,
        pubCount,
        hIndex,
        deptMatch,
        (
          (researchOverlap * 40) +
          (pubCount * 5) +
          (hIndex * 1) +
          (deptMatch * 10)
        ) AS rawScore

      WHERE rawScore > 0

      // ----- Normalize to 100 -----
      WITH f, researchNodes, researchOverlap, pubCount, hIndex,
           CASE 
             WHEN rawScore > 100 THEN 100
             ELSE rawScore
           END AS compatibility

      RETURN
        f.name AS faculty,
        f.designation AS designation,
        f.department AS department,
        [ra IN researchNodes | ra.name] AS matchedResearch,
        researchOverlap,
        pubCount,
        hIndex,
        compatibility
      ORDER BY compatibility DESC
      LIMIT 5
      `,
      { id }
    );

    res.json(
      result.records.map(r => ({
        faculty: r.get("faculty"),
        designation: r.get("designation"),
        department: r.get("department"),
        matchedResearch: r.get("matchedResearch"),
        researchOverlap: r.get("researchOverlap"),
        publicationCount: r.get("pubCount"),
        hIndex: r.get("hIndex"),
        compatibility: toNumber(r.get("compatibility"))
      }))
    );

  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    await session.close();
  }
});
app.get("/graph/student/:id", async (req, res) => {
  const session = driver.session();
  const id = parseInt(req.params.id);

  try {
    const result = await session.run(
      `
      MATCH (s:Student {id:$id})
      OPTIONAL MATCH (s)-[r1]->(n1)
      OPTIONAL MATCH (n2)-[r2]->(s)
      WITH collect(DISTINCT s) + collect(DISTINCT n1) + collect(DISTINCT n2) AS nodes,
           collect(DISTINCT r1) + collect(DISTINCT r2) AS rels

      UNWIND nodes AS n
      WITH collect(DISTINCT {
        id: id(n),
        label: head(labels(n)),
        name: coalesce(n.name, n.title, n.code)
      }) AS nodes,
      rels

      UNWIND rels AS r
      WITH nodes,
      collect(DISTINCT {
        source: id(startNode(r)),
        target: id(endNode(r)),
        type: type(r)
      }) AS links

      RETURN nodes, links
      `,
      { id }
    );

    const record = result.records[0];
    res.json({
      nodes: record.get("nodes"),
      links: record.get("links")
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    await session.close();
  }
});

app.post("/resume/analyze", async (req, res) => {
  const { studentId, resumeText } = req.body;

  if (!studentId || !resumeText) {
    return res.status(400).json({ error: "studentId and resumeText required" });
  }

  const session = driver.session();

  try {
    // 1️⃣ Get student career goal
    const studentResult = await session.run(
      `MATCH (s:Student {id:$id}) RETURN s.career_goal AS role`,
      { id: Number(studentId) }
    );

    if (studentResult.records.length === 0) {
      return res.status(404).json({ error: "Student not found" });
    }

    const targetRole = studentResult.records[0].get("role");

    // 2️⃣ Get required skills for that role
    const requiredResult = await session.run(
      `
      MATCH (r:CareerRole {name:$role})-[:REQUIRES_SKILL]->(sk:Skill)
      RETURN collect(sk.name) AS requiredSkills
      `,
      { role: targetRole }
    );

    const requiredSkills =
      requiredResult.records[0]?.get("requiredSkills") || [];

    // 3️⃣ Extract skills from resume text
    const resumeSkills = extractSkillsFromResume(resumeText);

    // 4️⃣ Compare
    const matchedSkills = resumeSkills.filter(s =>
      requiredSkills.includes(s)
    );

    const missingSkills = requiredSkills.filter(s =>
      !resumeSkills.includes(s)
    );

    const score =
      requiredSkills.length === 0
        ? 0
        : Math.round((matchedSkills.length / requiredSkills.length) * 100);

    res.json({
      studentId,
      targetRole,
      resumeScore: score,
      matchedSkills,
      missingSkills
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  } finally {
    await session.close();
  }
});

// ---------- Server ----------
app.listen(5000, () => {
  console.log("Backend running on http://localhost:5000");
});
