const express = require("express");
const cors = require("cors");
const neo4j = require("neo4j-driver");
const multer = require("multer");
const pdfParse = require("pdf-parse");
const mammoth = require("mammoth");
const path = require("path");
const driver = require("./db");

const app = express();
app.use(cors());
app.use(express.json());
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }
});
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

function extractSectionBlock(resumeText, headingPatterns, allHeadingPatterns) {
  if (!resumeText) return { text: "", found: false };
  const text = resumeText.replace(/\r/g, "");
  const headingRegex = new RegExp(`^\\s*(${headingPatterns.join("|")})\\s*$`, "im");
  const startMatch = headingRegex.exec(text);
  if (!startMatch) return { text: "", found: false };

  const startIndex = startMatch.index + startMatch[0].length;
  const after = text.slice(startIndex);
  const stopRegex = new RegExp(`\\n\\s*(?:${allHeadingPatterns.join("|")})\\s*\\n`, "i");
  const stopMatch = stopRegex.exec(after);
  const block = stopMatch ? after.slice(0, stopMatch.index) : after;

  return { text: block.trim(), found: true };
}

function buildSectionAnalysis(resumeText) {
  const sectionDefs = {
    experience: ["experience", "work experience", "professional experience", "internship", "internships"],
    projects: ["projects", "academic projects", "personal projects"],
    skills: ["skills", "technical skills", "core skills"],
    education: ["education", "academic background", "qualifications"]
  };
  const allHeadingPatterns = Object.values(sectionDefs).flat();

  const sections = {};
  Object.entries(sectionDefs).forEach(([sectionName, headingPatterns]) => {
    const { text, found } = extractSectionBlock(resumeText, headingPatterns, allHeadingPatterns);
    const bulletLines = (text.match(/(^|\n)\s*[-*•]/g) || []).length;
    const confidence = Math.min(
      1,
      (found ? 0.55 : 0) + (text.length > 100 ? 0.25 : 0) + (bulletLines >= 2 ? 0.2 : 0)
    );

    sections[sectionName] = {
      found,
      confidence: Number(confidence.toFixed(2)),
      content: text
    };
  });

  return sections;
}

function runATSChecks({ resumeText, sections, requiredSkills, matchedSkills }) {
  const text = (resumeText || "").toLowerCase();
  const projectsText = (sections.projects?.content || "").toLowerCase();

  const actionVerbs = [
    "built", "developed", "implemented", "designed", "optimized", "led",
    "created", "improved", "delivered", "engineered", "deployed", "automated"
  ];
  const actionVerbsFound = actionVerbs.filter((verb) =>
    new RegExp(`\\b${verb}\\b`, "i").test(text)
  );

  const quantifiedMatches = resumeText.match(
    /\b\d+(\.\d+)?\s*(%|x|k|m|million|billion|users?|clients?|days?|months?|years?)\b/gi
  ) || [];

  const projectDepthSignals = {
    problemStatement: /\b(problem|challenge|pain point|objective|goal)\b/i.test(projectsText),
    implementationDetail: /\b(architecture|pipeline|api|database|model|algorithm|workflow|microservice)\b/i.test(projectsText),
    outcomes: /\b(result|impact|improved|reduced|increased|achieved|deployed)\b/i.test(projectsText)
  };
  const depthSignalCount = Object.values(projectDepthSignals).filter(Boolean).length;

  const keywordCoverage =
    requiredSkills.length === 0 ? 0 : Math.round((matchedSkills.length / requiredSkills.length) * 100);

  const quantifiedImpactScore = Math.min(100, quantifiedMatches.length * 20);
  const actionVerbScore = Math.min(100, actionVerbsFound.length * 12);
  const projectDepthScore = Math.round((depthSignalCount / 3) * 100);
  const atsScore = Math.round(
    quantifiedImpactScore * 0.25 +
    actionVerbScore * 0.2 +
    projectDepthScore * 0.25 +
    keywordCoverage * 0.3
  );

  return {
    score: atsScore,
    quantifiedImpact: {
      score: quantifiedImpactScore,
      count: quantifiedMatches.length,
      examples: quantifiedMatches.slice(0, 5)
    },
    actionVerbs: {
      score: actionVerbScore,
      count: actionVerbsFound.length,
      found: actionVerbsFound
    },
    projectDepth: {
      score: projectDepthScore,
      signals: projectDepthSignals
    },
    missingKeywords: requiredSkills.filter((skill) => !matchedSkills.includes(skill)),
    keywordCoverage
  };
}

