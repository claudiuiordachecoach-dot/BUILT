import WorkoutSession from "./WorkoutSession";

export const dynamic = "force-dynamic";

export default async function FortaPage({
  searchParams,
}: {
  searchParams: Promise<{ day?: string }>;
}) {
  const { day } = await searchParams;
  return (
    <div className="p-5 md:p-8 max-w-3xl">
      <WorkoutSession initialDay={day} />
    </div>
  );
}
