// src/components/IdeasForm.tsx
"use client";

import { useIdeas } from "../../hooks/useIdea";
import { useAuth } from "../../hooks/useAuth";

export default function IdeasForm() {
  const { add } = useIdeas();
  const { current: user } = useAuth();

  const handleAddIdea = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.target as HTMLFormElement;
    const formData = new FormData(form);

    if (!user) return;

    const postIdeaData = {
      userId: user.$id,
      title: formData.get("title") as string,
      description: formData.get("description") as string,
    };

    await add(postIdeaData);
    form.reset();
  };

  if (!user) {
    return null; // Don't render form if user is not logged in
  }

  return (
    <div>
      <article className="container padding-0">
        <h4 className="heading-level-4">Submit Idea</h4>
        <form onSubmit={handleAddIdea} className="u-margin-block-start-16">
          <ul className="form-list">
            <li className="form-item">
              <label className="label">Title</label>
              <input type="text" placeholder="Title" name="title" required />
            </li>
            <li className="form-item">
              <label className="label">Description</label>
              <textarea placeholder="Description" name="description" rows={4} />
            </li>
          </ul>
          <ul className="buttons-list u-margin-block-start-16">
            <li className="buttons-list-item">
              <button type="submit" className="button" aria-label="Submit idea">
                Submit
              </button>
            </li>
          </ul>
        </form>
      </article>
    </div>
  );
}
