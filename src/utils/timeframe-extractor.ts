export function createTimeFrameExtractor(selectedTimeFrame: string | null) {
  return (sectionKey: string) => {
    return selectedTimeFrame
      ?.split(",")
      .find((value) => value.includes(sectionKey));
  };
}