function scoreProjectQualityFromResume({ sections, requiredSkills }) {
  const projectsText = sections.projects?.content || "";
  const projectsLower = projectsText.toLowerCase();
  const projectSectionSkills = extractSkillsFromResume(projectsText);
  const matchedProjectSkills = projectSectionSkills.filter((s) => requiredSkills.includes(s));

  const problemStatementHits = (projectsLower.match(/\b(problem|challenge|objective|goal)\b/g) || []).length;
  const outcomeHits = (projectsLower.match(/\b(improved|reduced|increased|achieved|result|deployed)\b/g) || []).length;
  const numericOutcomeHits = (projectsText.match(/\b\d+(\.\d+)?\s*(%|x|k|m|users?|days?|months?|years?)\b/gi) || []).length;

  const problemStatementScore = Math.min(100, problemStatementHits * 25);
  const techStackRelevanceScore =
    requiredSkills.length === 0 ? 0 : Math.round((matchedProjectSkills.length / requiredSkills.length) * 100);
  const outcomesScore = Math.min(100, outcomeHits * 20 + numericOutcomeHits * 20);

  const score = Math.round(
    problemStatementScore * 0.3 +
    techStackRelevanceScore * 0.45 +
    outcomesScore * 0.25
  );

  return {
    score,
    problemStatementScore,
    techStackRelevanceScore,
    outcomesScore,
    matchedProjectSkills,
    signals: {
      problemStatementHits,
      outcomeHits,
      numericOutcomeHits
    }
  };
}


// ---------- Helper ----------
function toNumber(value) {
  return neo4j.isInt(value) ? value.toNumber() : value;
}

function uniqueStrings(list = []) {
  return [...new Set((list || []).filter(Boolean))];
}

