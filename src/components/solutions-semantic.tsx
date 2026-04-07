import { DIGITAL_PRESENT_PROJECTS } from "@/data/digital-present-projects";

/**
 * Machine- and assistive-friendly featured work (complements JSON-LD ItemList #featured-projects).
 */
export function SolutionsSemantic() {
  return (
    <section
      aria-label="Digital solutions and GTM systems — featured client work"
      className="sr-only"
    >
      <h2>Digital Solutions &amp; GTM Systems</h2>
      <ol>
        {DIGITAL_PRESENT_PROJECTS.map((s) => (
          <li key={s.id}>
            <article itemScope itemType="https://schema.org/CreativeWork">
              <h3 itemProp="name">
                {s.clientCode}: {s.title}
              </h3>
              <p itemProp="description">{s.description}</p>
              <p itemProp="abstract">{s.imageAlt}</p>
              <p itemProp="disambiguatingDescription">{s.description}</p>
            </article>
          </li>
        ))}
      </ol>
    </section>
  );
}
