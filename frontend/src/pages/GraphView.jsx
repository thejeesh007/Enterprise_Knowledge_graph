import React, { useEffect, useState } from "react";
import ForceGraph2D from "react-force-graph-2d";
import api from "../services/api";
import { useTheme } from "../context/ThemeContext";

function GraphView() {
  const { isDark } = useTheme();
  const [graphData, setGraphData] = useState({ nodes: [], links: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/graph")
      .then(res => {
        console.log("GRAPH DATA:", res.data);
        setGraphData(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Graph load failed:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div style={{ padding: 40, color: "var(--text-muted)" }}>Loading graph...</div>;
  }

  if (!graphData.nodes.length) {
    return <div style={{ padding: 40, color: "var(--text-muted)" }}>No graph data available</div>;
  }

  return (
    <div
      style={{
        width: "100%",
        height: "90vh",
        padding: "16px 18px",
        background: "var(--bg-main)"
      }}
    >
      <div
        style={{
          border: "1px solid var(--border-color)",
          borderRadius: "14px",
          overflow: "hidden",
          height: "100%",
          background: "var(--card-bg)"
        }}
      >
      <ForceGraph2D
        graphData={graphData}
        nodeLabel={node =>
          `${node.label}\n${node.name || node.title || ""}`
        }
        nodeAutoColorBy="label"
        linkLabel={link => link.type}
        linkDirectionalArrowLength={6}
        linkDirectionalArrowRelPos={1}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const label = node.name || node.title || node.label;
          const fontSize = 12 / globalScale;

          ctx.font = `${fontSize}px Sans-Serif`;
          ctx.fillStyle = isDark ? "#e5e7eb" : "#111827";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(label, node.x, node.y);
        }}
      />
      </div>
    </div>
  );
}

export default GraphView;
