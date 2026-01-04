import React from 'react';
import {
  useTable,
  usePagination,
  useGlobalFilter,
} from 'react-table';

const DataTable = ({ columns, data }) => {
  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    page,
    prepareRow,
    canPreviousPage,
    canNextPage,
    pageOptions,
    nextPage,
    previousPage,
    gotoPage,
    setGlobalFilter,
    state: { pageIndex, globalFilter }
  } = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: 0 }
    },
    useGlobalFilter,
    usePagination
  );

  return (
    <div className="w-full overflow-x-auto bg-white shadow rounded-lg border-t-2 border-primary-600 p-4">
      <div className="mb-4 flex justify-between items-center">
        <input
          value={globalFilter || ''}
          onChange={(e) => setGlobalFilter(e.target.value)}
          placeholder="Search..."
          className="border px-3 py-2 rounded shadow-sm focus:outline-none focus:ring focus:border-blue-300"
        />
      </div>

      {data.length === 0 ? (
        <p className="text-center text-gray-500 py-4">No data available.</p>
      ) : (
        <table {...getTableProps()} className="min-w-full table-auto border rounded">
          <thead className="bg-gray-100 text-gray-600  sticky top-0">
            {headerGroups.map(headerGroup => (
              <tr {...headerGroup.getHeaderGroupProps()}>
                {headerGroup.headers.map(column => (
                  <th
                    {...column.getHeaderProps()}
                    className="p-3 bg-primary-600 text-white border text-left font-semibold"
                  >
                    {column.render('Header')}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody {...getTableBodyProps()} className="text-gray-700">
            {page.map(row => {
              prepareRow(row);
              return (
                <tr {...row.getRowProps()} className="hover:bg-gray-50 transition">
                  {row.cells.map(cell => (
                    <td {...cell.getCellProps()} className="p-3 border">
                      {cell.render('Cell')}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      )}

      {data.length > 0 && (
        <div className="pagination mt-4 flex items-center justify-between text-sm text-gray-600">
          <div className="flex gap-2">
            <button onClick={() => gotoPage(0)} disabled={!canPreviousPage} className="px-2 py-1 rounded border hover:bg-gray-100">{'<<'}</button>
            <button onClick={() => previousPage()} disabled={!canPreviousPage} className="px-2 py-1 rounded border hover:bg-gray-100">{'<'}</button>
            <button onClick={() => nextPage()} disabled={!canNextPage} className="px-2 py-1 rounded border hover:bg-gray-100">{'>'}</button>
            <button onClick={() => gotoPage(pageOptions.length - 1)} disabled={!canNextPage} className="px-2 py-1 rounded border hover:bg-gray-100">{'>>'}</button>
          </div>
          <span>
            Page <strong>{pageIndex + 1} of {pageOptions.length}</strong>
          </span>
        </div>
      )}
    </div>
  );
};

export default DataTable;
