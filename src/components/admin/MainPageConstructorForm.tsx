"use client";

import { useMemo, useState } from "react";
import { FileUploader } from "react-drag-drop-files";
import { AdminButton } from "@/components/admin/AdminButtons";
import { HomeHeroImageEditor } from "@/components/admin/HomeHeroImageEditor";

type BuilderElement = {
  id: string;
  type: "text" | "image" | "icon";
  x: number;
  y: number;
  width: number;
  height: number;
  content: string;
  href: string;
  imageUrl: string;
  icon: string;
  color: string;
  background: string;
  fontSize: number;
  fontWeight: number;
};

const CANVAS_W = 100;

function iconFromName(name: string) {
  if (name === "truck") return "🚚";
  if (name === "gift") return "🎁";
  if (name === "credit-card") return "💳";
  if (name === "phone") return "📞";
  return "⭐";
}

export function MainPageConstructorForm({
  locale,
  action,
  existing,
  labels,
}: {
  locale: string;
  action: (formData: FormData) => void | Promise<void>;
  existing: {
    heroImageUrl: string;
    introTitle: string;
    introBody: string;
    canvasHeight: number;
    elements: BuilderElement[];
  };
  labels: Record<string, string>;
}) {
  const [canvasHeight, setCanvasHeight] = useState(existing.canvasHeight || 1200);
  const [elements, setElements] = useState<BuilderElement[]>(existing.elements);
  const [selectedId, setSelectedId] = useState<string | null>(existing.elements[0]?.id ?? null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const serializedBuilder = useMemo(
    () => JSON.stringify({ canvasHeight, elements }),
    [canvasHeight, elements],
  );

  const selected = elements.find((item) => item.id === selectedId) ?? null;

  function updateElement(id: string, patch: Partial<BuilderElement>) {
    setElements((prev) => prev.map((item) => (item.id === id ? { ...item, ...patch } : item)));
  }

  function addElement(type: BuilderElement["type"]) {
    const id = `el-${Date.now()}-${Math.random().toString(16).slice(2, 7)}`;
    const next: BuilderElement = {
      id,
      type,
      x: 8,
      y: 10 + elements.length * 5,
      width: type === "text" ? 35 : 22,
      height: type === "text" ? 12 : 16,
      content: type === "text" ? "New text" : type === "icon" ? "Info block" : "",
      href: "",
      imageUrl: "",
      icon: "star",
      color: "#ffffff",
      background: "rgba(0,0,0,0.32)",
      fontSize: 18,
      fontWeight: 600,
    };
    setElements((prev) => [...prev, next]);
    setSelectedId(id);
  }

  function removeElement(id: string) {
    setElements((prev) => prev.filter((item) => item.id !== id));
    if (selectedId === id) setSelectedId(null);
  }

  function startDragElement(event: React.MouseEvent, id: string) {
    event.preventDefault();
    const startX = event.clientX;
    const startY = event.clientY;
    const start = elements.find((item) => item.id === id);
    if (!start) return;
    function onMove(moveEvent: MouseEvent) {
      const dx = ((moveEvent.clientX - startX) / 900) * 100;
      const dy = ((moveEvent.clientY - startY) / 900) * 100;
      updateElement(id, {
        x: Math.max(0, Math.min(CANVAS_W - start.width, start.x + dx)),
        y: Math.max(0, Math.min(100, start.y + dy)),
      });
    }
    function onUp() {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  function startResizeElement(event: React.MouseEvent, id: string) {
    event.preventDefault();
    event.stopPropagation();
    const startX = event.clientX;
    const startY = event.clientY;
    const start = elements.find((item) => item.id === id);
    if (!start) return;
    function onMove(moveEvent: MouseEvent) {
      const dx = ((moveEvent.clientX - startX) / 900) * 100;
      const dy = ((moveEvent.clientY - startY) / 900) * 100;
      updateElement(id, {
        width: Math.max(6, Math.min(100 - start.x, start.width + dx)),
        height: Math.max(6, Math.min(100 - start.y, start.height + dy)),
      });
    }
    function onUp() {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  async function handleImageFileSelected(file: File, elementId: string) {
    const dataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result ?? ""));
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });
    updateElement(elementId, { imageUrl: dataUrl });
  }

  return (
    <form action={action} style={{ display: "grid", gap: 16 }}>
      <input type="hidden" name="locale" value={locale} />
      <input type="hidden" name="home_builder_json" value={serializedBuilder} />
      <input type="hidden" name="home_intro_title" value={existing.introTitle} />
      <input type="hidden" name="home_intro_body" value={existing.introBody} />
      <input type="hidden" name="home_intro_layout_json" value="{}" />

      <div
        style={{
          position: "fixed",
          left: 14,
          top: "50%",
          transform: "translateY(-50%)",
          zIndex: 30,
          display: "grid",
          gap: 10,
          background: "linear-gradient(180deg, rgba(255,255,255,0.97), rgba(250,242,233,0.97))",
          border: "1px solid #d6c7b8",
          borderRadius: 14,
          padding: 12,
          boxShadow: "0 16px 36px rgba(33, 25, 18, 0.14)",
          minWidth: 210,
          backdropFilter: "blur(4px)",
        }}
      >
        <div style={{ fontSize: "0.76rem", textTransform: "uppercase", letterSpacing: "0.08em", color: "#7a6a5c", fontWeight: 700 }}>
          Constructor Tools
        </div>
        <button
          type="button"
          onClick={() => addElement("text")}
          style={{ borderRadius: 999, border: "1px solid #bca996", padding: "9px 12px", background: "#fff", fontWeight: 600 }}
        >
          {labels.addText}
        </button>
        <button
          type="button"
          onClick={() => addElement("image")}
          style={{ borderRadius: 999, border: "1px solid #bca996", padding: "9px 12px", background: "#fff", fontWeight: 600 }}
        >
          {labels.addImageBlock}
        </button>
        <button
          type="button"
          onClick={() => addElement("icon")}
          style={{ borderRadius: 999, border: "1px solid #bca996", padding: "9px 12px", background: "#fff", fontWeight: 600 }}
        >
          {labels.addIconBlock}
        </button>
        <button
          type="button"
          onClick={() => setPreviewOpen(true)}
          style={{ borderRadius: 999, border: "1px solid #2f261f", padding: "10px 12px", background: "#1f1a17", color: "#fff", fontWeight: 700 }}
        >
          {labels.openPreview}
        </button>
      </div>

      <HomeHeroImageEditor
        existingUrl={existing.heroImageUrl}
        labels={{
          title: labels.homeHero,
          urlPlaceholder: labels.homeHeroUrl,
          sizeHint: labels.homeHeroSizeHint,
          cropApply: labels.cropApply,
          previewTitle: labels.imagePreview,
        }}
      />

      <div
        style={{
          display: "grid",
          gap: 10,
          gridTemplateColumns: "1fr 340px",
          alignItems: "start",
        }}
      >
        <div style={{ border: "1px solid #cbbeb0", borderRadius: 12, padding: 10, background: "#fff" }}>
          <div style={{ borderBottom: "1px solid #ece4da", paddingBottom: 8, marginBottom: 8 }}>{labels.previewTitle}</div>
          <div style={{ border: "1px solid #ddd", borderRadius: 10, overflow: "hidden" }}>
            <div style={{ background: "#131313", color: "#fff", padding: "8px 12px" }}>Header</div>
            <div style={{ position: "relative", height: canvasHeight, background: "#f7f2ec" }}>
              {existing.heroImageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={existing.heroImageUrl}
                  alt="Hero"
                  style={{ width: "100%", height: 340, objectFit: "cover", display: "block" }}
                />
              ) : (
                <div
                  style={{
                    width: "100%",
                    height: 340,
                    display: "grid",
                    placeItems: "center",
                    background: "#e8ddd1",
                    color: "#6b5b4d",
                    fontSize: "0.95rem",
                  }}
                >
                  Hero image is not set yet
                </div>
              )}
              {elements.map((item) => (
                <div
                  key={item.id}
                  onMouseDown={(event) => startDragElement(event, item.id)}
                  onClick={() => setSelectedId(item.id)}
                  style={{
                    position: "absolute",
                    left: `${item.x}%`,
                    top: `${item.y}%`,
                    width: `${item.width}%`,
                    minHeight: `${item.height}%`,
                    border: selectedId === item.id ? "2px solid #7e6654" : "1px dashed #b79f8b",
                    borderRadius: 10,
                    background: item.background || "rgba(0,0,0,0.2)",
                    color: item.color || "#fff",
                    padding: 8,
                    cursor: "move",
                    overflow: "hidden",
                  }}
                >
                  {item.type === "image" ? (
                    item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <div style={{ fontSize: "0.85rem", opacity: 0.85 }}>
                        Image URL is empty
                      </div>
                    )
                  ) : item.type === "icon" ? (
                    <div style={{ display: "grid", gap: 6 }}>
                      <div style={{ fontSize: item.fontSize + 8 }}>{iconFromName(item.icon)}</div>
                      <div style={{ fontSize: item.fontSize, fontWeight: item.fontWeight }}>{item.content}</div>
                    </div>
                  ) : (
                    <div style={{ fontSize: item.fontSize, fontWeight: item.fontWeight }}>{item.content}</div>
                  )}
                  <button
                    type="button"
                    onMouseDown={(event) => startResizeElement(event, item.id)}
                    style={{
                      position: "absolute",
                      right: 4,
                      bottom: 4,
                      width: 14,
                      height: 14,
                      borderRadius: 4,
                      border: "1px solid #8f7762",
                      background: "#fff",
                      cursor: "nwse-resize",
                    }}
                    aria-label="Resize block with mouse"
                  />
                </div>
              ))}
            </div>
            <div style={{ background: "#1f1f1f", color: "#fff", padding: "8px 12px" }}>Footer</div>
          </div>
        </div>

        <div
          style={{
            border: "1px solid #cbbeb0",
            borderRadius: 12,
            padding: 12,
            display: "grid",
            gap: 10,
            background: "linear-gradient(180deg, #fff, #fbf7f2)",
            alignSelf: "start",
            height: "fit-content",
          }}
        >
          <label>{labels.previewHeight}</label>
          <input
            type="number"
            min={700}
            max={5000}
            value={canvasHeight}
            onChange={(e) => setCanvasHeight(Number(e.target.value || 1200))}
          />
          {selected ? (
            <>
              <strong>{labels.selectedElement}</strong>
              <label>{labels.content}</label>
              <input value={selected.content} onChange={(e) => updateElement(selected.id, { content: e.target.value })} />
              <label>Link URL</label>
              <input value={selected.href} onChange={(e) => updateElement(selected.id, { href: e.target.value })} />
              {selected.type === "image" ? (
                <>
                  <label>{labels.imageUrl}</label>
                  <input value={selected.imageUrl} onChange={(e) => updateElement(selected.id, { imageUrl: e.target.value })} />
                  <FileUploader
                    handleChange={(file: File) => {
                      void handleImageFileSelected(file, selected.id);
                    }}
                    name="constructor-image-file"
                    types={["JPG", "JPEG", "PNG", "WEBP"]}
                    multiple={false}
                  >
                    <div
                      style={{
                        border: "1px dashed #bca996",
                        borderRadius: 10,
                        padding: "10px 12px",
                        fontSize: "0.88rem",
                        background: "#fffaf5",
                        color: "#6b5b4d",
                        cursor: "pointer",
                      }}
                    >
                      Drag image file here or click to upload
                    </div>
                  </FileUploader>
                  <div
                    style={{
                      border: "1px solid #d7c9bc",
                      borderRadius: 10,
                      minHeight: 120,
                      overflow: "hidden",
                      background: "#efe4d9",
                    }}
                  >
                    {selected.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={selected.imageUrl}
                        alt="Selected element preview"
                        style={{ width: "100%", height: 140, objectFit: "cover" }}
                      />
                    ) : (
                      <div style={{ height: 120, display: "grid", placeItems: "center", color: "#6b5b4d" }}>
                        No image preview yet
                      </div>
                    )}
                  </div>
                </>
              ) : null}
              {selected.type === "icon" ? (
                <>
                  <label>{labels.icon}</label>
                  <select value={selected.icon} onChange={(e) => updateElement(selected.id, { icon: e.target.value })}>
                    <option value="star">Star</option>
                    <option value="truck">Truck</option>
                    <option value="gift">Gift</option>
                    <option value="credit-card">Card</option>
                    <option value="phone">Phone</option>
                  </select>
                </>
              ) : null}
              <label>Horizontal position (percent)</label>
              <input type="number" value={Math.round(selected.x)} onChange={(e) => updateElement(selected.id, { x: Number(e.target.value || 0) })} />
              <label>Vertical position (percent)</label>
              <input type="number" value={Math.round(selected.y)} onChange={(e) => updateElement(selected.id, { y: Number(e.target.value || 0) })} />
              <label>Block width (percent)</label>
              <input type="number" value={Math.round(selected.width)} onChange={(e) => updateElement(selected.id, { width: Number(e.target.value || 20) })} />
              <label>Block height (percent)</label>
              <input type="number" value={Math.round(selected.height)} onChange={(e) => updateElement(selected.id, { height: Number(e.target.value || 12) })} />
              <label>{labels.fontSize}</label>
              <input type="number" value={selected.fontSize} onChange={(e) => updateElement(selected.id, { fontSize: Number(e.target.value || 18) })} />
              <label>{labels.fontWeight}</label>
              <select
                value={String(selected.fontWeight)}
                onChange={(e) => updateElement(selected.id, { fontWeight: Number(e.target.value) })}
              >
                <option value="300" style={{ fontWeight: 300 }}>Light 300</option>
                <option value="400" style={{ fontWeight: 400 }}>Regular 400</option>
                <option value="500" style={{ fontWeight: 500 }}>Medium 500</option>
                <option value="600" style={{ fontWeight: 600 }}>Semi-bold 600</option>
                <option value="700" style={{ fontWeight: 700 }}>Bold 700</option>
                <option value="800" style={{ fontWeight: 800 }}>Extra-bold 800</option>
              </select>
              <label>{labels.textColor}</label>
              <div style={{ display: "grid", gridTemplateColumns: "42px 1fr", gap: 8 }}>
                <input
                  type="color"
                  value={selected.color}
                  onChange={(e) => updateElement(selected.id, { color: e.target.value })}
                  style={{ width: 42, height: 38, padding: 2 }}
                />
                <input value={selected.color} onChange={(e) => updateElement(selected.id, { color: e.target.value })} />
              </div>
              <label>{labels.background}</label>
              <div style={{ display: "grid", gridTemplateColumns: "42px 1fr", gap: 8 }}>
                <input
                  type="color"
                  value={selected.background.startsWith("#") ? selected.background : "#333333"}
                  onChange={(e) => updateElement(selected.id, { background: e.target.value })}
                  style={{ width: 42, height: 38, padding: 2 }}
                />
                <input value={selected.background} onChange={(e) => updateElement(selected.id, { background: e.target.value })} />
              </div>
              <button type="button" onClick={() => removeElement(selected.id)}>{labels.removeSection}</button>
            </>
          ) : (
            <p style={{ margin: 0, color: "#64748b" }}>{labels.selectElement}</p>
          )}
        </div>
      </div>

      {previewOpen ? (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 2000, padding: 20 }}>
          <div style={{ background: "#fff", borderRadius: 12, height: "100%", overflow: "auto", padding: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <strong>{labels.previewTitle}</strong>
              <button type="button" onClick={() => setPreviewOpen(false)}>{labels.closePreview}</button>
            </div>
            <div style={{ marginTop: 10, border: "1px solid #ddd", borderRadius: 10, overflow: "hidden" }}>
              <div style={{ background: "#131313", color: "#fff", padding: "10px 12px" }}>Header</div>
              <div style={{ position: "relative", minHeight: canvasHeight, background: "#f7f2ec" }}>
                {existing.heroImageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={existing.heroImageUrl} alt="Hero" style={{ width: "100%", height: 340, objectFit: "cover" }} />
                ) : (
                  <div
                    style={{
                      width: "100%",
                      height: 340,
                      display: "grid",
                      placeItems: "center",
                      background: "#e8ddd1",
                      color: "#6b5b4d",
                    }}
                  >
                    Hero image is not set yet
                  </div>
                )}
                {elements.map((item) => (
                  <div key={item.id} style={{ position: "absolute", left: `${item.x}%`, top: `${item.y}%`, width: `${item.width}%`, minHeight: `${item.height}%`, padding: 8, background: item.background, color: item.color, borderRadius: 8 }}>
                    {item.type === "image" ? (
                      item.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      ) : (
                        <div style={{ fontSize: "0.85rem", opacity: 0.85 }}>
                          Image URL is empty
                        </div>
                      )
                    ) : item.type === "icon" ? (
                      <div>{iconFromName(item.icon)} {item.content}</div>
                    ) : (
                      <div style={{ fontSize: item.fontSize, fontWeight: item.fontWeight }}>{item.content}</div>
                    )}
                  </div>
                ))}
              </div>
              <div style={{ background: "#1f1f1f", color: "#fff", padding: "10px 12px" }}>Footer</div>
            </div>
          </div>
        </div>
      ) : null}

      <AdminButton type="submit">{labels.save}</AdminButton>
    </form>
  );
}
