import getEvents from "@/constants/subgraph";
import { useQuery } from "@tanstack/react-query";
import { StyleSheet } from "react-native";

const useGetEvents = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["events"],
    queryFn: () => getEvents(),
  });

  return { data, isLoading, error };
};

export default useGetEvents;

const styles = StyleSheet.create({});
