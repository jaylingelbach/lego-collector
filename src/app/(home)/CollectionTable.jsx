'use client';

import { useState } from 'react';
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table';
import { ArrowUpDown, ChevronDown } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';

const data = [
  {
    set_num: '75334-1',
    name: 'Obi-Wan Kenobi vs. Darth Vader',
    year: 2022,
    theme_id: 158,
    num_parts: 408,
    set_img_url: 'https://cdn.rebrickable.com/media/sets/75334-1/103527.jpg',
    set_url:
      'https://rebrickable.com/sets/75334-1/obi-wan-kenobi-vs-darth-vader/',
    last_modified_dt: '2022-06-09T04:32:59.646728Z'
  },
  {
    set_num: '75335-1',
    name: 'BD-1',
    year: 2022,
    theme_id: 158,
    num_parts: 1062,
    set_img_url: 'https://cdn.rebrickable.com/media/sets/75335-1/103101.jpg',
    set_url: 'https://rebrickable.com/sets/75335-1/bd-1/',
    last_modified_dt: '2022-05-25T08:11:08.477556Z'
  },
  {
    set_num: '75336-1',
    name: 'Inquisitor Transport Scythe',
    year: 2022,
    theme_id: 158,
    num_parts: 924,
    set_img_url: 'https://cdn.rebrickable.com/media/sets/75336-1/103043.jpg',
    set_url:
      'https://rebrickable.com/sets/75336-1/inquisitor-transport-scythe/',
    last_modified_dt: '2022-05-26T08:43:31.200857Z'
  },
  {
    set_num: '75337-1',
    name: 'AT-TE Walker',
    year: 2022,
    theme_id: 158,
    num_parts: 1082,
    set_img_url: 'https://cdn.rebrickable.com/media/sets/75337-1/103975.jpg',
    set_url: 'https://rebrickable.com/sets/75337-1/at-te-walker/',
    last_modified_dt: '2022-06-18T18:24:25.235143Z'
  },
  {
    set_num: '75356-1',
    name: 'Executor Super Star Destroyer',
    year: 2023,
    theme_id: 158,
    num_parts: 630,
    set_img_url: 'https://cdn.rebrickable.com/media/sets/75356-1/129771.jpg',
    set_url:
      'https://rebrickable.com/sets/75356-1/executor-super-star-destroyer/',
    last_modified_dt: '2023-03-01T06:53:53.808642Z'
  }
];

export function CollectionTable() {
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState({});
  const [filterColumn, setFilterColumn] = useState('name');
  const [filterValue, setFilterValue] = useState('');

  const onFilterChange = (event) => {
    const value = event.target.value;
    setFilterValue(value);
    table.getColumn(filterColumn)?.setFilterValue(value);
  };

  const table = useReactTable({
    data,
    columns: [
      {
        id: 'select',
        header: ({ table }) => (
          <Checkbox
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && 'indeterminate')
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
          />
        ),
        enableSorting: false,
        enableHiding: false
      },
      {
        accessorKey: 'set_num',
        header: 'Set Number',
        cell: ({ row }) => <div>{row.getValue('set_num')}</div>
      },
      {
        accessorKey: 'name',
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
          >
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => <div>{row.getValue('name')}</div>
      },
      {
        accessorKey: 'set_img_url',
        header: 'Image',
        cell: ({ row }) => (
          <a
            href={row.getValue('set_url')}
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src={row.getValue('set_img_url')}
              alt="LEGO set"
              className="w-20 h-auto rounded"
            />
          </a>
        )
      },
      {
        accessorKey: 'year',
        header: 'Year',
        cell: ({ row }) => <div>{row.getValue('year')}</div>
      },
      {
        accessorKey: 'num_parts',
        header: 'Piece Count',
        cell: ({ row }) => (
          <div className="text-center">{row.getValue('num_parts')}</div>
        )
      },
      {
        accessorKey: 'set_url',
        header: 'Link',
        cell: ({ row }) => (
          <a
            href={row.getValue('set_url')}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline"
          >
            View Set
          </a>
        )
      }
    ],
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection
    }
  });

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <div className="flex gap-4 items-center">
          {/* Dropdown to select filter column */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                {filterColumn === 'name'
                  ? 'Filter by Name'
                  : 'Filter by Number'}
                <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setFilterColumn('name')}>
                Filter by Name
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterColumn('set_num')}>
                Filter by Number
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Input field for filtering */}
          <Input
            placeholder={`Filter sets by ${
              filterColumn === 'name' ? 'name' : 'number'
            }...`}
            value={filterValue}
            onChange={onFilterChange}
            className="max-w-sm"
          />
        </div>
        {/* Dropdown menu to select columns to be shown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Columns <ChevronDown />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => (
                <DropdownMenuCheckboxItem
                  key={column.id}
                  className="capitalize"
                  checked={column.getIsVisible()}
                  onCheckedChange={(value) => column.toggleVisibility(!!value)}
                >
                  {column.id}
                </DropdownMenuCheckboxItem>
              ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
