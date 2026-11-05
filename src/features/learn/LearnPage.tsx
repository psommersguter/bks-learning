import { useTranslation } from "react-i18next";
import { StudySession } from "./StudySession";
import { useStudyQueue } from "./useStudyQueue";

export function LearnPage() {
  const { t } = useTranslation();
  const queueState = useStudyQueue();

  switch (queueState.status) {
    case "loading":
      return <p>{t("common.loading")}</p>;
    case "error":
      return <p role="alert">{t("common.loadError")}</p>;
    case "ready":
      return <StudySession queue={queueState.queue} />;
  }
}
