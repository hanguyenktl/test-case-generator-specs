# Test Case Generator

This repository holds prototypes, specifications, and related logic for the **Test Case Generator** feature. 

It explores concepts around automated analysis of requirements, generating test cases via AI, and scoring and verifying them against predefined metrics.

## Repository Structure

- **`specs/`**
  Contains various markdown-based architectural specifications, analyzer pipelines, and design documents outlining how requirement-to-test-case conversions work.

- **Prototypes (`*.jsx` & `*.js`)**
  A collection of standalone React components and business logic files serving as interfaces and processing scripts:
  - `RequirementScoringVerifier_v2.jsx`
  - `TCDualScorer_v5.jsx`
  - `requirementScoringRules.js`

- **`CHANGELOG.md`**
  Tracks iterative updates, fixes, and improvements to the analyzer and scorer prototypes.
  
- **`LESSONS_LEARNED.md`**
  Documentary of the learnings achieved while developing and refining the test case generation models.

## Usage

This project acts as a functional sandbox for TestOps feature exploration. It currently holds raw React components and scripts rather than a fully bootstrapped web app. 
To run or preview any of the `jsx` setups, you can integrate them into an existing React playground or Vite bootstrap project.
