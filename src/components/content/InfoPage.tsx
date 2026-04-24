import type { Messages } from "@/i18n/get-dictionary";

type Props = {
  title: string;
  body: string[];
  dict: Messages;
};

export function InfoPage({ title, body, dict }: Props) {
  return (
    <section style={{ maxWidth: 900 }}>
      <h1 style={{ marginTop: 0 }}>{title}</h1>
      <div style={{ display: "grid", gap: 12 }}>
        {body.map((line, idx) => (
          <p key={idx} style={{ margin: 0, lineHeight: 1.65 }}>
            {line}
          </p>
        ))}
      </div>
      <p style={{ marginTop: 20 }}>{dict.info.sourceNotice}</p>
    </section>
  );
}
