import getEvents from "@/constants/subgraph";
import { useQuery } from "@tanstack/react-query";

const useGetEvents = () => {
  return useQuery({
    queryKey: ["events"],
    queryFn: () => getEvents(),
  });
};

export default useGetEvents;
