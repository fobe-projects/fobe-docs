import React from "react";

import ExternalLinkIcon from "../../static/assets/icons/external-link.svg";
import styles from "./AppMetadata.module.css";

export const AppMetadata = ({ minDocVersion, roadmapUrl, githubUrl }) => {
  return (
    <div className={styles.root}>
      <span>
        Docs version required: <strong>{minDocVersion}</strong>
      </span>
      {roadmapUrl && (
        <span>
          Roadmap:{" "}
          <a href={roadmapUrl}>
            GitHub <ExternalLinkIcon />
          </a>
        </span>
      )}
      {githubUrl && (
        <span>
          Repository:{" "}
          <a href={githubUrl}>
            GitHub <ExternalLinkIcon />
          </a>
        </span>
      )}
    </div>
  );
};