async function storeRecommendationEvidence(
  session,
  { studentId, recommendationType, target, targetLabel, relevance, evidencePaths }
) {
  const updatedAt = new Date().toISOString();
  const evidenceJson = JSON.stringify(evidencePaths || []);

  await session.run(
    `
    MATCH (s:Student {id:$studentId})
    MERGE (e:RecommendationEvidence {
      studentId:$studentId,
      recommendationType:$recommendationType,
      target:$target
    })
    SET
      e.targetLabel = $targetLabel,
      e.relevance = $relevance,
      e.evidenceJson = $evidenceJson,
      e.updatedAt = $updatedAt
    MERGE (s)-[:HAS_RECOMMENDATION_EVIDENCE]->(e)
    `,
    {
      studentId,
      recommendationType,
      target,
      targetLabel,
      relevance,
      evidenceJson,
      updatedAt
    }
  );
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

    const recommendations = [];

    for (const record of result.records) {
      const title = record.get("title");
      const domain = record.get("domain");
      const matchedSkills = record.get("matchedSkills");
      const relevance = toNumber(record.get("relevance"));

      const evidenceResult = await session.run(
        `
        MATCH (s:Student {id:$id})-[:HAS_SKILL]->(sk:Skill)<-[rel:USES|BUILDS_SKILL]-(p:Project {title:$title})
        RETURN DISTINCT sk.name AS skill, type(rel) AS relationType
        LIMIT 5
        `,
        { id: studentId, title }
      );

      const evidencePaths = evidenceResult.records.map((er) => ({
        type: "skill_alignment",
        summary: `${title} aligns via ${er.get("skill")}`,
        path: [
          "Student",
          `HAS_SKILL -> ${er.get("skill")}`,
          `${er.get("relationType")} <- Project:${title}`
        ]
      }));

      await storeRecommendationEvidence(session, {
        studentId,
        recommendationType: "project",
        target: title,
        targetLabel: `${title} (${domain})`,
        relevance,
        evidencePaths
      });

      recommendations.push({
        title,
        domain,
        matchedSkills,
        relevance,
        explanation: `Matches ${matchedSkills.length} of your skills`,
        evidencePaths
      });
    }

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

    const recommendations = [];

    for (const record of result.records) {
      const mentor = record.get("mentor");
      const designation = record.get("designation");
      const department = record.get("department");
      const matchedSkills = record.get("matchedSkills");
      const matchedResearch = record.get("matchedResearch");
      const relevance = toNumber(record.get("relevance"));

      const skillPathResult = await session.run(
        `
        MATCH (s:Student {id:$id})-[:HAS_SKILL]->(sk:Skill)<-[:SPECIALIZED_IN]-(f:Faculty {name:$mentor})
        RETURN DISTINCT sk.name AS skill
        LIMIT 3
        `,
        { id, mentor }
      );

      const researchPathResult = await session.run(
        `
        MATCH (s:Student {id:$id})-[:INTERESTED_IN]->(ra:ResearchArea)<-[:RESEARCHES_IN]-(f:Faculty {name:$mentor})
        RETURN DISTINCT ra.name AS area
        LIMIT 3
        `,
        { id, mentor }
      );

      const evidencePaths = [
        ...skillPathResult.records.map((sr) => ({
          type: "skill_alignment",
          summary: `${mentor} specializes in ${sr.get("skill")}`,
          path: [
            "Student",
            `HAS_SKILL -> ${sr.get("skill")}`,
            `SPECIALIZED_IN <- Faculty:${mentor}`
          ]
        })),
        ...researchPathResult.records.map((rr) => ({
          type: "research_alignment",
          summary: `${mentor} researches ${rr.get("area")}`,
          path: [
            "Student",
            `INTERESTED_IN -> ${rr.get("area")}`,
            `RESEARCHES_IN <- Faculty:${mentor}`
          ]
        }))
      ];

      await storeRecommendationEvidence(session, {
        studentId: id,
        recommendationType: "mentor",
        target: mentor,
        targetLabel: `${mentor} (${designation})`,
        relevance,
        evidencePaths
      });

      recommendations.push({
        mentor,
        designation,
        department,
        matchedSkills,
        matchedResearch,
        relevance,
        evidencePaths
      });
    }

    res.json(recommendations);

  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    await session.close();
  }
});

app.get("/recommendations/student/:id/evidence", async (req, res) => {
  const session = driver.session();
  const id = parseInt(req.params.id);

  try {
    const result = await session.run(
      `
      MATCH (s:Student {id:$id})-[:HAS_RECOMMENDATION_EVIDENCE]->(e:RecommendationEvidence)
      RETURN
        e.recommendationType AS recommendationType,
        e.target AS target,
        e.targetLabel AS targetLabel,
        e.relevance AS relevance,
        e.evidenceJson AS evidenceJson,
        e.updatedAt AS updatedAt
      ORDER BY e.relevance DESC, e.updatedAt DESC
      `,
      { id }
    );

    res.json(
      result.records.map((r) => ({
        recommendationType: r.get("recommendationType"),
        target: r.get("target"),
        targetLabel: r.get("targetLabel"),
        relevance: toNumber(r.get("relevance")),
        updatedAt: r.get("updatedAt"),
        evidencePaths: JSON.parse(r.get("evidenceJson") || "[]")
      }))
    );
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    await session.close();
  }
});

