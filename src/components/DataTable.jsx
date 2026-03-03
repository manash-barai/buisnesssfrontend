import React, { useRef, useCallback, useMemo } from "react";
import { useTable, useGlobalFilter } from "react-table";

const DataTable = ({
  columns,
  data,
  currentPage,
  totalPages,
  onLoadMore,
  isLoading = false,
}) => {

  // ✅ Memoize columns & data (prevents full recalculation)
  const memoColumns = useMemo(() => columns, []);
  const memoData = useMemo(() => data, [data.length]);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    setGlobalFilter,
    state: { globalFilter },
  } = useTable(
    {
      columns: memoColumns,
      data: memoData,
      autoResetPage: false,   // 🔥 prevents reset on data append
    },
    useGlobalFilter
  );

  // ✅ Intersection Observer (optimized)
  const observer = useRef(null);

  const lastRowRef = useCallback(
    (node) => {
      if (isLoading || currentPage >= totalPages) return;

      if (observer.current) observer.current.disconnect();

      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting) {
            onLoadMore(currentPage + 1);
          }
        },
        {
          rootMargin: "200px", // 🔥 preload earlier (smooth)
        }
      );

      if (node) observer.current.observe(node);
    },
    [isLoading, currentPage, totalPages, onLoadMore]
  );

  return (
    <div className="w-full overflow-x-auto overflow-y-auto scroll-smooth bg-white shadow rounded-lg border-t-2 border-primary-600 p-4">

      {/* 🔍 Search */}
      <div className="mb-4 flex justify-between items-center">
        <input
          value={globalFilter || ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Search..."
          className="border px-3 py-2 rounded shadow-sm focus:outline-none focus:ring focus:border-blue-300"
        />
      </div>

      {memoData.length === 0 ? (
        <p className="text-center text-gray-500 py-4">
          No data available.
        </p>
      ) : (
        <table
          {...getTableProps()}
          className="min-w-full table-auto border rounded"
        >
          <thead className="bg-gray-100 text-gray-600 sticky top-0 z-10">
            {headerGroups.map((headerGroup) => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map((column) => (
                  <th
                    {...column.getHeaderProps()}
                    className="p-3 bg-primary-600 text-white border text-left font-semibold"
                  >
                    {column.render("Header")}
                  </th>
                ))}
              </tr>
            ))}
          </thead>

          <tbody
            {...getTableBodyProps()}
            className="text-gray-700"
          >
            {rows.map((row, index) => {
              prepareRow(row);

              const isLast = index === rows.length - 1;

              return (
                <tr
                  {...row.getRowProps()}
                  key={row.original?._id || row.id}  // ✅ stable key
                  ref={isLast ? lastRowRef : null}
                  className="hover:bg-gray-50 transition-colors duration-150"
                >
                  {row.cells.map((cell) => (
                    <td
                      {...cell.getCellProps()}
                      className="p-3 border"
                    >
                      {cell.render("Cell")}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {/* ✅ Fixed Loader Height (no layout jump) */}
      <div className="h-12 flex items-center justify-center">
        {isLoading && (
          <span className="text-gray-500">
            Loading more data...
          </span>
        )}
      </div>
    </div>
  );
};

export default React.memo(DataTable); // 🔥 prevents unnecessary re-render
