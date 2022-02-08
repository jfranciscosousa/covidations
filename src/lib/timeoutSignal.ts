export default function timeoutSignal(timeoutInMs: number): AbortSignal {
  const controller = new AbortController();

  setTimeout(() => controller.abort(), timeoutInMs);

  return controller.signal;
}