app.get("/recommendations/student/:id/evidence-graph", async (req, res) => {
  const session = driver.session();
  const id = parseInt(req.params.id);
  const recommendationType = String(req.query.type || "").toLowerCase();
  const target = String(req.query.target || "");

  if (!target || !["mentor", "project"].includes(recommendationType)) {
    return res.status(400).json({ error: "type (mentor|project) and target are required" });
  }

  try {
    if (recommendationType === "project") {
      const result = await session.run(
        `
        MATCH (s:Student {id:$id})
        MATCH (p:Project {title:$target})
        OPTIONAL MATCH (s)-[:HAS_SKILL]->(sk:Skill)<-[:USES|BUILDS_SKILL]-(p)
        RETURN
          id(s) AS studentNodeId,
          s.name AS studentName,
          id(p) AS projectNodeId,
          p.title AS projectTitle,
          collect(DISTINCT sk.name) AS matchedSkills
        `,
        { id, target }
      );

      if (!result.records.length) {
        return res.json({ recommendationType, target, nodes: [], links: [] });
      }

      const row = result.records[0];
      const studentNodeId = toNumber(row.get("studentNodeId"));
      const projectNodeId = toNumber(row.get("projectNodeId"));
      const matchedSkills = row.get("matchedSkills").filter(Boolean);

      const nodes = [
        { id: studentNodeId, label: "Student", name: row.get("studentName") || "Student" },
        { id: projectNodeId, label: "Project", name: row.get("projectTitle") || target },
        ...matchedSkills.map((skill) => ({
          id: `skill:${skill}`,
          label: "Skill",
          name: skill
        }))
      ];

      const links = [];
      if (matchedSkills.length > 0) {
        matchedSkills.forEach((skill) => {
          links.push({ source: studentNodeId, target: `skill:${skill}`, type: "HAS_SKILL" });
          links.push({ source: projectNodeId, target: `skill:${skill}`, type: "USES_SKILL" });
        });
      } else {
        links.push({ source: studentNodeId, target: projectNodeId, type: "RECOMMENDED_FOR" });
      }

      return res.json({ recommendationType, target, nodes, links });
    }

    const result = await session.run(
      `
      MATCH (s:Student {id:$id})
      MATCH (f:Faculty)
      WHERE toLower(trim(f.name)) = toLower(trim($target))
         OR toLower(trim(f.name)) CONTAINS toLower(trim($target))
         OR toLower(trim($target)) CONTAINS toLower(trim(f.name))
      WITH s, f LIMIT 1
      OPTIONAL MATCH (s)-[:HAS_SKILL]->(sk:Skill)<-[:SPECIALIZED_IN]-(f)
      WITH s, f, collect(DISTINCT sk.name) AS matchedSkills
      OPTIONAL MATCH (s)-[:INTERESTED_IN]->(ra:ResearchArea)<-[:RESEARCHES_IN]-(f)
      RETURN
        id(s) AS studentNodeId,
        s.name AS studentName,
        id(f) AS facultyNodeId,
        f.name AS facultyName,
        matchedSkills,
        collect(DISTINCT ra.name) AS matchedResearch
      `,
      { id, target }
    );

    if (!result.records.length) {
      return res.json({ recommendationType, target, nodes: [], links: [] });
    }

    const row = result.records[0];
    const studentNodeId = toNumber(row.get("studentNodeId"));
    const facultyNodeId = toNumber(row.get("facultyNodeId"));
    const matchedSkills = row.get("matchedSkills").filter(Boolean);
    const matchedResearch = row.get("matchedResearch").filter(Boolean);

    const nodes = [
      { id: studentNodeId, label: "Student", name: row.get("studentName") || "Student" },
      { id: facultyNodeId, label: "Faculty", name: row.get("facultyName") || target },
      ...matchedSkills.map((skill) => ({
        id: `skill:${skill}`,
        label: "Skill",
        name: skill
      })),
      ...matchedResearch.map((area) => ({
        id: `research:${area}`,
        label: "ResearchArea",
        name: area
      }))
    ];

    const links = [];
    matchedSkills.forEach((skill) => {
      links.push({ source: studentNodeId, target: `skill:${skill}`, type: "HAS_SKILL" });
      links.push({ source: facultyNodeId, target: `skill:${skill}`, type: "SPECIALIZED_IN" });
    });
    matchedResearch.forEach((area) => {
      links.push({ source: studentNodeId, target: `research:${area}`, type: "INTERESTED_IN" });
      links.push({ source: facultyNodeId, target: `research:${area}`, type: "RESEARCHES_IN" });
    });

    if (links.length === 0) {
      links.push({ source: studentNodeId, target: facultyNodeId, type: "RECOMMENDED_FOR" });
    }

    res.json({ recommendationType, target, nodes, links });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    await session.close();
  }
});

