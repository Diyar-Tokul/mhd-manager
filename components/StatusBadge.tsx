import { Status } from "@/lib/types";

export default function StatusBadge({ status }: { status: Status }) {
  return <span className={`status ${status}`}>{status}</span>;
}
