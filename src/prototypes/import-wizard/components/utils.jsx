import React from "react";
import { T, F } from "../../../utils/design-system";

export const selectStyle = {
  width: "100%", height: 32, padding: "0 10px",
  fontSize: 12, fontWeight: 400, fontFamily: F.fontFamily,
  color: T.t2, background: T.card,
  border: `1px solid ${T.bd}`, borderRadius: 6, outline: "none",
  appearance: "auto",
};

export const Field = ({ label, children }) => (
  <div>
    <label style={{ fontSize: 11, color: T.t3, fontWeight: 500, textTransform: "uppercase", letterSpacing: 0.3, marginBottom: 6, display: "block" }}>
      {label}
    </label>
    {children}
  </div>
);
