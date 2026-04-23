/** Five-minute scenario session */
export const STUDY_DURATION_MS = 2 * 60 * 1000;

/** Brief overlay before analysis */
export const POST_TIMER_TRANSITION_MS = 2400;

export const STUDY_PHASE = {
  START: "start",
  LOADING_SCENARIO: "loading_scenario",
  CHAT: "chat",
  POST_TIMER: "post_timer",
  ANALYSIS: "analysis",
  END_SURVEY: "end_survey",
  SUBMITTED: "submitted",
};