app.get("/analysis/student/:id/bridge-to-role", async (req, res) => {
  const session = driver.session();
  const id = parseInt(req.params.id);

  try {
    const result = await session.run(
      `
      MATCH (s:Student {id:$id})-[:ASPIRES_TO]->(r:CareerRole)
      MATCH (r)-[:REQUIRES_SKILL]->(req:Skill)
      OPTIONAL MATCH (s)-[:HAS_SKILL]->(owned:Skill)
      WITH s, r,
           collect(DISTINCT req.name) AS requiredSkills,
           collect(DISTINCT owned.name) AS ownedSkills
      RETURN r.name AS targetRole, requiredSkills, ownedSkills
      `,
      { id }
    );

    if (!result.records.length) {
      return res.status(404).json({ error: "Student or target role not found" });
    }

    const row = result.records[0];
    const targetRole = row.get("targetRole");
    const requiredSkills = uniqueStrings(row.get("requiredSkills"));
    const ownedSkills = uniqueStrings(row.get("ownedSkills"));
    const missingSkills = requiredSkills.filter((s) => !ownedSkills.includes(s));

    const bridgeItems = [];
    for (const skill of missingSkills) {
      const pathResult = await session.run(
        `
        MATCH (sk:Skill {name:$skill})
        OPTIONAL MATCH (p:Project)-[:USES|BUILDS_SKILL]->(sk)
        WITH sk, collect(DISTINCT p.title)[0..3] AS projectTitles
        OPTIONAL MATCH (c:Course)-[:COVERS_SKILL|TEACHES_SKILL|BUILDS_SKILL]->(sk)
        RETURN
          sk.name AS skill,
          projectTitles,
          collect(DISTINCT coalesce(c.name, c.code))[0..3] AS courseNames
        `,
        { skill }
      );

      const pr = pathResult.records[0];
      const viaProjects = uniqueStrings(pr?.get("projectTitles") || []);
      const viaCourses = uniqueStrings(pr?.get("courseNames") || []);
      const evidencePaths = [
        {
          summary: `CareerRole:${targetRole} requires ${skill}`,
          path: [`Student`, `ASPIRES_TO -> ${targetRole}`, `REQUIRES_SKILL -> ${skill}`]
        },
        ...viaProjects.map((p) => ({
          summary: `${p} can help build ${skill}`,
          path: [`Project:${p}`, `BUILDS_SKILL/USES -> ${skill}`, `enables path to ${targetRole}`]
        })),
        ...viaCourses.map((c) => ({
          summary: `${c} can support ${skill}`,
          path: [`Course:${c}`, `COVERS/TEACHES_SKILL -> ${skill}`, `enables path to ${targetRole}`]
        }))
      ];

      bridgeItems.push({
        skill,
        viaProjects,
        viaCourses,
        evidencePaths
      });
    }

    const currentReadiness =
      requiredSkills.length === 0
        ? 0
        : Math.round((ownedSkills.filter((s) => requiredSkills.includes(s)).length * 100) / requiredSkills.length);

    res.json({
      studentId: id,
      targetRole,
      requiredSkills,
      ownedSkills,
      missingSkills,
      currentReadiness,
      shortestBridgeLength: missingSkills.length,
      bridgeItems
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    await session.close();
  }
});

app.get("/analysis/student/:id/counterfactual", async (req, res) => {
  const session = driver.session();
  const id = parseInt(req.params.id);
  const addedSkills = uniqueStrings(
    String(req.query.addSkills || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  );

  if (!addedSkills.length) {
    return res.status(400).json({ error: "addSkills query param required (comma-separated)" });
  }

  try {
    const baseResult = await session.run(
      `
      MATCH (s:Student {id:$id})-[:ASPIRES_TO]->(r:CareerRole)
      MATCH (r)-[:REQUIRES_SKILL]->(req:Skill)
      OPTIONAL MATCH (s)-[:HAS_SKILL]->(owned:Skill)
      RETURN
        r.name AS targetRole,
        collect(DISTINCT req.name) AS requiredSkills,
        collect(DISTINCT owned.name) AS ownedSkills
      `,
      { id }
    );

    if (!baseResult.records.length) {
      return res.status(404).json({ error: "Student or target role not found" });
    }

    const base = baseResult.records[0];
    const targetRole = base.get("targetRole");
    const requiredSkills = uniqueStrings(base.get("requiredSkills"));
    const currentOwnedSkills = uniqueStrings(base.get("ownedSkills"));
    const projectedOwnedSkills = uniqueStrings([...currentOwnedSkills, ...addedSkills]);

    const calcReadiness = (owned) =>
      requiredSkills.length === 0
        ? 0
        : Math.round((owned.filter((s) => requiredSkills.includes(s)).length * 100) / requiredSkills.length);

    const currentReadiness = calcReadiness(currentOwnedSkills);
    const projectedReadiness = calcReadiness(projectedOwnedSkills);

    const projectRows = await session.run(
      `
      MATCH (s:Student {id:$id})
      MATCH (p:Project)
      WHERE NOT (s)-[:WORKED_ON]->(p)
      OPTIONAL MATCH (p)-[:USES|BUILDS_SKILL]->(sk:Skill)
      RETURN p.title AS title, p.domain AS domain, collect(DISTINCT sk.name) AS projectSkills
      `,
      { id }
    );

    const mentorRows = await session.run(
      `
      MATCH (f:Faculty)
      OPTIONAL MATCH (f)-[:SPECIALIZED_IN]->(sk:Skill)
      RETURN
        f.name AS mentor,
        f.designation AS designation,
        f.department AS department,
        collect(DISTINCT sk.name) AS mentorSkills
      `,
      {}
    );

    const projectUplifts = projectRows.records
      .map((r) => {
        const title = r.get("title");
        const domain = r.get("domain");
        const projectSkills = uniqueStrings(r.get("projectSkills"));
        const currentMatches = projectSkills.filter((s) => currentOwnedSkills.includes(s));
        const projectedMatches = projectSkills.filter((s) => projectedOwnedSkills.includes(s));
        const unlockedBy = projectedMatches.filter((s) => !currentMatches.includes(s) && addedSkills.includes(s));
        return {
          title,
          domain,
          unlockDelta: projectedMatches.length - currentMatches.length,
          unlockedBy,
          evidencePath: unlockedBy.map((s) => `Student -> (add ${s}) -> Project:${title}`)
        };
      })
      .filter((p) => p.unlockDelta > 0)
      .sort((a, b) => b.unlockDelta - a.unlockDelta)
      .slice(0, 5);

    const mentorUplifts = mentorRows.records
      .map((r) => {
        const mentor = r.get("mentor");
        const designation = r.get("designation");
        const department = r.get("department");
        const mentorSkills = uniqueStrings(r.get("mentorSkills"));
        const currentMatches = mentorSkills.filter((s) => currentOwnedSkills.includes(s));
        const projectedMatches = mentorSkills.filter((s) => projectedOwnedSkills.includes(s));
        const unlockedBy = projectedMatches.filter((s) => !currentMatches.includes(s) && addedSkills.includes(s));
        return {
          mentor,
          designation,
          department,
          unlockDelta: projectedMatches.length - currentMatches.length,
          unlockedBy,
          evidencePath: unlockedBy.map((s) => `Student -> (add ${s}) -> Faculty:${mentor}`)
        };
      })
      .filter((m) => m.unlockDelta > 0)
      .sort((a, b) => b.unlockDelta - a.unlockDelta)
      .slice(0, 5);

    res.json({
      studentId: id,
      targetRole,
      addedSkills,
      currentReadiness,
      projectedReadiness,
      readinessDelta: projectedReadiness - currentReadiness,
      unlockedProjects: projectUplifts,
      unlockedMentors: mentorUplifts
    });
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

async function analyzeResumeHandler(req, res) {
  const { resumeText: pastedResumeText } = req.body;
  const rawStudentId = req.params.id ?? req.body.studentId;
  const studentId = Number(rawStudentId);
  let resumeText = (pastedResumeText || "").trim();

  if (!resumeText && req.file) {
    try {
      resumeText = await extractTextFromUploadedResume(req.file);
    } catch (err) {
      return res.status(400).json({ error: err.message });
    }
  }

  if (!Number.isFinite(studentId) || !resumeText) {
    return res.status(400).json({ error: "studentId and resumeText required" });
  }

  const session = driver.session();

  try {
    const studentResult = await session.run(
      `MATCH (s:Student {id:$id}) RETURN s.career_goal AS role`,
      { id: studentId }
    );

    if (studentResult.records.length === 0) {
      return res.status(404).json({ error: "Student not found" });
    }

    const targetRole = studentResult.records[0].get("role");

    const requiredResult = await session.run(
      `
      MATCH (r:CareerRole {name:$role})-[:REQUIRES_SKILL]->(sk:Skill)
      RETURN collect(sk.name) AS requiredSkills
      `,
      { role: targetRole }
    );

    const requiredSkills = requiredResult.records[0]?.get("requiredSkills") || [];
    const resumeSkills = extractSkillsFromResume(resumeText);
    const projectSectionSkills = extractProjectSectionSkills(resumeText);
    const sectionAnalysis = buildSectionAnalysis(resumeText);

    const matchedSkills = resumeSkills.filter((s) => requiredSkills.includes(s));
    const missingSkills = requiredSkills.filter((s) => !resumeSkills.includes(s));
    const matchedProjectSectionSkills = projectSectionSkills.filter((s) =>
      requiredSkills.includes(s)
    );

    const skillScore =
      requiredSkills.length === 0
        ? 0
        : Math.round((matchedSkills.length / requiredSkills.length) * 100);

    const resumeProjectSectionScore =
      requiredSkills.length === 0
        ? 0
        : Math.round((matchedProjectSectionSkills.length / requiredSkills.length) * 100);

    // Lightweight project signal: how many student projects align with required role skills.
    const projectResult = await session.run(
      `
      MATCH (s:Student {id:$id})
      OPTIONAL MATCH (s)-[:WORKED_ON]->(pAll:Project)
      WITH s, collect(DISTINCT pAll) AS allProjects
      OPTIONAL MATCH (s)-[:WORKED_ON]->(pMatch:Project)-[:USES|BUILDS_SKILL]->(sk:Skill)
      WITH
        allProjects,
        collect(DISTINCT CASE WHEN sk.name IN $requiredSkills THEN pMatch END) AS matchedProjectsRaw
      RETURN
        size([p IN allProjects WHERE p IS NOT NULL]) AS totalProjects,
        size([p IN matchedProjectsRaw WHERE p IS NOT NULL]) AS matchedProjects
      `,
      { id: studentId, requiredSkills }
    );

    const projectRow = projectResult.records[0];
    const totalProjects = toNumber(projectRow.get("totalProjects"));
    const matchedProjects = toNumber(projectRow.get("matchedProjects"));
    const projectScore =
      totalProjects === 0 ? 0 : Math.round((matchedProjects / totalProjects) * 100);
    // Minor project-section signal from resume text.
    const finalScore = Math.round(
      skillScore * 0.75 + projectScore * 0.15 + resumeProjectSectionScore * 0.1
    );
    const atsChecks = runATSChecks({
      resumeText,
      sections: sectionAnalysis,
      requiredSkills,
      matchedSkills
    });
    const projectQuality = scoreProjectQualityFromResume({
      sections: sectionAnalysis,
      requiredSkills
    });
    const smartScore = Math.round(finalScore * 0.7 + atsChecks.score * 0.2 + projectQuality.score * 0.1);

    // Keep response compatible with both current and older frontend fields.
    res.json({
      studentId,
      role: targetRole,
      score: finalScore,
      smartScore,
      targetRole,
      resumeScore: finalScore,
      scoreBreakdown: {
        skillScore,
        projectScore,
        resumeProjectSectionScore,
        totalProjects,
        matchedProjects,
        matchedProjectSectionSkills,
        weights: { skills: 0.75, graphProjects: 0.15, resumeProjects: 0.1 }
      },
      sectionAnalysis: {
        experience: {
          found: sectionAnalysis.experience.found,
          confidence: sectionAnalysis.experience.confidence
        },
        projects: {
          found: sectionAnalysis.projects.found,
          confidence: sectionAnalysis.projects.confidence
        },
        skills: {
          found: sectionAnalysis.skills.found,
          confidence: sectionAnalysis.skills.confidence
        },
        education: {
          found: sectionAnalysis.education.found,
          confidence: sectionAnalysis.education.confidence
        }
      },
      atsChecks,
      projectQuality,
      matchedSkills,
      missingSkills
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  } finally {
    await session.close();
  }
}

function extractProjectSectionSkills(resumeText) {
  if (!resumeText) return [];

  const normalizedText = resumeText.replace(/\r/g, "");
  const lower = normalizedText.toLowerCase();

  const projectHeadingMatch = lower.match(/\b(projects?|academic projects?)\b/);
  if (!projectHeadingMatch) return [];

  const start = projectHeadingMatch.index;
  const afterProjects = normalizedText.slice(start);

  const nextHeadingRegex =
    /\n\s*(experience|education|skills|certifications|achievements|internships|summary|objective|publications)\s*\n/i;
  const nextHeadingMatch = afterProjects.match(nextHeadingRegex);

  const projectSection = nextHeadingMatch
    ? afterProjects.slice(0, nextHeadingMatch.index)
    : afterProjects;

  return extractSkillsFromResume(projectSection);
}

async function extractTextFromUploadedResume(file) {
  if (!file || !file.buffer) return "";

  const fileExt = path.extname(file.originalname || "").toLowerCase();
  const mime = (file.mimetype || "").toLowerCase();

  if (mime === "application/pdf" || fileExt === ".pdf") {
    const parsed = await pdfParse(file.buffer);
    return (parsed.text || "").trim();
  }

  if (
    mime ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    fileExt === ".docx"
  ) {
    const parsed = await mammoth.extractRawText({ buffer: file.buffer });
    return (parsed.value || "").trim();
  }

  if (mime.startsWith("text/") || fileExt === ".txt") {
    return file.buffer.toString("utf8").trim();
  }

  throw new Error("Unsupported resume format. Please upload PDF, DOCX, or TXT.");
}

app.post("/resume/analyze", upload.single("resumeFile"), analyzeResumeHandler);
app.post("/resume/analyze/:id", upload.single("resumeFile"), analyzeResumeHandler);
// ---------- Server ----------
app.listen(5000, () => {
  console.log("Backend running on http://localhost:5000");
});

