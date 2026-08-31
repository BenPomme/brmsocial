export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  const { printBootChecklist } = await import("@/lib/boot");
  printBootChecklist();
}
