import React from "react";
import { toast } from "sonner";
import { JSONTree } from "react-json-tree";
import { jsontheme } from "@/lib/constants";
import { useTheme } from "next-themes";

export const RenderSpanAttributeValue = ({
  value,
  data,
}: {
  value: string;
  data: any;
}) => {
  const { theme } = useTheme();

  // Check if the data is valid JSON
  const isJson = typeof data === "object" && data !== null;

  return (
    <div
      onClick={() => {
        navigator.clipboard.writeText(value);
        toast.success("Copied to clipboard");
      }}
      className="text-xs select-all"
    >
      {isJson ? (
        <div className="overflow-x-auto max-w-full">
          <JSONTree
            data={data}
            theme={jsontheme}
            invertTheme={theme === "light"}
            shouldExpandNodeInitially={() => true}
            labelRenderer={([key]) => <strong>{key}</strong>}
            valueRenderer={(raw: any) => (
              <span style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
                {raw}
              </span>
            )}
            postprocessValue={(raw: any) => {
              if (typeof raw === "string") {
                try {
                  return JSON.parse(raw);
                } catch (e) {
                  return raw;
                }
              }
              return raw;
            }}
          />
        </div>
      ) : (
        // Render plain text if the value is not JSON
        <div className="whitespace-pre-wrap break-words">
          {value.split("\n").map((line, index) => (
            <React.Fragment key={index}>
              {line}
              <br />
            </React.Fragment>
          ))}
        </div>
      )}
    </div>
  );
};
