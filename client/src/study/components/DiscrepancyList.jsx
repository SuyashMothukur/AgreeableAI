export default function DiscrepancyList({ items }) {
  return (
    <ul className="study-disc-list">
      {items.map((d) => (
        <li key={d.id} className="study-disc-list__item">
          <h4 className="study-disc-list__title">{d.title}</h4>
          <p className="study-disc-list__body">{d.body}</p>
        </li>
      ))}
    </ul>
  );
}
