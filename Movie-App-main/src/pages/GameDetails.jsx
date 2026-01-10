import { useParams } from "react-router-dom";

import Quiz from "./Quiz";
import CineQuest from "./CineQuest";
import CineMatch from "./CineMatch";
import NotFound from "./NotFound";

export default function GameDetails() {
  const { slug } = useParams();

  if (slug === "quiz") return <Quiz />;
  if (slug === "cine-match") return <CineMatch />;

  return <NotFound />;
}
