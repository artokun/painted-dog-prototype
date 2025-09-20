import { folder, useControls } from "leva";

export function useGridOverrideControls() {
  return useControls(
    "UI",
    {
      grid: folder(
        {
          gridItemWidth: {
            value: 0.24,
            min: 0,
            max: 1,
            step: 0.01,
            label: "Grid Item Width",
          },
          gridItemHeight: {
            value: 0.24,
            min: 0,
            max: 1,
            step: 0.01,
            label: "Grid Item Height",
          },
          columnSpacing: {
            value: 0.0,
            min: 0,
            max: 1,
            step: 0.01,
            label: "Column Spacing",
          },
          rowSpacing: {
            value: 0.03,
            min: 0,
            max: 1,
            step: 0.01,
            label: "Row Spacing",
          },
          yOffset: {
            value: 0,
            min: -1,
            max: 1,
            step: 0.01,
            label: "Y Offset",
          },
          zOffset: {
            value: 0,
            min: -1,
            max: 1,
            step: 0.01,
            label: "Z Offset",
          },
          columns: {
            value: 4,
            min: 1,
            max: 10,
            step: 1,
            label: "Columns",
          },
        },
        {
          collapsed: true,
        }
      ),
    },
    { collapsed: true }
  );
}
