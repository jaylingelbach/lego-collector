'use client';

import { useMemo, useState } from 'react';
import { useMutation } from 'convex/react';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable
} from '@tanstack/react-table';
import { ArrowUpDown, ChevronDown, MoreHorizontal } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { useQuery } from 'convex/react';
import { useParams } from 'next/navigation';
import { api } from '../../../../convex/_generated/api';
import { toast } from 'sonner';
import UpdateQuantityForm from './UpdateQuantityForm';

export function CollectionTable() {
  const [activeSetNum, setActiveSetNum] = useState(null);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState({});
  const [filterColumn, setFilterColumn] = useState('name');
  const [filterValue, setFilterValue] = useState('');
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [rowSelection, setRowSelection] = useState({});
  const [selectedSetNum, setSelectedSetNum] = useState('');
  const [sorting, setSorting] = useState([]);

  const { collectionId } = useParams();

  const legoCollection = useQuery(
    api.collection.getLegoSetsForCollection,
    collectionId ? { collectionId } : null
  );

  const quantity = useQuery(
    api.collection.getCollectionSetQuantities,
    collectionId ? { collectionId } : null
  );

  const quantityMap = useMemo(() => {
    if (!quantity || !Array.isArray(quantity)) return new Map();
    return new Map(quantity.map((q) => [q.setNum, q.quantity]));
  }, [quantity]);

  console.log('Quantity Map:', quantityMap);

  const mergedData = useMemo(() => {
    if (!legoCollection?.length || !quantity?.length) return [];
    return legoCollection.map((set) => {
      const setNum = set.set_num;
      const setQuantity = quantityMap.get(setNum) || 0;
      return { ...set, quantity: setQuantity };
    });
  }, [legoCollection, quantity, quantityMap]);

  console.log('Merged Data:', mergedData);
  console.log('Image URL:', mergedData[0]?.set_img_url);

  const removeSetFromCollection = useMutation(
    api.collection.removeSetFromCollection
  );

  const onFilterChange = (event) => {
    const value = event.target.value;
    setFilterValue(value);
    table.getColumn(filterColumn)?.setFilterValue(value);
  };

  const handleSetDelete = async (setNum) => {
    try {
      await removeSetFromCollection({ setNum, collectionId });
    } catch (error) {
      toast.error('Something went wrong ', error);
    }
  };

  const table = useReactTable({
    data: mergedData,
    columns: [
      //TODO: Add back in and figure out multiple selection options
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
            className="block w-20 h-auto"
          >
            <img
              key={row.getValue('set_img_url')}
              src={row.getValue('set_img_url')}
              alt="LEGO set"
              className="w-20 h-auto rounded"
              onError={() =>
                console.log('Image failed to load for', row.getValue('set_num'))
              }
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
      },
      {
        accessorKey: 'inventory',
        header: 'Inventory',
        cell: ({ row }) => {
          const setNum = row.original.set_num;
          const setQuantity = quantityMap.get(setNum) || 0;
          return <div className="text-center">{setQuantity}</div>;
        }
      },
      {
        id: 'actions',
        enableHiding: false,
        cell: ({ row }) => {
          const payment = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 sm:w-auto">
                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleSetDelete(row.getValue('set_num'))}
                >
                  Delete from Collection
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    // Set activeSetNum to the setNum of the current row
                    setActiveSetNum(row.getValue('set_num'));
                  }}
                >
                  Update Quantity
                </DropdownMenuItem>
              </DropdownMenuContent>

              {/* Render UpdateQuantityForm only when a row is selected */}
              {activeSetNum === row.getValue('set_num') && (
                <UpdateQuantityForm
                  setNum={row.getValue('set_num')}
                  collectionId={collectionId}
                  onClose={() => setActiveSetNum(null)}
                />
              )}
            </DropdownMenu>
          );
        }
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
      <div className="flex flex-col sm:flex-row sm:items-center py-4 gap-4">
        <div className="flex flex-wrap gap-4 sm:gap-8">
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
          <Input
            placeholder={`Filter sets by ${
              filterColumn === 'name' ? 'name' : 'number'
            }...`}
            value={filterValue}
            onChange={onFilterChange}
            className="max-w-xs sm:max-w-md"
          />
        </div>

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
      <div className="rounded-md border overflow-x-auto">
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
                <TableCell colSpan={12} className="h-24 text-center">
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
