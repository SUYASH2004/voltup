"use client";

import React from "react";

export default function MetricCard({ icon, title, value, subtitle, trend }) {
  return React.createElement(
    "div",
    {
      className:
        "group p-5 bg-white border rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300",
    },
    [
      // ICON + TITLE
      React.createElement(
        "div",
        { key: "top", className: "flex items-center gap-4" },
        [
          React.createElement(
            "div",
            {
              key: "iconBox",
              className:
                "h-12 w-12 flex items-center justify-center rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 group-hover:from-emerald-200 group-hover:to-emerald-100 transition-all",
            },
            React.createElement(
              "div",
              {
                className: "text-emerald-700 w-7 h-7",
              },
              icon
            )
          ),

          React.createElement(
            "div",
            { key: "titleBox" },
            React.createElement(
              "h3",
              {
                className:
                  "text-sm font-medium text-gray-600 tracking-wide uppercase",
              },
              title
            )
          ),
        ]
      ),

      // VALUE
      React.createElement(
        "p",
        {
          key: "value",
          className:
            "text-4xl font-bold mt-4 text-gray-900 tracking-tight",
        },
        value
      ),

      // SUBTITLE + TREND
      React.createElement(
        "div",
        {
          key: "subtitleTrend",
          className: "mt-1 flex items-center gap-2",
        },
        [
          React.createElement(
            "p",
            { key: "subtitle", className: "text-sm text-gray-500" },
            subtitle
          ),

          trend
            ? React.createElement(
                "span",
                {
                  key: "trend",
                  className:
                    "text-xs font-semibold px-2 py-0.5 rounded-md " +
                    (trend.includes("+")
                      ? "text-green-700 bg-green-100"
                      : "text-red-700 bg-red-100"),
                },
                trend
              )
            : null,
        ]
      ),
    ]
  );
}
