// The Groups backend (see ../../../server). Powers accounts + group join codes
// so real people can see each other's streaks.
// Simulator / web: localhost is fine.
// Physical device or a friend on another network: deploy the server (e.g. to
// Render, like Forge's backend) and point this at that public URL instead.
export const API_BASE_URL = "http://localhost:3001";
