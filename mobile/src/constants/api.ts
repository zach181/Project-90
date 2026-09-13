// The Groups backend (see ../../../server). Powers accounts + group join codes
// so real people can see each other's streaks. Deployed on Render — free tier,
// so it spins down after ~15 min idle and takes 30-50s to wake back up on the
// next request. Storage is a plain JSON file with no persistent disk, so a
// redeploy or the occasional Render restart resets all accounts/groups.
export const API_BASE_URL = "https://project-90.onrender.com";
