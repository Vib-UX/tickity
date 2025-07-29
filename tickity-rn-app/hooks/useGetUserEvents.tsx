import getEvents from "@/constants/subgraph";
import { useQuery } from "@tanstack/react-query";

const useGetEvents = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["events"],
    queryFn: async () => {
      const events = await getEvents();
      return events;
    },
  });

  return { data, isLoading, error };
};

export default useGetEvents;
