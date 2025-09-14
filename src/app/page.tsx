import IdeasForm from "@/components/IdeasForm";
import IdeasList from "@/components/IdeasList";

export default function Home() {
  return (
    <main className="u-padding-16">
      <div className="container">
        <h1 className="heading-level-1">Ideas Tracker</h1>
        <p className="u-margin-block-start-16">
          Track all your side project ideas in one place.
        </p>
      </div>
      <IdeasForm />
      <IdeasList />
    </main>
  );
}
