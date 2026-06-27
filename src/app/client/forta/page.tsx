import WorkoutSession from "./WorkoutSession";

export const dynamic = "force-dynamic";

export default function FortaPage() {
  return (
    <div className="p-5 md:p-8 max-w-3xl">
      <WorkoutSession />
    </div>
  );
}
