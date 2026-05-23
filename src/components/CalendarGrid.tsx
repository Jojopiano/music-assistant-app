import { COLORS, type Schedule, type Student } from "../data";

interface CalendarGridProps {
  schedule: Schedule[];
  students: Student[];
  viewMode: "week" | "month";
  anchor: string;
  onDayClick: (date: string) => void;
  selectedDate: string;
}

const DAY_LABELS = ["一", "二", "三", "四", "五", "六", "日"];

function getWeekDates(anchor: string) {
  const d = new Date(anchor);
  const monday = new Date(d);
  monday.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const x = new Date(monday);
    x.setDate(monday.getDate() + i);
    return x.toISOString().slice(0, 10);
  });
}

function getMonthDates(anchor: string) {
  const [y, m] = anchor.slice(0, 7).split("-").map(Number);
  const dates: string[] = [];
  for (let d = new Date(y, m - 1, 1); d <= new Date(y, m, 0); d.setDate(d.getDate() + 1)) {
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}

export function CalendarGrid({
  schedule,
  students,
  viewMode,
  anchor,
  onDayClick,
  selectedDate,
}: CalendarGridProps) {
  const dates = viewMode === "week" ? getWeekDates(anchor) : getMonthDates(anchor);
  const byDate: Record<string, Schedule[]> = {};
  schedule.forEach((sc) => {
    (byDate[sc.date] = byDate[sc.date] || []).push(sc);
  });

  const today = new Date().toLocaleDateString('en-CA');

  if (viewMode === "week") {
    return (
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0,1fr))", gap: 4 }}>
        {DAY_LABELS.map((l) => (
          <div
            key={l}
            style={{
              fontSize: 10,
              color: "var(--color-text-secondary, #6b7280)",
              textAlign: "center",
              paddingBottom: 4,
            }}
          >
            {l}
          </div>
        ))}
        {dates.map((date) => {
          const lessons = byDate[date] || [];
          const isSel = date === selectedDate;
          const isTodayDate = date === today;
          return (
            <div
              key={date}
              onClick={() => onDayClick(date)}
              style={{
                borderRadius: 8,
                padding: "6px 4px",
                cursor: "pointer",
                minHeight: 64,
                background: isSel ? COLORS.purpleLight : "transparent",
                border: isSel
                  ? `1.5px solid ${COLORS.purple}55`
                  : "0.5px solid var(--color-border-tertiary, #e5e7eb)",
              }}
            >
              <div
                style={{
                  fontSize: 11,
                  fontWeight: isTodayDate ? 500 : 400,
                  color: isTodayDate ? COLORS.purple : "var(--color-text-secondary, #6b7280)",
                  textAlign: "center",
                  marginBottom: 4,
                }}
              >
                {Number(date.slice(8))}
              </div>
              {lessons.slice(0, 2).map((l) => {
                const st = students.find((s) => s.id === l.studentId);
                const bg =
                  l.status === "confirmed"
                    ? COLORS.tealLight
                    : l.status === "reschedule_requested"
                    ? COLORS.pinkLight
                    : COLORS.amberLight;
                const col =
                  l.status === "confirmed"
                    ? COLORS.tealDark
                    : l.status === "reschedule_requested"
                    ? "#72243E"
                    : COLORS.amberDark;
                return (
                  <div
                    key={l.id}
                    style={{
                      fontSize: 9,
                      background: bg,
                      color: col,
                      borderRadius: 4,
                      padding: "1px 4px",
                      marginBottom: 2,
                      overflow: "hidden",
                      whiteSpace: "nowrap",
                      textOverflow: "ellipsis",
                    }}
                  >
                    {l.time} {st?.avatar}
                  </div>
                );
              })}
              {lessons.length > 2 && (
                <div
                  style={{
                    fontSize: 9,
                    color: "var(--color-text-secondary, #6b7280)",
                    textAlign: "center",
                  }}
                >
                  +{lessons.length - 2}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // Month view
  const firstDow = (new Date(dates[0]).getDay() + 6) % 7;
  const cells = [...Array(firstDow).fill(null), ...dates];
  while (cells.length % 7 !== 0) cells.push(null);

  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(7, minmax(0,1fr))",
          gap: 2,
          marginBottom: 4,
        }}
      >
        {DAY_LABELS.map((l) => (
          <div
            key={l}
            style={{
              fontSize: 10,
              color: "var(--color-text-secondary, #6b7280)",
              textAlign: "center",
            }}
          >
            {l}
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0,1fr))", gap: 2 }}>
        {cells.map((date, i) => {
          if (!date) return <div key={`empty-${i}`} />;
          const lessons = byDate[date] || [];
          const isSel = date === selectedDate;
          const isTodayDate = date === today;
          return (
            <div
              key={date}
              onClick={() => onDayClick(date)}
              style={{
                borderRadius: 6,
                padding: "4px 3px",
                cursor: "pointer",
                minHeight: 46,
                background: isSel ? COLORS.purpleLight : "transparent",
                border: isSel
                  ? `1.5px solid ${COLORS.purple}55`
                  : "0.5px solid var(--color-border-tertiary, #e5e7eb)",
              }}
            >
              <div
                style={{
                  fontSize: 10,
                  fontWeight: isTodayDate ? 500 : 400,
                  color: isTodayDate ? COLORS.purple : "var(--color-text-secondary, #6b7280)",
                  textAlign: "center",
                  marginBottom: 2,
                }}
              >
                {Number(date.slice(8))}
              </div>
              {lessons.length > 0 && (
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 2,
                    justifyContent: "center",
                  }}
                >
                  {lessons.slice(0, 3).map((l) => (
                    <div
                      key={l.id}
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: "50%",
                        background:
                          l.status === "confirmed"
                            ? COLORS.teal
                            : l.status === "reschedule_requested"
                            ? COLORS.pink
                            : COLORS.amber,
                      }}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
