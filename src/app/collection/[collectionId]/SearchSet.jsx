import { useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '../../../../convex/_generated/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ChevronDown } from 'lucide-react';
import { useParams } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { fetchLegoSets } from '@/lib/fetchers';

export const SearchSet = () => {
  const [filterColumn, setFilterColumn] = useState('name'); // Default to searching by name
  const [filterValue, setFilterValue] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const resultsPerPage = 5;
  const params = useParams();
  const collectionId = params.collectionId;
  console.log('Collection Id:', collectionId);
  const user = useAuth();
  const userId = user.userId;

  const addSetToDB = useMutation(api.collection.addSetToDB);

  const fetchSets = async () => {
    if (!filterValue) return;
    setIsLoading(true);
    try {
      const data = await fetchLegoSets(filterValue, filterColumn);
      console.log('API Response Data:', data);
      setSearchResults(data?.results || []);
      setCurrentPage(1);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const totalPages = Math.ceil(searchResults.length / resultsPerPage);
  const startIdx = (currentPage - 1) * resultsPerPage;
  const currentResults = searchResults.slice(
    startIdx,
    startIdx + resultsPerPage
  );

  const addSetToCollection = async (set, collectionId) => {
    console.log('Collection Id:', collectionId);
    addSetToDB({
      ownerId: userId,
      name: set.name,
      num_parts: set.num_parts,
      set_img_url: set.set_img_url,
      set_num: set.set_num,
      set_url: set.set_url,
      theme_id: set.theme_id,
      year: set.year,
      collectionId,
    });
    setIsOpen(false);
    setFilterValue('');
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      fetchSets();
    }
  };

  return (
    <div>
      <Dialog
        open={isOpen}
        onOpenChange={(open) => {
          setIsOpen(open);
          if (!open) {
            setFilterValue('');
            setSearchResults([]);
          }
        }}
      >
        <DialogTrigger asChild>
          <div className="flex justify-end">
            <Button className="bg-blue-900 hover:bg-blue-500 cursor-pointer">
              Add a set
            </Button>
          </div>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Search for a LEGO Set</DialogTitle>
          </DialogHeader>
          {/* Search Type Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                {filterColumn === 'name'
                  ? 'Search by Set Name'
                  : 'Search by Set Number'}
                <ChevronDown />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setFilterColumn('name')}>
                Search by Set Name
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterColumn('set_num')}>
                Search by Set Number
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Search Input */}
          <Input
            className="max-w-sm"
            onChange={(e) => setFilterValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Search by ${filterColumn === 'set_num' ? 'Set Number' : 'Set Name'}`}
            value={filterValue}
          />
          <Button
            onClick={fetchSets}
            disabled={isLoading}
            className="bg-blue-900 hover:bg-blue-500 cursor-pointer"
          >
            {isLoading ? 'Searching...' : 'Search'}
          </Button>

          {/* Search Results */}
          <div className="mt-4">
            {isLoading && <p>Loading...</p>}
            {Array.isArray(currentResults) && currentResults.length > 0 ? (
              <ul>
                {currentResults.map((set) => (
                  <li
                    key={set.set_num}
                    className="flex items-center justify-between p-2 border-b"
                  >
                    <div>
                      <p className="font-bold">{set.name}</p>
                      <p className="text-sm text-gray-500">
                        Set #: {set.set_num}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        className="bg-green-600 hover:bg-green-500"
                        onClick={() => {
                          addSetToCollection(set, collectionId);
                          setIsOpen(false);
                        }}
                      >
                        Add
                      </Button>
                      <Button className="bg-gray-500 hover:bg-gray-400">
                        <a href={set.set_url} target="_blank" rel="noreferrer">
                          View set
                        </a>
                      </Button>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              !isLoading && <p>No results found</p>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <Button
                variant="outline"
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <span>
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SearchSet;
